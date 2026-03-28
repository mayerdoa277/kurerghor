import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

// Protect routes - require authentication
export const requireAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found or inactive.'
      });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// Admin-only access
export const requireAdmin = async (req, res, next) => {
  try {
    // First require authentication
    await requireAuth(req, res, () => {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Access denied.'
    });
  }
};

// Vendor-only access
export const requireVendor = async (req, res, next) => {
  try {
    // First require authentication
    await requireAuth(req, res, () => {
      // Check if user is vendor or admin (admin can access vendor routes)
      if (!['vendor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Vendor privileges required.'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Access denied.'
    });
  }
};

// User-only access (excluding vendors and admins)
export const requireUser = async (req, res, next) => {
  try {
    // First require authentication
    await requireAuth(req, res, () => {
      // Check if user is regular user only
      if (req.user.role !== 'user') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. User access only.'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Access denied.'
    });
  }
};

// Role-based access control (flexible version)
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // First require authentication
      await requireAuth(req, res, () => {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            error: `Access denied. Required roles: ${roles.join(', ')}.`
          });
        }
        next();
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user can access their own resources or has admin privileges
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      await requireAuth(req, res, () => {
        // Admin can access everything
        if (req.user.role === 'admin') {
          return next();
        }

        // Check ownership
        const resourceUserId = req.params[resourceUserIdField] || 
                              req.body[resourceUserIdField] || 
                              req.query[resourceUserIdField];

        if (!resourceUserId) {
          return res.status(400).json({
            success: false,
            error: 'Resource user ID not found.'
          });
        }

        if (req.user._id.toString() !== resourceUserId.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. You can only access your own resources.'
          });
        }

        next();
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
  };
};
