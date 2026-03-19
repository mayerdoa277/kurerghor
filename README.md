# Ecommerce Platform

A production-ready, scalable, enterprise-level multi-vendor ecommerce web application built with modern technologies.

**GitHub Repository:** https://github.com/mayerdoa277/KURER-GHOR

## 🚀 Features

### Core Features
- **Multi-vendor Support**: Multiple vendors can sell products on the platform
- **User Management**: Complete user authentication and profile management
- **Product Management**: Advanced product catalog with categories, variants, and inventory
- **Order System**: Complete order lifecycle from placement to delivery
- **Payment Integration**: Aamarpay payment gateway with webhook support
- **Search & Filter**: MongoDB text search with advanced filtering
- **Reviews & Ratings**: User-generated reviews with rating system
- **Coupon System**: Flexible discount coupons with expiry and usage limits
- **Blog System**: Content management for SEO and marketing
- **Real-time Updates**: Socket.io for live notifications and stock updates

### Advanced Features
- **Flash Sales**: Time-limited sales with countdown timers
- **Wishlist**: Save favorite products for later
- **Guest Cart**: Shopping cart for non-registered users
- **Vendor Dashboard**: Complete vendor management interface
- **Admin Panel**: Comprehensive admin analytics and management
- **Email Notifications**: Queue-based email system with templates
- **Media Management**: Image optimization and CDN integration
- **Caching**: Redis-based caching for performance
- **Rate Limiting**: API protection and abuse prevention

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT + Google OAuth
- **Real-time**: Socket.io
- **File Upload**: Multer + Sharp + DigitalOcean Spaces
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: Joi

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide icons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: DigitalOcean VPS
- **Database**: MongoDB Atlas
- **File Storage**: DigitalOcean Spaces
- **CDN**: BunnyCDN

## 📁 Project Structure

```
ecommerce-monorepo/
├── apps/
│   ├── backend/                 # Node.js API server
│   │   ├── src/
│   │   │   ├── config/         # Database and Redis config
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── middlewares/    # Express middlewares
│   │   │   ├── models/         # MongoDB models
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── jobs/           # Background jobs
│   │   │   ├── sockets/        # Socket.io handlers
│   │   │   └── app.js          # Main app file
│   │   └── package.json
│   └── frontend/               # React application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Page components
│       │   ├── layouts/        # Layout components
│       │   ├── features/       # Feature-specific components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── services/       # API services
│       │   ├── store/          # State management
│       │   └── utils/          # Utility functions
│       └── package.json
├── packages/
│   └── shared/                 # Shared utilities
└── package.json               # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-monorepo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

#### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis
REDIS_URL=redis://127.0.0.1:6379

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=your-bucket-name
DO_SPACES_ACCESS_KEY=your-access-key
DO_SPACES_SECRET_KEY=your-secret-key

# Payment Gateway
AAMARPAY_STORE_ID=your-store-id
AAMARPAY_SIGNATURE_KEY=your-signature-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_CDN_URL=https://your-bunny-cdn-url.b-cdn.net
```

4. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 3000
```

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (vendor/admin)
- `PUT /api/v1/products/:id` - Update product (vendor/admin)
- `DELETE /api/v1/products/:id` - Delete product (vendor/admin)

### Cart
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update item quantity
- `DELETE /api/v1/cart/remove` - Remove item from cart
- `DELETE /api/v1/cart/clear` - Clear cart

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get single order
- `PUT /api/v1/orders/:id/cancel` - Cancel order

### And many more...

## 🔧 Development

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Git hooks for pre-commit checks

### Testing
- Jest for unit testing
- Supertest for API testing

### Deployment
- Frontend: Vercel (automatic deployment on push)
- Backend: DigitalOcean VPS (manual deployment)
- Database: MongoDB Atlas (managed service)

## 📝 Scripts

### Root Scripts
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run lint` - Lint all code
- `npm run format` - Format all code

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run lint` - Lint backend code

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint frontend code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please email support@ecommerce-platform.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced shipping options
- [ ] Subscription-based services
- [ ] API rate limiting improvements
- [ ] Advanced SEO optimizations
- [ ] Social media integrations
- [ ] Affiliate marketing system
- [ ] Advanced reporting tools

---

Built with ❤️ by the Ecommerce Platform Team
