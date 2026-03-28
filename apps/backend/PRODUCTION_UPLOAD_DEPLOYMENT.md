# Production-Ready Media Upload System Deployment Guide

## 🚀 Overview

This guide covers deploying the enterprise-grade media upload system to production with video optimization, security hardening, and scalability features.

## 📋 Prerequisites

### System Requirements
- **Node.js**: >= 18.0.0
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: SSD with at least 50GB free space
- **CPU**: Multi-core processor for video processing
- **FFmpeg**: Installed system-wide for video optimization

### External Services
- **ImageKit** or **DigitalOcean Spaces** (S3-compatible)
- **Redis** for caching and rate limiting
- **MongoDB** for metadata storage
- **CDN** (optional but recommended)

## 🔧 Installation

### 1. Install System Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install epel-release
sudo yum install ffmpeg

# macOS
brew install ffmpeg

# Verify FFmpeg installation
ffmpeg -version
```

### 2. Install Node.js Dependencies

```bash
cd apps/backend
npm install --production
```

### 3. Environment Configuration

Create `.env` file with production settings:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production

# Redis
REDIS_URL=redis://user:pass@redis-server:6379

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_production_public_key
IMAGEKIT_PRIVATE_KEY=your_production_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_production_id
STORAGE_PROVIDER=imagekit

# Alternative: DigitalOcean Spaces
# STORAGE_PROVIDER=s3
# DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
# DO_SPACES_KEY=your_spaces_key
# DO_SPACES_SECRET=your_spaces_secret
# DO_SPACES_BUCKET=your_production_bucket
# DO_SPACES_REGION=nyc3

# Security
JWT_SECRET=your_super_secure_jwt_secret_at_least_64_characters_long
UPLOAD_RATE_LIMIT_WINDOW_MS=900000
UPLOAD_RATE_LIMIT_MAX_REQUESTS=50

# Performance
MAX_CONCURRENT_UPLOADS=5
MAX_MEMORY_USAGE=104857600
UPLOAD_TIMEOUT=300000

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

## 🏗️ Architecture

### Production Architecture Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Load Balancer  │───▶│   API Gateway   │
│   (React App)   │    │   (Nginx/HAProxy)│    │   (Express)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────────────────────┼─────────────────────────┐
                       │                                 │                         │
               ┌───────▼───────┐              ┌──────▼──────┐          ┌───────▼───────┐
               │   Upload      │              │   Redis     │          │   MongoDB     │
               │   Queue       │              │   Cache     │          │   Metadata    │
               └───────┬───────┘              └──────┬──────┘          └───────┬───────┘
                       │                                 │                         │
               ┌───────▼───────┐              ┌──────▼──────┐          ┌───────▼───────┐
               │   Video       │              │   Rate      │          │   Product     │
               │   Processing  │              │   Limiting  │          │   Data        │
               │   (FFmpeg)    │              │             │          │               │
               └───────┬───────┘              └─────────────┘          └───────────────┘
                       │
               ┌───────▼───────┐
               │   Storage     │
               │   (ImageKit/   │
               │   S3/Spaces)  │
               └───────────────┘
```

### Component Responsibilities

1. **API Gateway**: Request routing, authentication, rate limiting
2. **Upload Queue**: Manages concurrent uploads and prevents overload
3. **Video Processing**: FFmpeg-based optimization with temp file cleanup
4. **Storage Layer**: Abstracted storage (ImageKit/S3) with CDN integration
5. **Cache Layer**: Redis for rate limiting, deduplication, and metadata
6. **Database**: MongoDB for file metadata and product/category relationships

## 🔒 Security Configuration

### 1. File Upload Security

```javascript
// Security settings in production
const SECURITY_CONFIG = {
  maxFilesPerRequest: 10,
  maxTotalSize: 100 * 1024 * 1024, // 100MB
  allowedExtensions: {
    image: ['.jpg', '.jpeg', '.png', '.webp'],
    video: ['.mp4', '.webm', '.mov']
  },
  scanForMaliciousContent: true,
  enforceContentValidation: true
};
```

### 2. Rate Limiting

```javascript
// Production rate limits
const rateLimits = {
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 uploads per 15 minutes
    skipSuccessfulRequests: false
  },
  api: {
    windowMs: 15 * 60 * 1000,
    max: 1000, // 1000 requests per 15 minutes
    skipSuccessfulRequests: true
  }
};
```

### 3. CORS and Headers

```javascript
// Production CORS configuration
const corsConfig = {
  origin: ['https://yourdomain.com', 'https://admin.yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://ik.imagekit.io"],
      mediaSrc: ["'self'", "https://ik.imagekit.io"]
    }
  }
}));
```

## 📊 Performance Optimization

### 1. Memory Management

```javascript
// Production memory optimization
const memoryConfig = {
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  gcThreshold: 80 * 1024 * 1024,     // 80MB
  chunkSize: 64 * 1024,              // 64KB chunks
  concurrencyLimit: 3
};
```

### 2. Video Processing Optimization

```javascript
// FFmpeg optimization for production
const videoConfig = {
  maxResolution: {
    width: 1920,
    height: 1080
  },
  bitrate: {
    standard: '1000k',
    high: '2000k'
  },
  preset: 'medium',
  crf: 23,
  timeout: 300000 // 5 minutes
};
```

### 3. Caching Strategy

```javascript
// Redis caching configuration
const cacheConfig = {
  uploadCache: {
    ttl: 30 * 60, // 30 minutes
    maxSize: 1000
  },
  rateLimitCache: {
    ttl: 15 * 60, // 15 minutes
    maxSize: 10000
  },
  metadataCache: {
    ttl: 60 * 60, // 1 hour
    maxSize: 5000
  }
};
```

