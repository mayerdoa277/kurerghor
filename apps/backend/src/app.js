import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
 
// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
// Load .env from backend root directory (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: join(__dirname, '..', '.env') });
}

// Debug environment variables
console.log('🔍 Environment variables loaded:');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'EXISTS' : 'MISSING');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);
import { createServer } from 'http';
import { initializeSocket } from './sockets/socketHandler.js';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import vendorRoutes from './routes/vendor.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import couponRoutes from './routes/coupon.js';
import reviewRoutes from './routes/review.js';
import blogRoutes from './routes/blog.js';


console.log('Starting server...');

const app = express();

// CORS configuration - MUST come before all other middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000',
  'https://kurerghor-mw8ehoth5-mayerdoa277s-projects.vercel.app',
  'https://kurerghor-mw8ehoth5-mayerdoa277s-projects.vercel.app/',
  'https://kurerghor.vercel.app'
];

console.log('🔍 CORS Configuration:');
console.log('Allowed origins:', allowedOrigins);
console.log('Environment FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('Environment VERCEL_URL:', process.env.VERCEL_URL);

// Handle preflight requests FIRST
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('🔍 Preflight request from origin:', origin);
  console.log('🔍 Available origins:', allowedOrigins);
  console.log('🔍 Origin match test:', allowedOrigins.includes(origin));
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('✅ CORS headers set for origin:', origin);
  } else {
    console.log('❌ Origin not allowed:', origin);
    console.log('❌ Available origins were:', allowedOrigins);
  }
  res.sendStatus(200);
});

// Enhanced CORS middleware for all requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Standard CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware (AFTER CORS)
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/blog', blogRoutes);

// Health check  
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server initialization...');
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');

    // Connect to Redis
    console.log('🔌 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected');

    // Initialize email queue after Redis is connected
    console.log('🔧 Initializing email queue...');
    const { initializeEmailQueue } = await import('./jobs/emailQueue.js');
    await initializeEmailQueue();
    console.log('✅ Email queue initialized');

    // Create HTTP server
    console.log('🌐 Creating HTTP server...');
    const server = createServer(app);

    // Initialize Socket.io
    console.log('🔌 Initializing Socket.io...');
    initializeSocket(server);
    console.log('✅ Socket.io initialized');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 WebSocket server ready`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
};

startServer();
