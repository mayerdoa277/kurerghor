import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getRedisClient } from '../config/redis.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.email} connected`);

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`);

    // Join vendor to their vendor room if they are a vendor
    if (socket.user.role === 'vendor') {
      socket.join(`vendor:${socket.user._id}`);
    }

    // Join admin to admin room if they are admin
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    // Handle stock updates
    socket.on('subscribe:product', (productId) => {
      socket.join(`product:${productId}`);
    });

    socket.on('unsubscribe:product', (productId) => {
      socket.leave(`product:${productId}`);
    });

    // Handle order updates
    socket.on('subscribe:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('unsubscribe:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.email} disconnected`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitStockUpdate = (productId, stockData) => {
  if (io) {
    io.to(`product:${productId}`).emit('stock:update', {
      productId,
      ...stockData,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitOrderUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order:${orderId}`).emit('order:update', {
      orderId,
      ...orderData,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitVendorNotification = (vendorId, notification) => {
  if (io) {
    io.to(`vendor:${vendorId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitAdminNotification = (notification) => {
  if (io) {
    io.to('admin').emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitFlashSaleUpdate = (flashSaleData) => {
  if (io) {
    io.emit('flashsale:update', {
      ...flashSaleData,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitNewOrder = (orderData) => {
  if (io) {
    // Notify admin
    io.to('admin').emit('new:order', {
      ...orderData,
      timestamp: new Date().toISOString()
    });

    // Notify vendor if order contains their products
    if (orderData.vendorId) {
      io.to(`vendor:${orderData.vendorId}`).emit('new:order', {
        ...orderData,
        timestamp: new Date().toISOString()
      });
    }
  }
};

export const emitProductUpdate = (productId, productData) => {
  if (io) {
    io.to(`product:${productId}`).emit('product:update', {
      productId,
      ...productData,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitSystemNotification = (notification) => {
  if (io) {
    io.emit('system:notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};
