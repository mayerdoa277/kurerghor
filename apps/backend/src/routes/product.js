import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize, optionalAuth } from '../middlewares/auth.js';
import { validate, createProductSchema, updateProductSchema } from '../utils/validation.js';
import { getCache, setCache, deleteCachePattern } from '../config/redis.js';
import { handleImageUpload, handleMultipleImageUpload } from '../middlewares/uploadMiddleware.js';
import { getDefaultUploadService } from '../services/uploadService.js';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'active', visibility: 'public' };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.vendor) {
      query.vendor = req.query.vendor;
    }
    
    if (req.query.featured) {
      query.featured = true;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Check cache
    const cacheKey = `products:${JSON.stringify(query)}:${page}:${limit}`;
    let cachedProducts = await getCache(cacheKey);
    
    if (cachedProducts) {
      return res.json({
        success: true,
        data: cachedProducts
      });
    }

    const products = await Product.find(query)
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check cache
    const cacheKey = `product:${id}`;
    let cachedProduct = await getCache(cacheKey);
    
    if (cachedProduct) {
      // Increment view count asynchronously
      Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
      return res.json({
        success: true,
        data: cachedProduct
      });
    }

    const product = await Product.findById(id)
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .populate('reviews', 'rating title content user createdAt');

    if (!product || product.status !== 'active' || product.visibility !== 'public') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Cache result
    await setCache(cacheKey, product, 300); // 5 minutes

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private (Vendor/Admin)
router.post('/', protect, authorize('vendor', 'admin'), handleMultipleImageUpload, validate(createProductSchema), async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      vendor: req.user._id
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadService = await getDefaultUploadService();
      const uploadedImages = [];

      // Upload each image
      for (const file of req.files) {
        const uploadResult = await uploadService.uploadFile(
          file.buffer,
          file.originalname,
          'products'
        );
        
        uploadedImages.push({
          url: uploadResult.url,
          alt: req.body.imageAlt || productData.name,
          isMain: uploadedImages.length === 0 // First image is main
        });
      }

      productData.images = uploadedImages;
    }

    const product = await Product.create(productData);
    
    // Clear product cache
    await deleteCachePattern('products:*');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Vendor/Admin)
router.put('/:id', protect, authorize('vendor', 'admin'), handleMultipleImageUpload, validate(updateProductSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadService = await getDefaultUploadService();
      const uploadedImages = [];

      // Upload each new image
      for (const file of req.files) {
        const uploadResult = await uploadService.uploadFile(
          file.buffer,
          file.originalname,
          'products'
        );
        
        uploadedImages.push({
          url: uploadResult.url,
          alt: req.body.imageAlt || product.name,
          isMain: uploadedImages.length === 0 && (!product.images || product.images.length === 0)
        });
      }

      // Combine with existing images if any
      if (product.images && product.images.length > 0) {
        updateData.images = [...product.images, ...uploadedImages];
      } else {
        updateData.images = uploadedImages;
      }
    }

    product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    // Clear cache
    await deleteCachePattern('products:*');
    await deleteCachePattern(`product:${id}`);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Vendor/Admin)
router.delete('/:id', protect, authorize('vendor', 'admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Soft delete
    product.status = 'deleted';
    await product.save();

    // Clear cache
    await deleteCachePattern('products:*');
    await deleteCachePattern(`product:${id}`);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
router.get('/featured/list', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const cacheKey = `products:featured:${limit}`;
    let cachedProducts = await getCache(cacheKey);
    
    if (cachedProducts) {
      return res.json({
        success: true,
        data: cachedProducts
      });
    }

    const products = await Product.find({ 
      featured: true, 
      status: 'active', 
      visibility: 'public' 
    })
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Cache result
    await setCache(cacheKey, products, 600); // 10 minutes

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get flash sale products
// @route   GET /api/v1/products/flash-sale
// @access  Public
router.get('/flash-sale/list', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const cacheKey = `products:flash-sale:${limit}`;
    let cachedProducts = await getCache(cacheKey);
    
    if (cachedProducts) {
      return res.json({
        success: true,
        data: cachedProducts
      });
    }

    const now = new Date();
    const products = await Product.find({ 
      'flashSale.enabled': true,
      'flashSale.startDate': { $lte: now },
      'flashSale.endDate': { $gte: now },
      status: 'active',
      visibility: 'public'
    })
      .populate('vendor', 'name')
      .populate('category', 'name slug')
      .sort({ 'flashSale.endDate': 1 })
      .limit(limit);

    // Cache result
    await setCache(cacheKey, products, 60); // 1 minute (flash sales change frequently)

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get vendor products
// @route   GET /api/v1/products/vendor/:vendorId
// @access  Public
router.get('/vendor/:vendorId', optionalAuth, async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { 
      vendor: vendorId, 
      status: 'active', 
      visibility: 'public' 
    };

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
