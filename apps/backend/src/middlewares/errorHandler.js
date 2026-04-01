import mongoose from 'mongoose';
import { envConfig } from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging
  console.error(`\n❌ Error [${new Date().toISOString()}]:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params,
    statusCode: err.statusCode || 500
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    let message = 'Duplicate field value entered';
    
    if (field === 'slug') {
      message = 'Product with this URL slug already exists. Please use a different product name or slug.';
    } else if (field === 'sku') {
      message = 'Product with this SKU already exists. Please use a different SKU.';
    } else if (field === 'email') {
      message = 'An account with this email already exists.';
    } else {
      message = `A record with this ${field} already exists.`;
    }
    
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Please upload a smaller file.';
    error = { message, statusCode: 413 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files. Please upload fewer files.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field. Please check your form data.';
    error = { message, statusCode: 400 };
  }

  // ImageKit errors
  if (err.message && err.message.includes('ImageKit')) {
    const message = 'Image upload failed. Please try again.';
    error = { message, statusCode: 500 };
  }

  // Socket.IO errors
  if (err.message && err.message.includes('Socket')) {
    const message = 'Real-time connection error. Please refresh the page.';
    error = { message, statusCode: 500 };
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    const message = 'Cross-origin request blocked. Please check your domain settings.';
    error = { message, statusCode: 403 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error. Please try again.';
    error = { message, statusCode: 503 };
  }

  // Redis connection errors
  if (err.code === 'ECONNREFUSED' && err.message.includes('Redis')) {
    const message = 'Service temporarily unavailable. Please try again.';
    error = { message, statusCode: 503 };
  }

  // Default error response
  const response = {
    success: false,
    error: error.message || 'Internal server error',
    statusCode: error.statusCode || 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development
  if (envConfig.isDevelopment) {
    response.stack = err.stack;
    response.details = {
      env: envConfig.nodeEnv,
      errorName: err.name,
      errorCode: err.code
    };
  }

  res.status(response.statusCode).json(response);
};

export default errorHandler;
