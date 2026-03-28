import VendorRequest from '../models/VendorRequest.js';
import User from '../models/User.js';
import { setCache, deleteCache } from '../config/redis.js';

// @desc    Request vendor access
// @route   POST /api/v1/users/request-vendor
// @access  Private (user only)
export const requestVendorAccess = async (req, res, next) => {
  try {
    const {
      shopName,
      shopDescription,
      shopAddress,
      shopPhone,
      shopEmail,
      businessType = 'individual',
      taxId,
      documents = []
    } = req.body;

    // Check if user is already a vendor or admin
    if (['vendor', 'admin'].includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        error: 'You are already registered as a vendor or admin'
      });
    }

    // Check if user already has a pending request
    const existingRequest = await VendorRequest.findOne({
      user: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending vendor request'
      });
    }

    // Check if user was previously rejected
    const rejectedRequest = await VendorRequest.findOne({
      user: req.user._id,
      status: 'rejected'
    }).sort({ createdAt: -1 });

    if (rejectedRequest) {
      const daysSinceRejection = Math.floor(
        (Date.now() - rejectedRequest.createdAt) / (1000 * 60 * 60 * 24)
      );
      
      // Require 1 day between requests after rejection
      if (daysSinceRejection < 1) {
        return res.status(400).json({
          success: false,
          error: `You must wait ${1 - daysSinceRejection} days before submitting a new request`
        });
      }
    }

    // Create vendor request
    const vendorRequest = await VendorRequest.create({
      user: req.user._id,
      shopName,
      shopDescription,
      shopAddress,
      shopPhone,
      shopEmail,
      businessType,
      taxId,
      documents
    });

    // Update user's vendor request status
    req.user.vendorRequest = {
      requested: true,
      approved: false,
      rejected: false,
      shopName,
      shopDescription,
      shopAddress,
      shopPhone,
      requestedAt: new Date()
    };
    await req.user.save();

    // Cache user data
    await setCache(`user:${req.user._id}`, req.user.toJSON(), 3600);

    res.status(201).json({
      success: true,
      message: 'Vendor request submitted successfully. Please wait for admin approval.',
      data: {
        request: vendorRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's vendor request status
// @route   GET /api/v1/users/vendor-request-status
// @access  Private
export const getVendorRequestStatus = async (req, res, next) => {
  try {
    const vendorRequest = await VendorRequest.findOne({
      user: req.user._id
    }).populate('reviewedBy', 'name email');

    if (!vendorRequest) {
      return res.json({
        success: true,
        data: {
          hasRequest: false,
          message: 'No vendor request found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasRequest: true,
        request: vendorRequest
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendor requests (admin only)
// @route   GET /api/v1/admin/vendor-requests
// @access  Private (admin only)
export const getAllVendorRequests = async (req, res, next) => {
  try {
    const {
      status = 'pending',
      page = 1,
      limit = 10,
      search = ''
    } = req.query;

    // Build query
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
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
};

// @desc    Get single vendor request (admin only)
// @route   GET /api/v1/admin/vendor-requests/:id
// @access  Private (admin only)
export const getVendorRequest = async (req, res, next) => {
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
};

// @desc    Approve vendor request (admin only)
// @route   PATCH /api/v1/admin/vendor-requests/:id/approve
// @access  Private (admin only)
export const approveVendorRequest = async (req, res, next) => {
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

      // Clear user cache
      await deleteCache(`user:${user._id}`);
    }

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
};

// @desc    Reject vendor request (admin only)
// @route   PATCH /api/v1/admin/vendor-requests/:id/reject
// @access  Private (admin only)
export const rejectVendorRequest = async (req, res, next) => {
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

      // Clear user cache
      await deleteCache(`user:${user._id}`);
    }

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
};

// @desc    Get vendor request statistics (admin only)
// @route   GET /api/v1/admin/vendor-requests/stats
// @access  Private (admin only)
export const getVendorRequestStats = async (req, res, next) => {
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
};
