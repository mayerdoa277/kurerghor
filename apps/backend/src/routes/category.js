import express from 'express';
import Category from '../models/Category.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validate, createCategorySchema } from '../utils/validation.js';
import { getCache, setCache, deleteCachePattern } from '../config/redis.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const cacheKey = 'categories:all';
    let cachedCategories = await getCache(cacheKey);
    
    if (cachedCategories) {
      return res.json({
        success: true,
        data: cachedCategories
      });
    }

    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ level: 1, sortOrder: 1, name: 1 });

    // Cache result
    await setCache(cacheKey, categories, 1800); // 30 minutes

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const cacheKey = `category:${slug}`;
    let cachedCategory = await getCache(cacheKey);
    
    if (cachedCategory) {
      return res.json({
        success: true,
        data: cachedCategory
      });
    }

    const category = await Category.findOne({ slug, isActive: true })
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get children categories
    const children = await category.getChildren();
    
    const result = {
      ...category.toJSON(),
      children
    };

    // Cache result
    await setCache(cacheKey, result, 1800); // 30 minutes

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get category tree
// @route   GET /api/v1/categories/tree
// @access  Public
router.get('/tree/all', async (req, res, next) => {
  try {
    const cacheKey = 'categories:tree';
    let cachedTree = await getCache(cacheKey);
    
    if (cachedTree) {
      return res.json({
        success: true,
        data: cachedTree
      });
    }

    // Get root categories (level 0)
    const rootCategories = await Category.find({ 
      parent: null, 
      isActive: true 
    })
      .sort({ sortOrder: 1, name: 1 });

    // Build tree recursively
    const buildTree = async (categories) => {
      const tree = [];
      
      for (const category of categories) {
        const children = await Category.find({ 
          parent: category._id, 
          isActive: true 
        })
          .sort({ sortOrder: 1, name: 1 });
        
        const categoryData = category.toJSON();
        
        if (children.length > 0) {
          categoryData.children = await buildTree(children);
        }
        
        tree.push(categoryData);
      }
      
      return tree;
    };

    const tree = await buildTree(rootCategories);

    // Cache result
    await setCache(cacheKey, tree, 1800); // 30 minutes

    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validate(createCategorySchema), async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    
    // Clear cache
    await deleteCachePattern('categories:*');
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    // Clear cache
    await deleteCachePattern('categories:*');

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has children
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories'
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    // Clear cache
    await deleteCachePattern('categories:*');

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
