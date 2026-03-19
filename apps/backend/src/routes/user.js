import express from 'express';
import { protect } from '../middlewares/auth.js';
import { validate, updateProfileSchema, changePasswordSchema } from '../utils/validation.js';
import User from '../models/User.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Change password
// @route   PUT /api/v1/users/password
// @access  Private
router.put('/password', validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add address
// @route   POST /api/v1/users/addresses
// @access  Private
router.post('/addresses', async (req, res, next) => {
  try {
    const { type, name, phone, address, city, postalCode, country, isDefault } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // If this is default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push({
      type,
      name,
      phone,
      address,
      city,
      postalCode,
      country,
      isDefault: isDefault || false
    });
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update address
// @route   PUT /api/v1/users/addresses/:addressId
// @access  Private
router.put('/addresses/:addressId', async (req, res, next) => {
  try {
    const { type, name, phone, address, city, postalCode, country, isDefault } = req.body;
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }
    
    // If this is default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type,
      name,
      phone,
      address,
      city,
      postalCode,
      country,
      isDefault: isDefault || false
    };
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete address
// @route   DELETE /api/v1/users/addresses/:addressId
// @access  Private
router.delete('/addresses/:addressId', async (req, res, next) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
router.get('/wishlist', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    
    res.json({
      success: true,
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add to wishlist
// @route   POST /api/v1/users/wishlist
// @access  Private
router.post('/wishlist', async (req, res, next) => {
  try {
    const { productId } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove from wishlist
// @route   DELETE /api/v1/users/wishlist/:productId
// @access  Private
router.delete('/wishlist/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
