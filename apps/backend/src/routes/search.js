import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { optionalAuth } from '../middlewares/auth.js';
import { getCache, setCache } from '../config/redis.js';

const router = express.Router();

// @desc    Search products
// @route   GET /api/v1/search/products
// @access  Public
router.get('/products', optionalAuth, async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    const query = { status: 'active', visibility: 'public' };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: parseFloat(rating) };
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { soldCount: -1 };
        break;
      case 'relevance':
      default:
        sort = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
        break;
    }

    // Check cache
    const cacheKey = `search:products:${JSON.stringify(query)}:${sortBy}:${page}:${limit}`;
    let cachedResults = await getCache(cacheKey);
    
    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults
      });
    }

    const products = await Product.find(query)
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    const result = {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        query: q,
        category,
        priceRange: { min: minPrice, max: maxPrice },
        rating,
        sortBy
      }
    };

    // Cache result
    await setCache(cacheKey, result, 300); // 5 minutes

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get search suggestions
// @route   GET /api/v1/search/suggestions
// @access  Public
router.get('/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Check cache
    const cacheKey = `search:suggestions:${q}`;
    let cachedSuggestions = await getCache(cacheKey);
    
    if (cachedSuggestions) {
      return res.json({
        success: true,
        data: cachedSuggestions
      });
    }

    // Get product name suggestions
    const productSuggestions = await Product.find({
      status: 'active',
      visibility: 'public',
      name: { $regex: q, $options: 'i' }
    })
      .select('name')
      .limit(5);

    // Get category suggestions
    const categorySuggestions = await Category.find({
      isActive: true,
      name: { $regex: q, $options: 'i' }
    })
      .select('name slug')
      .limit(3);

    const suggestions = {
      products: productSuggestions.map(p => p.name),
      categories: categorySuggestions.map(c => ({
        name: c.name,
        slug: c.slug,
        type: 'category'
      }))
    };

    // Cache result
    await setCache(cacheKey, suggestions, 600); // 10 minutes

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get popular searches
// @route   GET /api/v1/search/popular
// @access  Public
router.get('/popular', async (req, res, next) => {
  try {
    // Check cache
    const cacheKey = 'search:popular';
    let cachedPopular = await getCache(cacheKey);
    
    if (cachedPopular) {
      return res.json({
        success: true,
        data: cachedPopular
      });
    }

    // Get top selling products
    const popularProducts = await Product.find({
      status: 'active',
      visibility: 'public',
      soldCount: { $gt: 0 }
    })
      .sort({ soldCount: -1 })
      .limit(10)
      .select('name soldCount');

    // Get top rated products
    const topRatedProducts = await Product.find({
      status: 'active',
      visibility: 'public',
      'ratings.count': { $gt: 0 }
    })
      .sort({ 'ratings.average': -1 })
      .limit(10)
      .select('name ratings');

    // Get featured categories
    const featuredCategories = await Category.find({
      isActive: true,
      level: 0
    })
      .sort({ sortOrder: 1 })
      .limit(8)
      .select('name slug image');

    const popular = {
      products: popularProducts.map(p => ({
        name: p.name,
        soldCount: p.soldCount
      })),
      topRated: topRatedProducts.map(p => ({
        name: p.name,
        rating: p.ratings.average
      })),
      categories: featuredCategories
    };

    // Cache result
    await setCache(cacheKey, popular, 1800); // 30 minutes

    res.json({
      success: true,
      data: popular
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Advanced search with filters
// @route   POST /api/v1/search/advanced
// @access  Public
router.post('/advanced', optionalAuth, async (req, res, next) => {
  try {
    const {
      query,
      filters,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build advanced search query
    const searchQuery = { status: 'active', visibility: 'public' };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Apply filters
    if (filters) {
      // Category filters
      if (filters.categories && filters.categories.length > 0) {
        searchQuery.category = { $in: filters.categories };
      }

      // Price range
      if (filters.priceRange) {
        searchQuery.price = {};
        if (filters.priceRange.min) {
          searchQuery.price.$gte = parseFloat(filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          searchQuery.price.$lte = parseFloat(filters.priceRange.max);
        }
      }

      // Rating filter
      if (filters.rating) {
        searchQuery['ratings.average'] = { $gte: parseFloat(filters.rating) };
      }

      // Brand filter
      if (filters.brands && filters.brands.length > 0) {
        searchQuery.brand = { $in: filters.brands };
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        searchQuery.tags = { $in: filters.tags };
      }

      // Vendor filter
      if (filters.vendors && filters.vendors.length > 0) {
        searchQuery.vendor = { $in: filters.vendors };
      }

      // Featured filter
      if (filters.featured) {
        searchQuery.featured = true;
      }

      // Flash sale filter
      if (filters.flashSale) {
        searchQuery['flashSale.enabled'] = true;
        searchQuery['flashSale.startDate'] = { $lte: new Date() };
        searchQuery['flashSale.endDate'] = { $gte: new Date() };
      }
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { soldCount: -1 };
        break;
      case 'relevance':
      default:
        sort = query ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
        break;
    }

    const products = await Product.find(searchQuery)
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(searchQuery);

    const result = {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      query,
      filters,
      sortBy
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
