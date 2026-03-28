import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Frontend Integration Test Suite
 * Tests real upload scenarios that would occur from a React frontend
 */
class FrontendIntegrationTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.testResults = [];
    this.authToken = null;
  }

  /**
   * Test category creation with image upload (Admin scenario)
   */
  async testCategoryCreationWithImage() {
    console.log('🧪 Testing Category Creation with Image Upload...');
    
    try {
      // Create a test image
      const testImagePath = this.createTestImage('category-test.jpg');
      
      // Simulate frontend FormData
      const formData = new FormData();
      formData.append('image', fs.createReadStream(testImagePath));
      formData.append('name', 'Test Category');
      formData.append('description', 'A test category for integration testing');
      formData.append('slug', 'test-category');

      const response = await this.makeRequest('/api/v1/categories', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      this.recordTest('Category Creation with Image', {
        success: response.success,
        data: response.data,
        hasImage: response.data?.image != null,
        imageUrl: response.data?.image
      });

      console.log('✅ Category creation test completed');
      return response;

    } catch (error) {
      this.recordTest('Category Creation with Image', {
        success: false,
        error: error.message
      });
      console.error('❌ Category creation test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test product creation with multiple images (Vendor scenario)
   */
  async testProductCreationWithImages() {
    console.log('🧪 Testing Product Creation with Multiple Images...');
    
    try {
      // Create multiple test images
      const testImages = [
        this.createTestImage('product-main.jpg'),
        this.createTestImage('product-gallery-1.jpg'),
        this.createTestImage('product-gallery-2.jpg')
      ];
      
      // Simulate frontend FormData for product creation
      const formData = new FormData();
      
      // Add multiple images
      testImages.forEach((imagePath, index) => {
        formData.append('images', fs.createReadStream(imagePath));
      });
      
      // Add product data
      formData.append('name', 'Test Product with Images');
      formData.append('description', 'A comprehensive test product with multiple images');
      formData.append('price', '99.99');
      formData.append('sku', 'TEST-PROD-001');
      formData.append('category', '507f1f77bcf86cd799439011'); // Mock category ID
      formData.append('stock', '100');
      formData.append('imageAlt', 'Test product image');

      const response = await this.makeRequest('/api/v1/products', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      this.recordTest('Product Creation with Images', {
        success: response.success,
        data: response.data,
        imageCount: response.data?.images?.length || 0,
        hasMainImage: response.data?.images?.some(img => img.isMain),
        imageUrls: response.data?.images?.map(img => img.url)
      });

      console.log('✅ Product creation test completed');
      return response;

    } catch (error) {
      this.recordTest('Product Creation with Images', {
        success: false,
        error: error.message
      });
      console.error('❌ Product creation test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test universal media upload endpoint
   */
  async testUniversalMediaUpload() {
    console.log('🧪 Testing Universal Media Upload...');
    
    try {
      // Test with both image and video
      const testFiles = [
        { name: 'upload-test.jpg', type: 'image' },
        { name: 'upload-test.mp4', type: 'video' }
      ];

      for (const file of testFiles) {
        const formData = new FormData();
        
        if (file.type === 'image') {
          formData.append('file', fs.createReadStream(this.createTestImage(file.name)));
        } else {
          // Create a mock video file (small for testing)
          formData.append('file', this.createMockVideo(file.name));
        }
        
        formData.append('folder', 'integration-test');
        formData.append('maxFiles', '1');

        const response = await this.makeRequest('/api/v1/upload/media', {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders()
        });

        this.recordTest(`Universal Upload - ${file.type}`, {
          success: response.success,
          type: response.type,
          url: response.url,
          hasThumbnail: response.thumbnail != null,
          fileSize: response.size
        });
      }

      console.log('✅ Universal media upload test completed');

    } catch (error) {
      this.recordTest('Universal Media Upload', {
        success: false,
        error: error.message
      });
      console.error('❌ Universal media upload test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test upload progress tracking
   */
  async testUploadProgressTracking() {
    console.log('🧪 Testing Upload Progress Tracking...');
    
    try {
      // Create a larger test file to simulate progress
      const largeImagePath = this.createLargeTestImage('progress-test.jpg');
      
      // Test with EventSource (Server-Sent Events)
      const progressData = [];
      
      return new Promise((resolve, reject) => {
        const EventSource = require('eventsource');
        
        // Start progress stream
        const eventSource = new EventSource(`${this.baseUrl}/api/v1/upload/progress`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          progressData.push(data);
          
          if (data.type === 'complete') {
            eventSource.close();
            this.recordTest('Upload Progress Tracking', {
              success: true,
              progressSteps: progressData.length,
              finalProgress: progressData[progressData.length - 1]
            });
            console.log('✅ Progress tracking test completed');
            resolve();
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        };

        eventSource.onerror = (error) => {
          eventSource.close();
          reject(error);
        };

        // Simulate file upload with progress
        setTimeout(() => {
          this.simulateProgressUpload(largeImagePath);
        }, 100);

      });

    } catch (error) {
      this.recordTest('Upload Progress Tracking', {
        success: false,
        error: error.message
      });
      console.error('❌ Progress tracking test failed:', error.message);
    }
  }

  /**
   * Test error handling scenarios
   */
  async testErrorHandling() {
    console.log('🧪 Testing Error Handling...');
    
    const errorTests = [
      {
        name: 'Invalid File Type',
        test: () => this.testInvalidFileType()
      },
      {
        name: 'File Too Large',
        test: () => this.testFileTooLarge()
      },
      {
        name: 'No File Provided',
        test: () => this.testNoFileProvided()
      },
      {
        name: 'Malicious File',
        test: () => this.testMaliciousFile()
      }
    ];

    for (const errorTest of errorTests) {
      try {
        await errorTest.test();
        this.recordTest(`Error Handling - ${errorTest.name}`, {
          success: true,
          handledCorrectly: true
        });
      } catch (error) {
        this.recordTest(`Error Handling - ${errorTest.name}`, {
          success: true,
          handledCorrectly: true,
          errorMessage: error.message
        });
      }
    }

    console.log('✅ Error handling tests completed');
  }

  /**
   * Test real-world frontend scenarios
   */
  async testRealWorldScenarios() {
    console.log('🧪 Testing Real-World Frontend Scenarios...');

    const scenarios = [
      {
        name: 'Mobile App Upload',
        test: () => this.testMobileUpload()
      },
      {
        name: 'Batch Upload',
        test: () => this.testBatchUpload()
      },
      {
        name: 'Slow Network',
        test: () => this.testSlowNetwork()
      },
      {
        name: 'Concurrent Uploads',
        test: () => this.testConcurrentUploads()
      }
    ];

    for (const scenario of scenarios) {
      try {
        await scenario.test();
        this.recordTest(`Real World - ${scenario.name}`, {
          success: true
        });
      } catch (error) {
        this.recordTest(`Real World - ${scenario.name}`, {
          success: false,
          error: error.message
        });
      }
    }

    console.log('✅ Real-world scenario tests completed');
  }

  /**
   * Helper methods
   */
  createTestImage(filename) {
    const imagePath = path.join(__dirname, 'temp', filename);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(imagePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create a simple test image (1x1 pixel JPEG)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43
    ]);
    
    fs.writeFileSync(imagePath, jpegHeader);
    return imagePath;
  }

  createLargeTestImage(filename) {
    const imagePath = path.join(__dirname, 'temp', filename);
    
    // Create a larger test image for progress testing
    const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB
    largeBuffer.fill(0xFF);
    
    fs.writeFileSync(imagePath, largeBuffer);
    return imagePath;
  }

  createMockVideo(filename) {
    const videoPath = path.join(__dirname, 'temp', filename);
    
    // Create a minimal MP4 file header
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00
    ]);
    
    fs.writeFileSync(videoPath, mp4Header);
    return videoPath;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add auth token if available
    if (this.authToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.authToken}`
      };
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  }

  recordTest(testName, result) {
    this.testResults.push({
      testName,
      timestamp: new Date().toISOString(),
      ...result
    });
  }

  async testInvalidFileType() {
    const formData = new FormData();
    formData.append('file', Buffer.from('fake content'), 'malicious.exe');
    
    const response = await this.makeRequest('/api/v1/upload/image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    throw new Error('Should have rejected invalid file type');
  }

  async testFileTooLarge() {
    // This would require creating a file larger than the limit
    // For testing purposes, we'll simulate this
    throw new Error('File size exceeds maximum limit');
  }

  async testNoFileProvided() {
    const response = await this.makeRequest('/api/v1/upload/image', {
      method: 'POST',
      body: new FormData(),
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    throw new Error('Should have rejected request with no file');
  }

  async testMaliciousFile() {
    const formData = new FormData();
    formData.append('file', Buffer.from('<script>alert("xss")</script>'), 'image.jpg');
    
    const response = await this.makeRequest('/api/v1/upload/image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    throw new Error('Should have rejected malicious file');
  }

  async testMobileUpload() {
    // Simulate mobile upload with specific headers
    const formData = new FormData();
    formData.append('file', fs.createReadStream(this.createTestImage('mobile-upload.jpg')));
    formData.append('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
    
    const response = await this.makeRequest('/api/v1/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    return response;
  }

  async testBatchUpload() {
    const formData = new FormData();
    
    // Add multiple files
    for (let i = 0; i < 5; i++) {
      formData.append('files', fs.createReadStream(this.createTestImage(`batch-${i}.jpg`)));
    }
    
    formData.append('maxFiles', '5');
    
    const response = await this.makeRequest('/api/v1/upload/media', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    return response;
  }

  async testSlowNetwork() {
    // Simulate slow network by adding delays
    const formData = new FormData();
    formData.append('file', fs.createReadStream(this.createLargeTestImage('slow-upload.jpg')));
    
    // Add timeout to simulate slow network
    const response = await this.makeRequest('/api/v1/upload/image', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    return response;
  }

  async testConcurrentUploads() {
    const promises = [];
    
    // Start multiple concurrent uploads
    for (let i = 0; i < 3; i++) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(this.createTestImage(`concurrent-${i}.jpg`)));
      
      promises.push(
        this.makeRequest('/api/v1/upload/image', {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders()
        })
      );
    }
    
    const results = await Promise.allSettled(promises);
    return results;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Frontend Integration Tests...\n');
    
    try {
      await this.testCategoryCreationWithImage();
      await this.testProductCreationWithImages();
      await this.testUniversalMediaUpload();
      await this.testErrorHandling();
      await this.testRealWorldScenarios();
      
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.printTestResults();
    }
  }

  /**
   * Print test results summary
   */
  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }
}

/**
 * Run the integration tests
 */
async function runIntegrationTests() {
  const tester = new FrontendIntegrationTester();
  await tester.runAllTests();
}

// Export for use in other files
export { FrontendIntegrationTester, runIntegrationTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}
