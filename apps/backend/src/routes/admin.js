import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middlewares/auth.js';
import { deleteCachePattern } from '../config/redis.js';

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
    const vendorRequests = await User.countDocuments({ 
      'vendorRequest.requested': true,
      'vendorRequest.approved': false,
      'vendorRequest.rejected': false
    });
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
    
    const products = await Product.find(query)
      .populate('vendor', 'name email')
      .populate('category', 'name')
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
    const categories = await Category.find()
      .populate('parent', 'name')
      .sort({ level: 1, sortOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create category
// @route   POST /api/v1/admin/categories
// @access  Private (Admin)
router.post('/categories', async (req, res, next) => {
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

export default router;
