# 🚀 Kurerghor Deployment Guide
 
## 📋 Environment Setup
 
### 🔧 Local Development
```bash
# .env file
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
 
### 🌐 Vercel Staging Deployment
```bash
# Vercel automatically sets VERCEL_URL
# No need to set FRONTEND_URL
VERCEL_URL=https://kurerghor.vercel.app
NODE_ENV=production
```
 
### 🏭 Production Domain (kurerghor.com)
```bash
# Production .env
FRONTEND_URL=https://kurerghor.com
PRODUCTION_URL=https://kurerghor.com
NODE_ENV=production
```
 
## 📧 Email Template Environment Detection
 
The email template automatically detects the environment:
 
### 🏠 Development (localhost)
- **URL:** `http://localhost:3000/reset-password?otp=123456&email=user@gmail.com`
- **Environment Badge:** "Development"
- **Footer:** "© 2024 Kurerghor Ecommerce Platform"
 
### 🚀 Vercel Staging
- **URL:** `https://kurerghor.vercel.app/reset-password?otp=123456&email=user@gmail.com`
- **Environment Badge:** "Vercel Staging"
- **Footer:** "© 2024 Kurerghor Ecommerce Platform"
 
### 🏭 Production (kurerghor.com)
- **URL:** `https://kurerghor.com/reset-password?otp=123456&email=user@gmail.com`
- **Environment Badge:** "Production"
- **Footer:** "© 2024 Kurerghor Ecommerce Platform"
 
## 🔄 Priority Order
 
The email template uses this priority:
1. `FRONTEND_URL` (manual override)
2. `VERCEL_URL` (Vercel automatic)
3. `http://localhost:3000` (fallback)
 
## 📝 Deployment Steps
 
### 1. Vercel Deployment
```bash
# Frontend
cd apps/frontend
vercel --prod
 
# Backend (if deploying to Vercel)
cd apps/backend
vercel --prod
```
 
### 2. Production Domain Setup
```bash
# Set environment variables
export FRONTEND_URL=https://kurerghor.com
export NODE_ENV=production
 
# Deploy backend
npm run build
npm start
```
 
## ✅ Testing Checklist
 
- [ ] Local development emails work with localhost URLs
- [ ] Vercel staging emails work with vercel.app URLs
- [ ] Production emails work with kurerghor.com URLs
- [ ] Environment badges show correctly
- [ ] Quick reset links work in all environments
 
## 🎯 Features
 
- ✅ **Multi-environment support** (localhost, Vercel, production)
- ✅ **Automatic environment detection**
- ✅ **Proper URL formatting** (adds https:// if missing)
- ✅ **Environment badges** in emails
- ✅ **Branded footer** with "Kurerghor Ecommerce Platform"
- ✅ **Fallback to localhost** if no environment set
 
## 📧 Email Template Features
 
- **6-digit OTP prominently displayed**
- **Quick reset button** with correct domain
- **Environment detection** badge
- **Professional design** with Kurerghor branding
- **Mobile-friendly** responsive design
- **Security notices** and expiry warnings
 
Your OTP password reset system is now ready for deployment across all environments! 🎉