## 🚀 Deployment Steps

### 1. Database Setup

```bash
# Create MongoDB indexes
mongo your_db --eval "
db.categories.createIndex({ 'slug': 1 }, { unique: true });
db.products.createIndex({ 'sku': 1 }, { unique: true });
db.products.createIndex({ 'vendor': 1 });
db.products.createIndex({ 'category': 1 });
db.products.createIndex({ 'status': 1, 'visibility': 1 });
"
```

### 2. Redis Configuration

```bash
# Redis configuration for production
redis-server --maxmemory 256mb \
             --maxmemory-policy allkeys-lru \
             --save 900 1 \
             --save 300 10 \
             --save 60 10000
```

### 3. Application Deployment

```bash
# Build and deploy
npm run build

# Start with PM2 (recommended)
pm2 start ecosystem.config.js --env production

# Or start directly
NODE_ENV=production node src/app.js
```

### 4. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'upload-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

## 🔍 Monitoring and Logging

### 1. Application Monitoring

```javascript
// Metrics collection
const prometheus = require('prom-client');

const uploadMetrics = {
  uploadTotal: new prometheus.Counter({
    name: 'uploads_total',
    help: 'Total number of uploads',
    labelNames: ['type', 'status']
  }),
  uploadDuration: new prometheus.Histogram({
    name: 'upload_duration_seconds',
    help: 'Upload duration in seconds',
    labelNames: ['type']
  }),
  activeUploads: new prometheus.Gauge({
    name: 'active_uploads',
    help: 'Number of active uploads'
  })
};
```

### 2. Health Checks

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage(),
      ffmpeg: await checkFFmpeg()
    },
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };

  const isHealthy = Object.values(health.services).every(s => s.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### 3. Error Tracking

```javascript
// Error tracking with Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

## 🔄 Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**: Nginx or HAProxy
2. **Multiple Instances**: PM2 cluster mode
3. **Shared Storage**: Redis + External Storage
4. **Database Sharding**: MongoDB sharding if needed

### Auto-scaling Configuration

```yaml
# Docker Compose for auto-scaling
version: '3.8'
services:
  upload-api:
    image: your-registry/upload-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

## 🧪 Testing in Production

### 1. Smoke Tests

```bash
# Test upload endpoints
curl -X POST http://your-domain.com/api/v1/upload/image \
  -F "image=@test-image.jpg" \
  -H "Authorization: Bearer $TOKEN"

# Test service health
curl http://your-domain.com/health

# Test rate limiting
for i in {1..60}; do
  curl -X POST http://your-domain.com/api/v1/upload/image \
    -F "image=@test-image.jpg" \
    -w "%{http_code}\n" -o /dev/null -s
done
```

### 2. Load Testing

```bash
# Using Artillery for load testing
artillery run load-test-config.yml

# load-test-config.yml
config:
  target: 'http://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Upload Image"
    weight: 70
    flow:
      - post:
          url: "/api/v1/upload/image"
          formData:
            image: "@test-image.jpg"
```

## 🚨 Troubleshooting

### Common Issues

1. **Memory Leaks**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart if memory exceeds limit
   pm2 restart upload-api
   ```

2. **FFmpeg Not Found**
   ```bash
   # Check FFmpeg installation
   which ffmpeg
   
   # Install if missing
   sudo apt install ffmpeg
   ```

3. **Upload Timeout**
   ```bash
   # Increase timeout in nginx
   client_max_body_size 100M;
   proxy_read_timeout 300s;
   proxy_send_timeout 300s;
   ```

4. **Redis Connection Issues**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Check Redis logs
   tail -f /var/log/redis/redis-server.log
   ```

### Performance Issues

1. **High Memory Usage**
   - Increase `MAX_MEMORY_USAGE`
   - Reduce `MAX_CONCURRENT_UPLOADS`
   - Enable garbage collection

2. **Slow Uploads**
   - Check storage provider latency
   - Optimize image/video settings
   - Consider CDN integration

3. **Database Bottlenecks**
   - Add appropriate indexes
   - Consider read replicas
   - Implement connection pooling

## 📈 Optimization Checklist

- [ ] FFmpeg installed and configured
- [ ] Redis configured with memory limits
- [ ] MongoDB indexes created
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] File validation enabled
- [ ] Memory monitoring active
- [ ] Error tracking implemented
- [ ] Health checks configured
- [ ] Load balancer configured
- [ ] SSL/TLS certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring dashboards set up

## 🔄 Maintenance

### Regular Tasks

1. **Daily**
   - Check error logs
   - Monitor memory usage
   - Verify upload success rates

2. **Weekly**
   - Clean up temp files
   - Update security patches
   - Review performance metrics

3. **Monthly**
   - Update dependencies
   - Test disaster recovery
   - Review storage costs

### Backup Strategy

```bash
# Database backup
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb/$(date +%Y%m%d)"

# Redis backup
redis-cli --rdb "/backups/redis/$(date +%Y%m%d).rdb"

# Storage backup (if using S3)
aws s3 sync s3://your-bucket s3://your-backup-bucket/$(date +%Y%m%d)
```

## 📞 Support

For production issues:

1. **Emergency**: Contact DevOps team immediately
2. **Performance**: Check monitoring dashboards first
3. **Bugs**: Create issue with detailed logs
4. **Security**: Report to security team immediately

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**Maintainer**: DevOps Team
