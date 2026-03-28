# Production-Ready Media Upload System

A scalable, secure, and modular media upload system for Node.js (Express) backend with support for ImageKit and future DigitalOcean Spaces integration.

## 🏗️ Architecture

### Clean Architecture Design
```
/src
├── config/
│   ├── imagekit.js          # ImageKit configuration
│   └── multer.js            # Multer upload configuration
├── services/
│   ├── uploadService.js     # Generic upload service interface
│   ├── imagekitService.js   # ImageKit implementation
│   └── s3Service.js         # S3/DigitalOcean Spaces implementation (future-ready)
├── utils/
│   ├── fileValidation.js    # File validation utilities
│   └── imageOptimizer.js    # Image processing with Sharp
├── middlewares/
│   └── uploadMiddleware.js  # Upload handling middleware
├── controllers/
│   └── uploadController.js  # Upload API controllers
└── routes/
    └── uploadRoutes.js      # Upload API routes
```

## 🚀 Features

### ✅ Implemented
- **Memory Storage Only**: Uses multer with memoryStorage (no disk storage)
- **File Size Limits**: Images (5MB), Videos (50MB)
- **MIME Type Validation**: Images (jpg, jpeg, png, webp), Videos (mp4, webm, mov)
- **Image Optimization**: Auto-resize (max 1024px), compress (70% quality), convert to WebP
- **Security**: Unique filenames, input sanitization, rate limiting
- **Scalability**: Stateless design, ready for horizontal scaling
- **Provider Abstraction**: Easy switching between storage providers
- **Rate Limiting**: 10 uploads per 15 minutes per IP
- **Error Handling**: Comprehensive error management
- **Modern ES Modules**: Clean, modular code structure

### 🔮 Future-Ready
- **S3/DigitalOcean Spaces**: Complete implementation ready
- **Video Optimization**: Modular design for ffmpeg integration
- **Responsive Images**: Multiple size generation support

## 📋 API Endpoints

### Upload Operations
- `POST /api/v1/upload/image` - Upload image file
- `POST /api/v1/upload/video` - Upload video file
- `DELETE /api/v1/upload/:fileId` - Delete file
- `GET /api/v1/upload/:fileId/metadata` - Get file metadata
- `GET /api/v1/upload/:fileId/signed-url` - Generate signed URL
- `GET /api/v1/upload` - List files in folder
- `GET /api/v1/upload/service/status` - Service health check

### Request/Response Format

#### Upload Response
```json
{
  "success": true,
  "url": "https://ik.imagekit.io/your-id/images/1234567890_uuid.webp",
  "fileName": "1234567890_uuid.webp",
  "type": "image",
  "fileId": "unique_file_id",
  "size": 245760,
  "metadata": {
    "category": "image",
    "originalSize": 512000,
    "optimizedSize": 245760,
    "compressionRatio": "52.00",
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## ⚙️ Configuration

### Environment Variables

#### ImageKit (Current Provider)
```env
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
STORAGE_PROVIDER=imagekit
```

#### DigitalOcean Spaces (Future Provider)
```env
STORAGE_PROVIDER=s3
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_key_here
DO_SPACES_SECRET=your_spaces_secret_here
DO_SPACES_BUCKET=your_bucket_name_here
DO_SPACES_REGION=nyc3
DO_SPACES_URL=https://your_bucket_name.nyc3.digitaloceanspaces.com
```

#### AWS S3 (Alternative)
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name_here
AWS_S3_URL=https://your_bucket_name.s3.amazonaws.com
```

## 🛡️ Security Features

### Input Validation
- MIME type validation for all file types
- File size enforcement (5MB images, 50MB videos)
- Filename sanitization to prevent path traversal
- UUID-based unique filename generation

### Rate Limiting
- Upload endpoints: 10 requests per 15 minutes per IP
- General endpoints: 100 requests per 15 minutes per IP
- Configurable via environment variables

### Error Handling
- Graceful error responses with proper HTTP status codes
- Detailed error messages in development mode
- Sanitized error messages in production
- Comprehensive logging for debugging

## 🔧 Usage Examples

### Upload Image (JavaScript)
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/v1/upload/image', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload URL:', result.url);
```

### Upload Image (cURL)
```bash
curl -X POST \
  http://localhost:5000/api/v1/upload/image \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/image.jpg"
```

### Get Service Status
```javascript
const response = await fetch('/api/v1/upload/service/status');
const status = await response.json();
console.log('Service Status:', status);
```

## 🧪 Testing

### Run System Test
```bash
cd apps/backend
node test-upload.js
```

### Test with Real File
```bash
# Create a test image (optional)
curl -o test-image.jpg https://via.placeholder.com/800x600.jpg

# Run test
node test-upload.js
```

## 📦 Dependencies

### Core Dependencies
- `@imagekit/nodejs` - ImageKit SDK
- `multer` - File upload handling
- `sharp` - Image processing
- `uuid` - Unique ID generation
- `express-rate-limit` - Rate limiting

### Development Dependencies
- All dependencies are production-ready with no dev-only requirements

## 🔄 Provider Switching

### Switch to DigitalOcean Spaces
1. Update environment variables:
   ```env
   STORAGE_PROVIDER=s3
   DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
   DO_SPACES_KEY=your_key
   DO_SPACES_SECRET=your_secret
   DO_SPACES_BUCKET=your_bucket
   ```
2. Restart the application
3. No code changes required!

### Switch to AWS S3
1. Update environment variables:
   ```env
   STORAGE_PROVIDER=s3
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_BUCKET=your_bucket
   AWS_REGION=us-east-1
   ```
2. Restart the application

## 🚀 Performance Optimizations

### Image Processing
- Automatic WebP conversion for better compression
- Intelligent resizing (only if larger than target)
- Balanced compression settings (quality 70)
- Memory-efficient processing with Sharp

### Upload Performance
- Memory storage (no disk I/O bottleneck)
- Asynchronous processing
- Connection pooling for storage providers
- Minimal memory footprint

### Caching Strategy
- CDN integration via ImageKit
- Browser cache headers
- Optional Redis integration for metadata caching

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless design enables multiple server instances
- No local file storage dependencies
- Cloud-based storage provider handles scaling
- Rate limiting works across instances

### Future Enhancements
- Video transcoding with FFmpeg
- Multiple image size generation
- Content delivery optimization
- Advanced image transformations

## 🐛 Troubleshooting

### Common Issues

#### "Upload service is not configured"
- Check environment variables are set correctly
- Verify ImageKit credentials are valid
- Ensure STORAGE_PROVIDER is set to 'imagekit'

#### "File too large"
- Check file size limits (5MB images, 50MB videos)
- Verify multer configuration
- Check client-side file size validation

#### "Invalid file type"
- Verify MIME type is supported
- Check file extension matches MIME type
- Ensure file is not corrupted

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.

## 📝 License

This upload system is part of the Kurerghor ecommerce platform and follows the same licensing terms.

## 🤝 Contributing

When contributing to the upload system:
1. Follow the existing clean architecture patterns
2. Maintain provider abstraction
3. Add comprehensive error handling
4. Update documentation for new features
5. Test with both ImageKit and S3 providers
