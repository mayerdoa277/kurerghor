import express from 'express';

import User from '../models/User.js';

import Product from '../models/Product.js';

import Order from '../models/Order.js';

import Category from '../models/Category.js';

import Coupon from '../models/Coupon.js';

import VendorRequest from '../models/VendorRequest.js';

import { protect, authorize } from '../middlewares/auth.js';

import { deleteCachePattern } from '../config/redis.js';

import { handleCategoryImageUpload } from '../middlewares/categoryUpload.js';

import { handleMultipleImageUpload } from '../middlewares/uploadMiddleware.js';

import { validate, createProductSchema } from '../utils/validation.js';

import { getDefaultUploadService } from '../services/uploadService.js';

import { ImageKitService } from '../services/imagekitService.js';

import { emitVendorUpdate, emitUploadProgress } from '../sockets/socketHandler.js';



const router = express.Router();



// All routes are protected and require admin role

router.use(protect);

router.use(authorize('admin'));



// @desc    Get admin dashboard stats

// @route   GET /api/v1/admin/dashboard

// @access  Private (Admin)

router.get('/dashboard', async (req, res, next) => {

  try {

    // User stats

    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({ isActive: true });

    const vendorRequests = await VendorRequest.countDocuments({ status: 'pending' });

    const totalVendors = await User.countDocuments({ role: 'vendor' });



    // Product stats

    const totalProducts = await Product.countDocuments();

    const activeProducts = await Product.countDocuments({ status: 'active' });

    const draftProducts = await Product.countDocuments({ status: 'draft' });



    // Order stats

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const processingOrders = await Order.countDocuments({ status: 'processing' });

    const completedOrders = await Order.countDocuments({ status: 'delivered' });



    // Revenue stats

    const paidOrders = await Order.find({ paymentStatus: 'paid' });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);



    // Recent orders

    const recentOrders = await Order.find()

      .populate('user', 'name email')

      .sort({ createdAt: -1 })

      .limit(10);



    // Top products

    const topProducts = await Product.find()

      .sort({ soldCount: -1 })

      .limit(10)

      .populate('vendor', 'name')

      .select('name price soldCount vendor');



    // Revenue by month (last 6 months)

    const sixMonthsAgo = new Date();

    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);



    const monthlyRevenue = await Order.aggregate([

      {

        $match: {

          paymentStatus: 'paid',

          createdAt: { $gte: sixMonthsAgo }

        }

      },

      {

        $group: {

          _id: {

            year: { $year: '$createdAt' },

            month: { $month: '$createdAt' }

          },

          revenue: { $sum: '$total' },

          orders: { $sum: 1 }

        }

      },

      {

        $sort: { '_id.year': 1, '_id.month': 1 }

      }

    ]);



    res.json({

      success: true,

      data: {

        stats: {

          users: {

            total: totalUsers,

            active: activeUsers,

            vendorRequests,

            vendors: totalVendors

          },

          products: {

            total: totalProducts,

            active: activeProducts,

            draft: draftProducts

          },

          orders: {

            total: totalOrders,

            pending: pendingOrders,

            processing: processingOrders,

            completed: completedOrders

          },

          revenue: {

            total: totalRevenue,

            monthly: monthlyRevenue

          }

        },

        recentOrders,

        topProducts

      }

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get all users

// @route   GET /api/v1/admin/users

// @access  Private (Admin)

router.get('/users', async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;



    const { role, status, search } = req.query;

    const query = {};



    if (role) query.role = role;

    if (status === 'active') query.isActive = true;

    if (status === 'inactive') query.isActive = false;

    if (search) {

      query.$or = [

        { name: { $regex: search, $options: 'i' } },

        { email: { $regex: search, $options: 'i' } }

      ];

    }



    const users = await User.find(query)

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);



    const total = await User.countDocuments(query);



    res.json({

      success: true,

      data: {

        users,

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



// @desc    Get user by ID

// @route   GET /api/v1/admin/users/:id

// @access  Private (Admin)

router.get('/users/:id', async (req, res, next) => {

  try {

    const { id } = req.params;



    const user = await User.findById(id);



    if (!user) {

      return res.status(404).json({

        success: false,

        error: 'User not found'

      });

    }



    res.json({

      success: true,

      data: user

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Update user

// @route   PUT /api/v1/admin/users/:id

// @access  Private (Admin)

router.put('/users/:id', async (req, res, next) => {

  try {

    const { id } = req.params;

    const { name, email, role, isActive } = req.body;



    const user = await User.findByIdAndUpdate(

      id,

      { name, email, role, isActive },

      { new: true, runValidators: true }

    );



    if (!user) {

      return res.status(404).json({

        success: false,

        error: 'User not found'

      });

    }



    res.json({

      success: true,

      data: user

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Toggle user status

// @route   PATCH /api/v1/admin/users/:id/toggle-status

// @access  Private (Admin)

router.patch('/users/:id/toggle-status', async (req, res, next) => {

  try {

    const { id } = req.params;



    const user = await User.findById(id);



    if (!user) {

      return res.status(404).json({

        success: false,

        error: 'User not found'

      });

    }



    user.isActive = !user.isActive;

    await user.save();



    res.json({

      success: true,

      data: user

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Update user status

// @route   PUT /api/v1/admin/users/:userId/status

// @access  Private (Admin)

router.put('/users/:userId/status', async (req, res, next) => {

  try {

    const { userId } = req.params;

    const { isActive } = req.body;



    const user = await User.findByIdAndUpdate(

      userId,

      { isActive },

      { new: true, runValidators: true }

    );



    if (!user) {

      return res.status(404).json({

        success: false,

        error: 'User not found'

      });

    }



    res.json({

      success: true,

      data: user

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get all products (admin view)

// @route   GET /api/v1/admin/products

// @access  Private (Admin)

router.get('/products', async (req, res, next) => {

  try {

    console.log('🔍 Admin products query params:', req.query);

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;



    const { status, vendor, category, search } = req.query;

    const query = {};



    if (status) query.status = status;

    if (vendor) query.vendor = vendor;

    if (category) query.category = category;

    if (search) {

      query.$text = { $search: search };

    }

    console.log('🔍 Admin products query:', query);



    const products = await Product.find(query)

      .populate('vendor', 'name email')

      .populate('category', 'name')

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);

    console.log('🔍 Found products:', products.length);



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



// @desc    Update product status (admin)

// @route   PUT /api/v1/admin/products/:productId/status

// @access  Private (Admin)

router.put('/products/:productId/status', async (req, res, next) => {

  try {

    const { productId } = req.params;

    const { status, featured } = req.body;



    const updateData = {};

    if (status) updateData.status = status;

    if (featured !== undefined) updateData.featured = featured;



    const product = await Product.findByIdAndUpdate(

      productId,

      updateData,

      { new: true, runValidators: true }

    );



    if (!product) {

      return res.status(404).json({

        success: false,

        error: 'Product not found'

      });

    }



    // Clear cache

    await deleteCachePattern('products:*');



    res.json({

      success: true,

      data: product

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get all orders (admin view)

// @route   GET /api/v1/admin/orders

// @access  Private (Admin)

router.get('/orders', async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;



    const { status, paymentStatus, search } = req.query;

    const query = {};



    if (status) query.status = status;

    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {

      query.$or = [

        { orderNumber: { $regex: search, $options: 'i' } },

        { 'shippingAddress.name': { $regex: search, $options: 'i' } }

      ];

    }



    const orders = await Order.find(query)

      .populate('user', 'name email')

      .populate('items.product', 'name')

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);



    const total = await Order.countDocuments(query);



    res.json({

      success: true,

      data: {

        orders,

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



// @desc    Get all categories

// @route   GET /api/v1/admin/categories

// @access  Private (Admin)

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name')
      .sort({ level: 1, sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('❌ Admin category listing error:', error);
    next(error);
  }
});



// @desc    Create category

// @route   POST /api/v1/admin/categories

// @access  Private (Admin)

router.post('/categories', handleCategoryImageUpload, async (req, res, next) => {
  try {
    const { name, slug, description, status, parentId } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required and must be a non-empty string'
      });
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category slug is required and must be a non-empty string'
      });
    }

    // Prepare category data
    const categoryData = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description ? description.trim() : '',
      status: status || 'active',
      parentId: parentId || null
    };

    // Upload image to ImageKit if provided
    if (req.file) {
      try {
        const imageKitService = new ImageKitService();

        // Try to upload directly without configuration check
        const uploadResult = await imageKitService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'categories',
          {
            fileType: 'image',
            tags: ['category', name.trim().toLowerCase()]
          }
        );

        categoryData.image = uploadResult.url;
        console.log('✅ Image uploaded to ImageKit:', uploadResult.url);
      } catch (uploadError) {
        console.error('❌ ImageKit upload failed:', uploadError.message);
        // Continue without image - don't fail the whole category creation
        categoryData.image = null;
      }
    }

    const category = await Category.create(categoryData);

    // Clear cache
    await deleteCachePattern('categories:*');

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('❌ Admin category creation error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    next(error);
  }
});

// @desc    Bulk delete categories
// @route   DELETE /api/v1/admin/categories/bulk
// @access  Private (Admin)
router.delete('/categories/bulk', async (req, res, next) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category IDs array is required'
      });
    }

    // Check if any category has children
    const categoriesWithChildren = await Category.find({
      parent: { $in: categoryIds },
      isActive: true
    });

    if (categoriesWithChildren.length > 0) {
      const parentIds = categoriesWithChildren.map(cat => cat._id.toString());
      return res.status(400).json({
        success: false,
        error: 'Cannot delete categories that have subcategories',
        data: {
          categoriesWithChildren: parentIds
        }
      });
    }

    // Soft delete all categories
    const result = await Category.updateMany(
      { _id: { $in: categoryIds } },
      { isActive: false }
    );

    // Clear cache
    await deleteCachePattern('categories:*');

    res.json({
      success: true,
      message: `${result.modifiedCount} categories deleted successfully`,
      data: {
        deletedCount: result.modifiedCount,
        requestedCount: categoryIds.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update category
// @route   PUT /api/v1/admin/categories/:id
// @access  Private (Admin)
router.put('/categories/:id', handleCategoryImageUpload, async (req, res, next) => {
  try {
    const { id } = req.params;

    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const updateData = { ...req.body };

    // Upload image to ImageKit if provided
    if (req.file) {
      try {
        const imageKitService = new ImageKitService();

        // Try to upload directly without configuration check
        const uploadResult = await imageKitService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'categories',
          {
            fileType: 'image',
            tags: ['category', req.body.name?.trim().toLowerCase()]
          }
        );

        updateData.image = uploadResult.url;
        console.log('✅ Image uploaded to ImageKit:', uploadResult.url);
      } catch (uploadError) {
        console.error('❌ ImageKit upload failed:', uploadError.message);
        // Continue without image - don't fail the whole category update
        // Keep existing image if upload fails
      }
    }

    category = await Category.findByIdAndUpdate(id, updateData, {
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
    console.error('❌ Admin category update error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    next(error);
  }
});



// @desc    Get all coupons

// @route   GET /api/v1/admin/coupons

// @access  Private (Admin)

router.get('/coupons', async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;



    const { status, search } = req.query;

    const query = {};



    if (status === 'active') query.isActive = true;

    if (status === 'inactive') query.isActive = false;

    if (search) {

      query.$or = [

        { code: { $regex: search, $options: 'i' } },

        { name: { $regex: search, $options: 'i' } }

      ];

    }



    const coupons = await Coupon.find(query)

      .populate('createdBy', 'name')

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);



    const total = await Coupon.countDocuments(query);



    res.json({

      success: true,

      data: {

        coupons,

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



// @desc    Create coupon

// @route   POST /api/v1/admin/coupons

// @access  Private (Admin)

router.post('/coupons', async (req, res, next) => {

  try {

    const couponData = {

      ...req.body,

      createdBy: req.user._id

    };



    const coupon = await Coupon.create(couponData);



    res.status(201).json({

      success: true,

      data: coupon

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Update coupon

// @route   PUT /api/v1/admin/coupons/:couponId

// @access  Private (Admin)

router.put('/coupons/:couponId', async (req, res, next) => {

  try {

    const { couponId } = req.params;



    const coupon = await Coupon.findByIdAndUpdate(

      couponId,

      req.body,

      { new: true, runValidators: true }

    );



    if (!coupon) {

      return res.status(404).json({

        success: false,

        error: 'Coupon not found'

      });

    }



    res.json({

      success: true,

      data: coupon

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Delete coupon

// @route   DELETE /api/v1/admin/coupons/:couponId

// @access  Private (Admin)

router.delete('/coupons/:couponId', async (req, res, next) => {

  try {

    const { couponId } = req.params;



    const coupon = await Coupon.findById(couponId);



    if (!coupon) {

      return res.status(404).json({

        success: false,

        error: 'Coupon not found'

      });

    }



    await coupon.remove();



    res.json({

      success: true,

      message: 'Coupon deleted successfully'

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get analytics data

// @route   GET /api/v1/admin/analytics

// @access  Private (Admin)

router.get('/analytics', async (req, res, next) => {

  try {

    const { period = '30' } = req.query;

    const daysAgo = new Date();

    daysAgo.setDate(daysAgo.getDate() - parseInt(period));



    // Sales analytics

    const salesData = await Order.aggregate([

      {

        $match: {

          paymentStatus: 'paid',

          createdAt: { $gte: daysAgo }

        }

      },

      {

        $group: {

          _id: {

            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }

          },

          revenue: { $sum: '$total' },

          orders: { $sum: 1 }

        }

      },

      {

        $sort: { '_id.date': 1 }

      }

    ]);



    // Top categories

    const topCategories = await Order.aggregate([

      {

        $match: {

          paymentStatus: 'paid',

          createdAt: { $gte: daysAgo }

        }

      },

      {

        $lookup: {

          from: 'products',

          localField: 'items.product',

          foreignField: '_id',

          as: 'productDetails'

        }

      },

      {

        $unwind: '$items'

      },

      {

        $lookup: {

          from: 'categories',

          localField: 'items.product',

          foreignField: '_id',

          as: 'category'

        }

      },

      {

        $group: {

          _id: '$items.product',

          revenue: { $sum: '$items.total' },

          orders: { $sum: 1 }

        }

      },

      {

        $sort: { revenue: -1 }

      },

      {

        $limit: 10

      }

    ]);



    // User registration trends

    const userRegistrations = await User.aggregate([

      {

        $match: {

          createdAt: { $gte: daysAgo }

        }

      },

      {

        $group: {

          _id: {

            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }

          },

          users: { $sum: 1 }

        }

      },

      {

        $sort: { '_id.date': 1 }

      }

    ]);



    res.json({

      success: true,

      data: {

        salesData,

        topCategories,

        userRegistrations

      }

    });

  } catch (error) {

    next(error);

  }

});



// Vendor Request Management Routes

// @desc    Get all vendor requests

// @route   GET /api/v1/admin/vendor-requests

router.get('/vendor-requests', async (req, res, next) => {

  try {

    const {

      status = 'pending',

      page = 1,

      limit = 10,

      search = ''

    } = req.query;



    // Build query

    const query = {};



    // Only add status filter if it's not empty and not 'all'

    if (status && status !== 'all' && status !== '') {

      query.status = status;

    } else {

      // Default to pending if no status provided

      query.status = 'pending';

    }



    if (search) {

      query.$or = [

        { shopName: { $regex: search, $options: 'i' } },

        { shopEmail: { $regex: search, $options: 'i' } }

      ];

    }



    // Pagination

    const skip = (parseInt(page) - 1) * parseInt(limit);



    const vendorRequests = await VendorRequest.find(query)

      .populate('user', 'name email phone lastLogin')

      .populate('reviewedBy', 'name email')

      .sort({ requestedAt: -1 })

      .skip(skip)

      .limit(parseInt(limit));



    const total = await VendorRequest.countDocuments(query);



    res.json({

      success: true,

      data: {

        requests: vendorRequests,

        pagination: {

          page: parseInt(page),

          limit: parseInt(limit),

          total,

          pages: Math.ceil(total / parseInt(limit))

        }

      }

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get vendor request statistics

// @route   GET /api/v1/admin/vendor-requests/stats

router.get('/vendor-requests/stats', async (req, res, next) => {

  try {

    const stats = await VendorRequest.aggregate([

      {

        $group: {

          _id: '$status',

          count: { $sum: 1 }

        }

      }

    ]);



    const totalRequests = await VendorRequest.countDocuments();

    const thisMonth = await VendorRequest.countDocuments({

      requestedAt: {

        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      }

    });



    const formattedStats = stats.reduce((acc, stat) => {

      acc[stat._id] = stat.count;

      return acc;

    }, {});



    res.json({

      success: true,

      data: {

        total: totalRequests,

        thisMonth,

        pending: formattedStats.pending || 0,

        approved: formattedStats.approved || 0,

        rejected: formattedStats.rejected || 0

      }

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Get single vendor request

// @route   GET /api/v1/admin/vendor-requests/:id

router.get('/vendor-requests/:id', async (req, res, next) => {

  try {

    const { id } = req.params;



    const vendorRequest = await VendorRequest.findById(id)

      .populate('user', 'name email phone lastLogin addresses')

      .populate('reviewedBy', 'name email');



    if (!vendorRequest) {

      return res.status(404).json({

        success: false,

        error: 'Vendor request not found'

      });

    }



    res.json({

      success: true,

      data: {

        request: vendorRequest

      }

    });

  } catch (error) {

    next(error);

  }

});



// @desc    Approve vendor request

// @route   PATCH /api/v1/admin/vendor-requests/:id/approve

router.patch('/vendor-requests/:id/approve', async (req, res, next) => {

  try {

    const { id } = req.params;

    const { reviewNotes } = req.body;



    const vendorRequest = await VendorRequest.findById(id);

    if (!vendorRequest) {

      return res.status(404).json({

        success: false,

        error: 'Vendor request not found'

      });

    }



    if (vendorRequest.status !== 'pending') {

      return res.status(400).json({

        success: false,

        error: 'Request has already been processed'

      });

    }



    // Update vendor request

    vendorRequest.status = 'approved';

    vendorRequest.reviewedAt = new Date();

    vendorRequest.reviewedBy = req.user._id;

    vendorRequest.reviewNotes = reviewNotes;

    await vendorRequest.save();



    // Update user role to vendor

    const user = await User.findById(vendorRequest.user);

    if (user) {

      user.role = 'vendor';

      user.vendorRequest = {

        requested: true,

        approved: true,

        rejected: false,

        shopName: vendorRequest.shopName,

        shopDescription: vendorRequest.shopDescription,

        shopAddress: vendorRequest.shopAddress,

        shopPhone: vendorRequest.shopPhone,

        requestedAt: vendorRequest.requestedAt,

        reviewedAt: new Date(),

        reviewedBy: req.user._id

      };

      await user.save();

    }



    // Emit real-time vendor update to all admin clients
    emitVendorUpdate({
      type: 'vendor_approved',
      vendor: user,
      message: `New vendor "${user.name}" has been approved and added to the vendors list`
    });

    res.json({
      success: true,
      message: 'Vendor request approved successfully',
      data: {
        request: vendorRequest
      }
    });

  } catch (error) {

    next(error);

  }

});



// @desc    Reject vendor request

// @route   PATCH /api/v1/admin/vendor-requests/:id/reject

router.patch('/vendor-requests/:id/reject', async (req, res, next) => {

  try {

    const { id } = req.params;

    const { rejectionReason, reviewNotes } = req.body;



    if (!rejectionReason) {

      return res.status(400).json({

        success: false,

        error: 'Rejection reason is required'

      });

    }



    const vendorRequest = await VendorRequest.findById(id);

    if (!vendorRequest) {

      return res.status(404).json({

        success: false,

        error: 'Vendor request not found'

      });

    }



    if (vendorRequest.status !== 'pending') {

      return res.status(400).json({

        success: false,

        error: 'Request has already been processed'

      });

    }



    // Update vendor request

    vendorRequest.status = 'rejected';

    vendorRequest.reviewedAt = new Date();

    vendorRequest.reviewedBy = req.user._id;

    vendorRequest.reviewNotes = reviewNotes;

    vendorRequest.rejectionReason = rejectionReason;

    await vendorRequest.save();



    // Update user's vendor request status

    const user = await User.findById(vendorRequest.user);

    if (user) {

      user.vendorRequest = {

        requested: true,

        approved: false,

        rejected: true,

        shopName: vendorRequest.shopName,

        shopDescription: vendorRequest.shopDescription,

        shopAddress: vendorRequest.shopAddress,

        shopPhone: vendorRequest.shopPhone,

        requestedAt: vendorRequest.requestedAt,

        reviewedAt: new Date(),

        reviewedBy: req.user._id

      };

      await user.save();

    }

    // Emit real-time vendor update to all admin clients
    emitVendorUpdate({
      type: 'vendor_rejected',
      vendor: user,
      message: `Vendor request for "${user.name}" has been rejected`
    });

    res.json({
      success: true,
      message: 'Vendor request rejected successfully',
      data: {
        request: vendorRequest
      }
    });

  } catch (error) {

    next(error);

  }

});

// @desc    Get all vendors (admin view)
// @route   GET /api/v1/admin/vendors
// @access  Private (Admin)
router.get('/vendors', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { role: 'vendor' };


    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) {
      query.vendorRequest = {
        approved: req.query.status === 'approved'
      };
    }


    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin vendors listing error:', error);
    next(error);
  }
});

// @desc    Get single vendor
// @route   GET /api/v1/admin/vendors/:id
// @access  Private (Admin)
router.get('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
      .select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });

  } catch (error) {
    console.error('❌ Admin vendor details error:', error);
    next(error);
  }
});

// @desc    Update vendor
// @route   PUT /api/v1/admin/vendors/:id
// @access  Private (Admin)
router.put('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const allowedUpdates = ['name', 'email', 'vendorRequest.shopName', 'vendorRequest.shopDescription', 'vendorRequest.shopAddress', 'vendorRequest.shopPhone'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedVendor = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: updatedVendor
    });

  } catch (error) {
    console.error('❌ Admin vendor update error:', error);
    next(error);
  }
});

// @desc    Delete vendor
// @route   DELETE /api/v1/admin/vendors/:id
// @access  Private (Admin)
router.delete('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('❌ Admin vendor delete error:', error);
    next(error);
  }
});

// @desc    Toggle vendor status
// @route   PATCH /api/v1/admin/vendors/:id/toggle-status
// @access  Private (Admin)
router.patch('/vendors/:id/toggle-status', async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.json({
      success: true,
      data: vendor,
      message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('❌ Admin vendor status toggle error:', error);
    next(error);
  }
});

// @desc    Create product with async upload progress
// @route   POST /api/v1/admin/products
// @access  Private (Admin)
router.post('/products', protect, authorize('admin'), handleMultipleImageUpload, validate(createProductSchema), async (req, res, next) => {
  // Generate unique upload ID for progress tracking (moved outside try block)
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Start upload progress tracking
    const userId = 'user123'; // Use the same user ID as frontend WebSocket connection
    console.log('📡 Emitting upload progress to room:', `user:${userId}`, {
      uploadId,
      status: 'started',
      progress: 0,
      message: 'Initializing upload...',
      productName: req.body.name || 'Unknown Product'
    });
    emitUploadProgress(userId, {
      uploadId,
      status: 'started',
      progress: 0,
      message: 'Initializing upload...',
      productName: req.body.name || 'Unknown Product'
    })

    const productData = {
      ...req.body,
      vendor: req.user._id,
      uploadId
    }

    // Process images with progress updates
    if (req.files && req.files.length > 0) {
      const uploadService = await getDefaultUploadService()
      const uploadedImages = []

      // Emit progress for each image
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]

        // Update progress
        const progress = Math.round(((i + 1) / req.files.length) * 80) // 80% for images
        console.log(`📡 Emitting image upload progress (${i + 1}/${req.files.length}):`, `user:${userId}`, {
          uploadId,
          status: 'uploading',
          progress,
          message: `Uploading image ${i + 1} of ${req.files.length}...`,
          currentImage: i + 1,
          totalImages: req.files.length
        });
        emitUploadProgress(userId, {
          uploadId,
          status: 'uploading',
          progress,
          message: `Uploading image ${i + 1} of ${req.files.length}...`,
          currentImage: i + 1,
          totalImages: req.files.length
        })

        try {
          const uploadResult = await uploadService.uploadFile(
            file.buffer,
            file.originalname,
            'products'
          );

          uploadedImages.push({
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            altText: req.body.name || file.originalname
          })

          // Small delay to prevent overwhelming the client
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (uploadError) {
          console.error(`Error uploading image ${file.originalname}:`, uploadError)
          // Continue with other images even if one fails
        }
      }

      productData.images = uploadedImages
    }

    // Final processing
    emitUploadProgress(userId, {
      uploadId,
      status: 'processing',
      progress: 90,
      message: 'Finalizing product creation...'
    })

    const product = await Product.create(productData)

    // Clear product cache
    await deleteCachePattern('products:*');

    // Success notification
    emitUploadProgress(userId, {
      uploadId,
      status: 'completed',
      progress: 100,
      message: 'Product created successfully!',
      productId: product._id
    })

    res.status(201).json({
      success: true,
      data: {
        product,
        uploadId
      }
    })

  } catch (error) {
    console.error('Product creation error:', error)

    // Error notification
    const userId = 'user123'; // Use the same user ID as frontend WebSocket connection
    emitUploadProgress(userId, {
      uploadId,
      status: 'error',
      progress: 0,
      message: error.message || 'Failed to create product',
      error: error.message
    })

    next(error)
  }
});

export default router;
