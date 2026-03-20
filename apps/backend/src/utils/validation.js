import Joi from 'joi';

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details[0].message;
      return res.status(400).json({
        success: false,
        error: message
      });
    }
    next();
  };
};

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Email auth schemas
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().optional().min(2).max(50),
  phone: Joi.string().optional(),
  avatar: Joi.string().uri().optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

// Product validation schemas
export const createProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().required().min(1).max(2000),
  shortDescription: Joi.string().optional().max(200),
  category: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  subcategories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  brand: Joi.string().optional(),
  sku: Joi.string().required(),
  price: Joi.number().required().min(0),
  compareAtPrice: Joi.number().optional().min(0),
  costPrice: Joi.number().optional().min(0),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().optional(),
    isMain: Joi.boolean().optional()
  })).optional(),
  video: Joi.object({
    url: Joi.string().uri().required(),
    thumbnail: Joi.string().uri().optional()
  }).optional(),
  variants: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    options: Joi.array().items(Joi.string()).required(),
    price: Joi.number().required().min(0),
    sku: Joi.string().required(),
    image: Joi.string().uri().optional(),
    inventory: Joi.number().required().min(0)
  })).optional(),
  inventory: Joi.object({
    quantity: Joi.number().required().min(0),
    trackQuantity: Joi.boolean().optional(),
    allowBackorder: Joi.boolean().optional(),
    lowStockThreshold: Joi.number().optional().min(0)
  }).required(),
  weight: Joi.object({
    value: Joi.number().required().min(0),
    unit: Joi.string().valid('kg', 'g', 'lb', 'oz').optional()
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number().required().min(0),
    width: Joi.number().required().min(0),
    height: Joi.number().required().min(0),
    unit: Joi.string().valid('cm', 'in').optional()
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  seo: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    keywords: Joi.array().items(Joi.string()).optional()
  }).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
  visibility: Joi.string().valid('public', 'private', 'hidden').optional(),
  featured: Joi.boolean().optional(),
  shipping: Joi.object({
    freeShipping: Joi.boolean().optional(),
    shippingCost: Joi.number().optional().min(0),
    shippingWeight: Joi.number().optional().min(0),
    shippingDimensions: Joi.object({
      length: Joi.number().required().min(0),
      width: Joi.number().required().min(0),
      height: Joi.number().required().min(0)
    }).optional()
  }).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional().min(1).max(100),
  description: Joi.string().optional().min(1).max(2000),
  shortDescription: Joi.string().optional().max(200),
  category: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/),
  subcategories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  brand: Joi.string().optional(),
  price: Joi.number().optional().min(0),
  compareAtPrice: Joi.number().optional().min(0),
  costPrice: Joi.number().optional().min(0),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().optional(),
    isMain: Joi.boolean().optional()
  })).optional(),
  inventory: Joi.object({
    quantity: Joi.number().optional().min(0),
    trackQuantity: Joi.boolean().optional(),
    allowBackorder: Joi.boolean().optional(),
    lowStockThreshold: Joi.number().optional().min(0)
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
  visibility: Joi.string().valid('public', 'private', 'hidden').optional(),
  featured: Joi.boolean().optional()
});

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(50),
  description: Joi.string().optional().max(500),
  image: Joi.string().uri().optional(),
  icon: Joi.string().optional(),
  parent: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  sortOrder: Joi.number().optional().min(0),
  seo: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    keywords: Joi.array().items(Joi.string()).optional()
  }).optional()
});

// Order validation schemas
export const createOrderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    product: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    variant: Joi.object({
      name: Joi.string().required(),
      option: Joi.string().required()
    }).optional(),
    quantity: Joi.number().required().min(1)
  })).required().min(1),
  paymentMethod: Joi.string().valid('aamarpay', 'cash_on_delivery', 'bank_transfer').required(),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  billingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).optional(),
  couponCode: Joi.string().optional(),
  notes: Joi.string().optional().max(500)
});

// Review validation schemas
export const createReviewSchema = Joi.object({
  product: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  order: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  rating: Joi.number().required().min(1).max(5),
  title: Joi.string().required().min(1).max(100),
  content: Joi.string().required().min(1).max(1000),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().optional()
  })).optional()
});

// Coupon validation schemas
export const createCouponSchema = Joi.object({
  code: Joi.string().required().min(1).max(20),
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().required().min(0),
  minimumAmount: Joi.number().optional().min(0),
  maximumDiscount: Joi.number().optional().min(0),
  usageLimit: Joi.number().optional().min(1),
  userUsageLimit: Joi.number().optional().min(1),
  applicableProducts: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  applicableCategories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  excludedProducts: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  excludedCategories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().required()
});
