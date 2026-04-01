/**
 * Environment Configuration Manager
 * Handles dynamic environment switching for backend
 */

const getEnvConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  // Base configuration
  const config = {
    nodeEnv,
    isDevelopment,
    isProduction,
    isTest,
    port: process.env.PORT || 5000,
  };

  // CORS origins based on environment
  if (isDevelopment) {
    config.allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173", // Vite default port
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];
    config.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  } else if (isProduction) {
    config.allowedOrigins = [
      "https://kurerghor.vercel.app",
      "https://kurerghor.com",
      "https://www.kurerghor.com",
    ];
    config.frontendUrl = process.env.FRONTEND_URL || 'https://kurerghor.vercel.app';
  }

  // Database configuration
  config.database = {
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    }
  };

  // JWT configuration
  config.jwt = {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    emailSecret: process.env.JWT_EMAIL_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  };

  // ImageKit configuration
  config.imagekit = {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  };

  // Email configuration
  config.email = {
    brevoApiKey: process.env.BREVO_API_KEY,
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME || 'Kurerghor Ecommerce',
  };

  // Google OAuth
  config.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  };

  // Rate limiting
  config.rateLimit = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  };

  // Storage configuration
  config.storage = {
    provider: process.env.STORAGE_PROVIDER || 'imagekit',
  };

  // Admin configuration
  config.admin = {
    emails: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [],
  };

  // Payment configuration
  config.payment = {
    aamarpay: {
      storeId: process.env.AAMARPAY_STORE_ID,
      signatureKey: process.env.AAMARPAY_SIGNATURE_KEY,
      baseUrl: process.env.AAMARPAY_BASE_URL || 'https://sandbox.aamarpay.com',
    },
  };

  // Debug logging (simplified)
  if (isDevelopment) {
    console.log('🔧 Backend Environment:', {
      nodeEnv: config.nodeEnv,
      port: config.port,
      storageProvider: config.storage.provider,
      enableDebug: true
    });
  }

  return config;
};

export const envConfig = getEnvConfig();

export default envConfig;
