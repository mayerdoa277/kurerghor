# Production Setup Guide

## 🚀 Deployment Configuration

### **Frontend (Vercel) + Backend (Railway)**

## **Backend Configuration (Railway)**

### 1. Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-super-secret-jwt-key-64-characters-long-random-string
JWT_REFRESH_SECRET=your-super-secret-refresh-key-64-characters-long
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Admin Configuration (REQUIRED)
ADMIN_EMAILS=your-admin@gmail.com,another-admin@company.com

# Email (Brevo API)
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name

# Redis
REDIS_URL=redis://your-redis-connection

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URLs (for CORS)
FRONTEND_URL=https://your-vercel-app.vercel.app
VERCEL_URL=https://your-vercel-app.vercel.app
PRODUCTION_URL=https://yourdomain.com
```

### 2. CORS Configuration
Already configured in `src/app.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',           // Development
    'https://kurerghor.vercel.app',    // Vercel Production
    'https://kurerghor.com'            // Custom Domain
  ],
  credentials: true
}));
```

## **Frontend Configuration (Vercel)**

### 1. Environment Variables (.env)
```env
# API Configuration - PRODUCTION
VITE_API_URL=https://your-railway-app-name.up.railway.app/api/v1
VITE_SOCKET_URL=https://your-railway-app-name.up.railway.app

# Alternative for custom domain:
# VITE_API_URL=https://api.yourdomain.com/api/v1
# VITE_SOCKET_URL=https://api.yourdomain.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
VITE_APP_NAME=Your App Name
VITE_APP_VERSION=1.0.0
```

### 2. Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-railway-app-name.up.railway.app/api/v1",
    "VITE_SOCKET_URL": "https://your-railway-app-name.up.railway.app"
  }
}
```

## **🔗 Production URLs**

### **Development URLs:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### **Production URLs:**
- Frontend (Vercel): `https://your-app.vercel.app`
- Backend (Railway): `https://your-app.up.railway.app`

### **Custom Domain URLs:**
- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`

## **🛠️ Setup Steps**

### **1. Backend Deployment (Railway)**
```bash
# 1. Push to GitHub
git add .
git commit -m "Production ready authentication system"
git push origin main

# 2. Connect Railway to GitHub
# 3. Configure environment variables in Railway
# 4. Deploy - Railway will auto-detect Node.js app
```

### **2. Frontend Deployment (Vercel)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Build frontend
cd apps/frontend
npm run build

# 3. Deploy to Vercel
vercel --prod

# 4. Configure environment variables in Vercel dashboard
```

### **3. Update CORS if Needed**
If using different domains, update backend CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

## **✅ Testing Production Setup**

### **1. Test API Connection**
```bash
# Test backend health
curl https://your-app.up.railway.app/health

# Test frontend API calls
curl https://your-app.up.railway.app/api/v1/auth/admin-emails
```

### **2. Test Admin Login**
1. Go to `https://your-vercel-app.vercel.app/admin/login`
2. Use admin email from `ADMIN_EMAILS`
3. Check email for OTP
4. Verify login works

### **3. Test Vendor Request**
1. Register/login as user
2. Go to `/become-vendor`
3. Submit vendor request
4. Check admin panel shows request

## **🔧 Troubleshooting**

### **CORS Issues:**
- Ensure frontend URL is in backend CORS whitelist
- Check `credentials: true` is set in both frontend and backend

### **Environment Variables:**
- Verify `VITE_API_URL` is set in Vercel
- Verify `ADMIN_EMAILS` is set in Railway
- Check JWT secrets are set in Railway

### **Email Issues:**
- Verify Brevo API key is correct
- Check `EMAIL_FROM` is configured
- Test email delivery in Railway logs

### **Database Issues:**
- Ensure MongoDB URI is correct
- Check MongoDB cluster IP whitelist
- Verify connection string format

## **🚀 Ready for Production!**

Your authentication system will work in production with:
- ✅ Secure admin login with OTP
- ✅ Vendor request workflow
- ✅ Role-based access control
- ✅ Production CORS configuration
- ✅ Environment variable support
- ✅ Error handling and validation

The system automatically detects environment and uses appropriate URLs!
