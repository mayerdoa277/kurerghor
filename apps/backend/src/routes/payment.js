import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middlewares/auth.js';
import axios from 'axios';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Initiate payment
// @route   POST /api/v1/payments/initiate
// @access  Private
router.post('/initiate', async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order already paid or payment processed'
      });
    }
    
    if (paymentMethod === 'aamarpay') {
      // Create aamarpay payment
      const paymentData = {
        store_id: process.env.AAMARPAY_STORE_ID,
        signature_key: process.env.AAMARPAY_SIGNATURE_KEY,
        tran_id: order.orderNumber,
        success_url: `${process.env.FRONTEND_URL}/payment/success`,
        fail_url: `${process.env.FRONTEND_URL}/payment/fail`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        amount: order.total.toString(),
        currency: 'BDT',
        desc: `Payment for order ${order.orderNumber}`,
        cus_name: order.shippingAddress.name,
        cus_email: req.user.email,
        cus_phone: order.shippingAddress.phone,
        cus_add1: order.shippingAddress.address,
        cus_city: order.shippingAddress.city,
        cus_country: order.shippingAddress.country,
        shipping_method: 'NO',
        multi_card_name: '',
        num_of_items: order.items.length.toString(),
        product_name: 'Ecommerce Purchase',
        product_category: 'Ecommerce',
        product_profile: 'general'
      };
      
      // In production, you would make actual API call to aamarpay
      // For now, return mock payment URL
      const paymentUrl = `${process.env.AAMARPAY_BASE_URL}/index.php`;
      
      res.json({
        success: true,
        data: {
          paymentUrl,
          paymentData,
          orderId: order._id
        }
      });
    } else {
      // For other payment methods (COD, Bank Transfer)
      order.paymentStatus = 'paid';
      order.status = 'paid';
      order.transactionId = `MANUAL_${Date.now()}`;
      await order.save();
      
      res.json({
        success: true,
        data: {
          message: 'Order placed successfully',
          order
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Payment success callback (IPN/Webhook)
// @route   POST /api/v1/payments/success
// @access  Public
router.post('/success', async (req, res, next) => {
  try {
    const { tran_id, amount, currency, status, signature } = req.body;
    
    // Verify signature (in production, you would verify with aamarpay)
    const isValidSignature = true; // Mock validation
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
    
    if (status === 'successful') {
      // Find and update order
      const order = await Order.findOne({ orderNumber: tran_id });
      
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'paid';
        order.transactionId = req.body.merchant_invoice || tran_id;
        await order.save();
      }
    }
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?order=${tran_id}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Payment fail callback
// @route   POST /api/v1/payments/fail
// @access  Public
router.post('/fail', async (req, res, next) => {
  try {
    const { tran_id } = req.body;
    
    // Find order and mark payment as failed
    const order = await Order.findOne({ orderNumber: tran_id });
    
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
    }
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail?order=${tran_id}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Payment cancel callback
// @route   POST /api/v1/payments/cancel
// @access  Public
router.post('/cancel', async (req, res, next) => {
  try {
    const { tran_id } = req.body;
    
    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel?order=${tran_id}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Manual payment verification (Admin)
// @route   POST /api/v1/payments/verify
// @access  Private (Admin)
router.post('/verify', protect, async (req, res, next) => {
  try {
    const { orderId, transactionId, amount } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order already paid'
      });
    }
    
    // Verify payment with gateway (mock implementation)
    const isVerified = true; // In production, verify with actual payment gateway
    
    if (isVerified && parseFloat(amount) === order.total) {
      order.paymentStatus = 'paid';
      order.status = 'paid';
      order.transactionId = transactionId;
      await order.save();
      
      res.json({
        success: true,
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get payment status
// @route   GET /api/v1/payments/status/:orderId
// @access  Private
router.get('/status/:orderId', protect, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status,
        total: order.total,
        transactionId: order.transactionId
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
