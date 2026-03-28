# Role-Based Authentication & Authorization System

## Overview

This is a production-ready role-based authentication and authorization system built with Node.js (Express) and MongoDB. The system provides secure user management with three roles: user, vendor, and admin.

## Features

### 🔐 Authentication System
- **JWT-based authentication** with access and refresh tokens
- **Secure admin authentication** with OTP verification via email
- **Password hashing** using bcrypt
- **Role-based access control** with middleware protection
- **Rate limiting** for all authentication routes
- **Input validation** using Joi with detailed error messages

### 👥 User Roles
1. **User** - Default role for all new registrations
2. **Vendor** - Users approved to sell products
3. **Admin** - System administrators with OTP verification

### 🛡️ Security Features
- **Admin email hardcoding** - No admin registration route
- **OTP verification** for admin login (5-minute expiry)
- **Prevention of privilege escalation**
- **Secure token management** with refresh token rotation
- **Input sanitization** and validation
- **Rate limiting** on authentication endpoints

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### Public Routes
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/google
GET  /api/v1/auth/google/callback
POST /api/v1/auth/forgot-password
POST /api/v1/auth/verify-otp
GET  /api/v1/auth/verify-email
POST /api/v1/auth/reset-password
```

#### Admin Authentication (with OTP)
```http
POST /api/v1/auth/admin-login          # Step 1: Login with email/password
POST /api/v1/auth/admin-verify-otp     # Step 2: Verify OTP
POST /api/v1/auth/admin-resend-otp      # Resend OTP
GET  /api/v1/auth/admin-emails         # Development only
```

#### Protected Routes
```http
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Vendor Request Routes (`/api/v1/users`)

#### User Routes
```http
POST /api/v1/users/request-vendor       # Request vendor access
GET  /api/v1/users/vendor-request-status # Check request status
```

#### Admin Routes
```http
GET    /api/v1/users/admin/vendor-requests           # Get all requests
GET    /api/v1/users/admin/vendor-requests/stats     # Get statistics
GET    /api/v1/users/admin/vendor-requests/:id      # Get single request
PATCH  /api/v1/users/admin/vendor-requests/:id/approve # Approve request
PATCH  /api/v1/users/admin/vendor-requests/:id/reject  # Reject request
```

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'vendor', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  refreshTokens: [{ token: String, createdAt: Date }],
  vendorRequest: {
    requested: Boolean,
    approved: Boolean,
    rejected: Boolean,
    shopName: String,
    shopDescription: String,
    shopAddress: String,
    shopPhone: String,
    requestedAt: Date,
    reviewedAt: Date,
    reviewedBy: ObjectId (ref: 'User')
  },
  // ... other fields
}
```

### VendorRequest Model
```javascript
{
  user: ObjectId (ref: 'User', unique),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  shopName: String (required),
  shopDescription: String (required),
  shopAddress: String (required),
  shopPhone: String (required),
  shopEmail: String (required),
  businessType: String (enum: ['individual', 'company', 'partnership']),
  taxId: String,
  documents: [String], // URLs to uploaded documents
  requestedAt: Date (default: Date.now),
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: 'User'),
  reviewNotes: String,
  rejectionReason: String
}
```

## Middleware

### Role-Based Middleware
```javascript
import { requireAuth, requireAdmin, requireVendor, requireUser } from '../middlewares/roleMiddleware.js';

// Require authentication
router.get('/protected', requireAuth, handler);

// Require admin role
router.get('/admin-only', requireAdmin, handler);

// Require vendor role (admin also has access)
router.get('/vendor-only', requireVendor, handler);

// Require regular user only
router.get('/user-only', requireUser, handler);

// Custom role authorization
router.get('/custom', authorize('admin', 'vendor'), handler);
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-64-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-64-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Admin Configuration
ADMIN_EMAILS=admin@yourdomain.com,superadmin@yourdomain.com

# Email Configuration (for OTP)
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Admin Setup

