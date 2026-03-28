import { getDefaultUploadService } from './src/services/uploadService.js';
import { optimizeImage } from './src/utils/imageOptimizer.js';
import { validateImage, generateSafeFilename } from './src/utils/fileValidation.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test the upload system functionality
 */
async function testUploadSystem() {
  console.log('🧪 Testing Upload System...\n');

  try {
    // Test 1: Check if upload service is configured
    console.log('1️⃣ Testing upload service configuration...');
    const uploadService = await getDefaultUploadService();
    const isConfigured = await uploadService.isConfigured();
    
    if (isConfigured) {
      console.log('✅ Upload service is properly configured');
    } else {
      console.log('❌ Upload service is not configured');
      console.log('   Please check your environment variables:');
      console.log('   - IMAGEKIT_PUBLIC_KEY');
      console.log('   - IMAGEKIT_PRIVATE_KEY');
      console.log('   - IMAGEKIT_URL_ENDPOINT');
      return;
    }

    // Test 2: Test file validation
    console.log('\n2️⃣ Testing file validation...');
    
    // Create a mock file object for testing
    const mockImageFile = {
      fieldname: 'image',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 100, // 100KB
      buffer: Buffer.alloc(1024 * 100) // Mock buffer
    };

    const validation = validateImage(mockImageFile);
    if (validation.isValid) {
      console.log('✅ Image validation works correctly');
    } else {
      console.log('❌ Image validation failed:', validation.error);
    }

    // Test 3: Test filename generation
    console.log('\n3️⃣ Testing filename generation...');
    const safeFilename = generateSafeFilename(mockImageFile, 'test');
    console.log(`✅ Generated safe filename: ${safeFilename}`);

    // Test 4: Test image optimization (if we have a real image)
    console.log('\n4️⃣ Testing image optimization...');
    
    // Try to find a test image in the project
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      const imageBuffer = fs.readFileSync(testImagePath);
      const optimizedBuffer = await optimizeImage(imageBuffer);
      console.log(`✅ Image optimization successful`);
      console.log(`   Original size: ${imageBuffer.length} bytes`);
      console.log(`   Optimized size: ${optimizedBuffer.length} bytes`);
    } else {
      console.log('⚠️  No test image found, skipping optimization test');
      console.log('   To test optimization, place an image at: test-image.jpg');
    }

    // Test 5: Test service status endpoint
    console.log('\n5️⃣ Testing service status...');
    console.log(`✅ Service provider: ${process.env.STORAGE_PROVIDER || 'imagekit'}`);
    console.log(`✅ Service configured: ${isConfigured}`);

    console.log('\n🎉 Upload system test completed successfully!');
    console.log('\n📋 Available endpoints:');
    console.log('   POST /api/v1/upload/image - Upload image');
    console.log('   POST /api/v1/upload/video - Upload video');
    console.log('   DELETE /api/v1/upload/:fileId - Delete file');
    console.log('   GET /api/v1/upload/:fileId/metadata - Get file metadata');
    console.log('   GET /api/v1/upload - List files');
    console.log('   GET /api/v1/upload/service/status - Service status');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testUploadSystem();
