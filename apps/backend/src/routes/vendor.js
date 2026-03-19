import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middlewares/auth.js';
import { deleteCachePattern } from '../config/redis.js';

const router = express.Router();

// @desc    Request vendor account
// @route   POST /api/v1/vendors/request
// @access  Private
router.post('/request', protect, async (req, res, next) => {
  try {
    const { shopName, shopDescription, shopAddress, shopPhone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user.vendorRequest.requested) {
      return res.status(400).json({
        success: false,
        error: 'Vendor request already submitted'
      });
    }
    
    user.vendorRequest = {
      requested: true,
      approved: false,
      rejected: false,
      shopName,
      shopDescription,
      shopAddress,
      shopPhone,
      requestedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Vendor request submitted successfully',
      data: user.vendorRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get vendor dashboard stats
// @route   GET /api/v1/vendors/dashboard
// @access  Private (Vendor)
router.get('/dashboard', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    
    // Get products count
    const totalProducts = await Product.countDocuments({ vendor: vendorId });
    const activeProducts = await Product.countDocuments({ 
      vendor: vendorId, 
      status: 'active' 
    });
    
    // Get orders
    const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
    const productIds = vendorProducts.map(p => p._id);
    
    const totalOrders = await Order.countDocuments({ 
      'items.product': { $in: productIds } 
    });
    
    const pendingOrders = await Order.countDocuments({ 
      'items.product': { $in: productIds },
      status: 'pending'
    });
    
    const processingOrders = await Order.countDocuments({ 
      'items.product': { $in: productIds },
      status: 'processing'
    });
    
    // Calculate revenue
    const orders = await Order.find({ 
      'items.product': { $in: productIds },
      paymentStatus: 'paid'
    });
    
    const totalRevenue = orders.reduce((sum, order) => {
      const vendorItems = order.items.filter(item => 
        productIds.includes(item.product.toString())
      );
      const vendorTotal = vendorItems.reduce((itemSum, item) => itemSum + item.total, 0);
      return sum + vendorTotal;
    }, 0);
    
    // Get recent orders
    const recentOrders = await Order.find({ 
      'items.product': { $in: productIds }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get top products
    const topProducts = await Product.find({ vendor: vendorId })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name price soldCount ratings');
    
    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders,
          pendingOrders,
          processingOrders,
          totalRevenue
        },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get vendor products
// @route   GET /api/v1/vendors/products
// @access  Private (Vendor)
router.get('/products', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const query = { vendor: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const products = await Product.find(query)
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

// @desc    Get vendor orders
// @route   GET /api/v1/vendors/orders
// @access  Private (Vendor)
router.get('/orders', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    
    // Get vendor's products
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);
    
    const query = { 'items.product': { $in: productIds } };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name sku images')
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

// @desc    Get vendor earnings
// @route   GET /api/v1/vendors/earnings
// @access  Private (Vendor)
router.get('/earnings', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get vendor's products
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {
      'items.product': { $in: productIds },
      paymentStatus: 'paid'
    };
    
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
    
    // Calculate earnings
    let totalEarnings = 0;
    const earningsByDate = {};
    
    orders.forEach(order => {
      const vendorItems = order.items.filter(item => 
        productIds.includes(item.product.toString())
      );
      
      const orderEarnings = vendorItems.reduce((sum, item) => sum + item.total, 0);
      totalEarnings += orderEarnings;
      
      const date = order.createdAt.toISOString().split('T')[0];
      if (!earningsByDate[date]) {
        earningsByDate[date] = 0;
      }
      earningsByDate[date] += orderEarnings;
    });
    
    // Convert to array for chart
    const earningsData = Object.entries(earningsByDate).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: {
        totalEarnings,
        earningsData,
        totalOrders: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update vendor profile
// @route   PUT /api/v1/vendors/profile
// @access  Private (Vendor)
router.put('/profile', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const { shopName, shopDescription, shopAddress, shopPhone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    user.vendorRequest.shopName = shopName;
    user.vendorRequest.shopDescription = shopDescription;
    user.vendorRequest.shopAddress = shopAddress;
    user.vendorRequest.shopPhone = shopPhone;
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        vendorRequest: user.vendorRequest
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes for vendor management
// @desc    Get all vendor requests
// @route   GET /api/v1/vendors/requests
// @access  Private (Admin)
router.get('/requests', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const query = { 'vendorRequest.requested': true };
    
    if (status === 'pending') {
      query['vendorRequest.approved'] = false;
      query['vendorRequest.rejected'] = false;
    } else if (status === 'approved') {
      query['vendorRequest.approved'] = true;
    } else if (status === 'rejected') {
      query['vendorRequest.rejected'] = true;
    }
    
    const users = await User.find(query)
      .select('name email vendorRequest')
      .sort({ 'vendorRequest.requestedAt': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        requests: users,
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

// @desc    Approve vendor request
// @route   PUT /api/v1/vendors/:userId/approve
// @access  Private (Admin)
router.put('/:userId/approve', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user || !user.vendorRequest.requested) {
      return res.status(404).json({
        success: false,
        error: 'Vendor request not found'
      });
    }
    
    user.vendorRequest.approved = true;
    user.vendorRequest.rejected = false;
    user.vendorRequest.reviewedAt = new Date();
    user.vendorRequest.reviewedBy = req.user._id;
    user.role = 'vendor';
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        user,
        message: 'Vendor request approved'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject vendor request
// @route   PUT /api/v1/vendors/:userId/reject
// @access  Private (Admin)
router.put('/:userId/reject', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user || !user.vendorRequest.requested) {
      return res.status(404).json({
        success: false,
        error: 'Vendor request not found'
      });
    }
    
    user.vendorRequest.approved = false;
    user.vendorRequest.rejected = true;
    user.vendorRequest.reviewedAt = new Date();
    user.vendorRequest.reviewedBy = req.user._id;
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        user,
        message: 'Vendor request rejected'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