### 1. Create Admin User
```javascript
// In MongoDB shell or using a script
db.users.insertOne({
  name: "Admin User",
  email: "admin@yourdomain.com",
  password: "$2a$12$hashedpassword...", // Use bcrypt to hash
  role: "admin",
  isActive: true,
  isEmailVerified: true
});
```

### 2. Configure Admin Emails
Set the `ADMIN_EMAILS` environment variable with comma-separated admin emails.

### 3. Admin Login Flow
1. Call `POST /api/v1/auth/admin-login` with email/password
2. System sends 6-digit OTP to admin email
3. Call `POST /api/v1/auth/admin-verify-otp` with adminId and OTP
4. Receive access and refresh tokens

## Vendor Request Flow

### 1. User Requests Vendor Access
```javascript
POST /api/v1/users/request-vendor
{
  "shopName": "My Shop",
  "shopDescription": "Shop description",
  "shopAddress": "123 Main St, City, Country",
  "shopPhone": "+1234567890",
  "shopEmail": "shop@example.com",
  "businessType": "individual",
  "taxId": "123456789",
  "documents": ["https://example.com/doc1.pdf"]
}
```

### 2. Admin Reviews Request
```javascript
// Get all pending requests
GET /api/v1/users/admin/vendor-requests?status=pending

// Approve request
PATCH /api/v1/users/admin/vendor-requests/:id/approve
{
  "reviewNotes": "Approved after verification"
}

// Reject request
PATCH /api/v1/users/admin/vendor-requests/:id/reject
{
  "rejectionReason": "Insufficient documentation",
  "reviewNotes": "Please provide additional business documents"
}
```

### 3. Automatic Role Update
- On approval, user role automatically changes from 'user' to 'vendor'
- User receives vendor privileges immediately
- Request status is updated in both User and VendorRequest models

## Security Considerations

### ✅ Implemented Security Measures
1. **Admin Access Control**
   - No admin registration routes
   - Hardcoded admin emails
   - OTP verification for admin login
   - 5-minute OTP expiry

2. **Token Security**
   - Access tokens (7 days) + Refresh tokens (30 days)
   - Refresh token rotation
   - Token blacklisting on logout
   - Secure token storage in database

3. **Input Validation**
   - Comprehensive Joi validation schemas
   - Sanitization of all inputs
   - Detailed error messages without exposing internals

4. **Rate Limiting**
   - Global rate limiting (100 requests per 15 minutes)
   - Skip for health checks and OAuth callbacks
   - Configurable window and limits

5. **Password Security**
   - bcrypt with 12 salt rounds
   - Minimum 6 characters with complexity requirements
   - Password reset with OTP verification

### 🔒 Additional Recommendations
1. **Email Security**
   - Use SPF, DKIM, and DMARC records
   - Monitor email delivery rates
   - Implement email throttling

2. **Database Security**
   - Use MongoDB authentication
   - Enable SSL/TLS connections
   - Regular database backups

3. **Monitoring & Logging**
   - Log all admin actions
   - Monitor failed login attempts
   - Set up alerts for suspicious activities

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message",
  "details": [ // For validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Testing

### Authentication Flow
1. Register new user → role: 'user'
2. User requests vendor access → creates VendorRequest
3. Admin logs in with OTP verification
4. Admin approves/rejects vendor request
5. User role updates automatically on approval

### Security Testing
1. Test admin access with non-admin emails
2. Verify OTP expiry and validation
3. Test rate limiting on auth endpoints
4. Validate input sanitization
5. Check privilege escalation prevention

## Production Deployment

### Environment Setup
1. Set strong JWT secrets (64+ characters)
2. Configure admin emails
3. Set up email service (Brevo)
4. Enable rate limiting
5. Configure Redis for caching

### Database Setup
1. Create admin user with strong password
2. Set up proper indexes
3. Enable authentication
4. Configure backup strategy

### Monitoring
1. Monitor authentication failures
2. Track admin login attempts
3. Monitor vendor request processing
4. Set up alerts for security events

This system provides a secure, scalable foundation for role-based access control in your application.
