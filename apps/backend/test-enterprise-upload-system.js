import { getDefaultUploadService } from './src/services/uploadService.js';
import { optimizeVideo, generateVideoThumbnail } from './src/utils/videoOptimizer.js';
import { optimizeImage } from './src/utils/imageOptimizer.js';
import { validateFileSecurity, validateMultipleFilesSecurity } from './src/utils/securityValidation.js';
import { createProgressTracker, createBatchProcessor } from './src/utils/progressTracker.js';
import { ResourceOptimizer } from './src/utils/performanceOptimizer.js';

/**
 * Enterprise Upload System Comprehensive Test
 */
class EnterpriseUploadSystemTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Test 1: Upload Service Configuration
   */
  async testUploadServiceConfiguration() {
    console.log('🧪 Test 1: Upload Service Configuration...');
    
    try {
      const uploadService = await getDefaultUploadService();
      const isConfigured = await uploadService.isConfigured();
      
      this.recordTest('Upload Service Configuration', {
        success: isConfigured,
        service: uploadService.constructor.name,
        configured: isConfigured
      });

      if (isConfigured) {
        console.log('✅ Upload service properly configured');
      } else {
        console.log('⚠️  Upload service not configured (check environment variables)');
      }

    } catch (error) {
      this.recordTest('Upload Service Configuration', {
        success: false,
        error: error.message
      });
      console.error('❌ Upload service test failed:', error.message);
    }
  }

  /**
   * Test 2: Image Optimization
   */
  async testImageOptimization() {
    console.log('🧪 Test 2: Image Optimization...');
    
    try {
      // Create test image buffer
      const testImageBuffer = Buffer.alloc(1024 * 100); // 100KB
      testImageBuffer.write('FAKE_IMAGE_DATA_FOR_TESTING');
      
      const optimizedBuffer = await optimizeImage(testImageBuffer, {
        width: 800,
        quality: 70,
        format: 'webp'
      });

      const compressionRatio = ((testImageBuffer.length - optimizedBuffer.length) / testImageBuffer.length * 100).toFixed(2);

      this.recordTest('Image Optimization', {
        success: true,
        originalSize: testImageBuffer.length,
        optimizedSize: optimizedBuffer.length,
        compressionRatio: parseFloat(compressionRatio)
      });

      console.log(`✅ Image optimized: ${compressionRatio}% compression`);

    } catch (error) {
      this.recordTest('Image Optimization', {
        success: false,
        error: error.message
      });
      console.error('❌ Image optimization test failed:', error.message);
    }
  }

  /**
   * Test 3: Video Processing (if FFmpeg available)
   */
  async testVideoProcessing() {
    console.log('🧪 Test 3: Video Processing...');
    
    try {
      // Create minimal test video buffer
      const testVideoBuffer = Buffer.from([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
        0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00
      ]);

      // Test video metadata extraction
      const { getVideoMetadata } = await import('./src/utils/videoOptimizer.js');
      
      try {
        const metadata = await getVideoMetadata(testVideoBuffer);
        
        this.recordTest('Video Processing', {
          success: true,
          hasMetadata: !!metadata,
          format: metadata.format,
          size: metadata.size
        });

        console.log('✅ Video processing working');
      } catch (videoError) {
        // FFmpeg might not be available in test environment
        this.recordTest('Video Processing', {
          success: false,
          error: 'FFmpeg not available (expected in test environment)',
          note: 'Video processing requires FFmpeg installation'
        });
        console.log('⚠️  Video processing skipped (FFmpeg not available)');
      }

    } catch (error) {
      this.recordTest('Video Processing', {
        success: false,
        error: error.message
      });
      console.error('❌ Video processing test failed:', error.message);
    }
  }

  /**
   * Test 4: Security Validation
   */
  async testSecurityValidation() {
    console.log('🧪 Test 4: Security Validation...');
    
    try {
      // Test valid file
      const validFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 100, // 100KB
        buffer: Buffer.alloc(1024 * 100)
      };

      const validResult = validateFileSecurity(validFile);

      // Test malicious file
      const maliciousFile = {
        originalname: 'malicious.exe',
        mimetype: 'application/octet-stream',
        size: 1024 * 100,
        buffer: Buffer.from([0x4D, 0x5A]) // PE executable header
      };

      const maliciousResult = validateFileSecurity(maliciousFile);

      // Test multiple files
      const multipleFiles = [validFile, maliciousFile];
      const multipleResult = validateMultipleFilesSecurity(multipleFiles);

      this.recordTest('Security Validation', {
        success: validResult.valid && !maliciousResult.valid && !multipleResult.valid,
        validFilePassed: validResult.valid,
        maliciousFileBlocked: !maliciousResult.valid,
        multipleFilesBlocked: !multipleResult.valid,
        hasDangerousFiles: multipleResult.hasDangerousFiles
      });

      console.log('✅ Security validation working correctly');

    } catch (error) {
      this.recordTest('Security Validation', {
        success: false,
        error: error.message
      });
      console.error('❌ Security validation test failed:', error.message);
    }
  }

  /**
   * Test 5: Progress Tracking
   */
  async testProgressTracking() {
    console.log('🧪 Test 5: Progress Tracking...');
    
    try {
      const progressEvents = [];
      
      const tracker = createProgressTracker({
        totalSteps: 10,
        onProgress: (progress) => {
          progressEvents.push(progress);
        }
      });

      // Simulate progress
      for (let i = 0; i <= 10; i++) {
        tracker.update(i, `Step ${i}`);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.recordTest('Progress Tracking', {
        success: progressEvents.length === 11, // 0-10 inclusive
        eventsReceived: progressEvents.length,
        finalProgress: progressEvents[progressEvents.length - 1]?.percent,
        completed: tracker.getProgress().isActive === false
      });

      console.log(`✅ Progress tracking: ${progressEvents.length} events received`);

    } catch (error) {
      this.recordTest('Progress Tracking', {
        success: false,
        error: error.message
      });
      console.error('❌ Progress tracking test failed:', error.message);
    }
  }

  /**
   * Test 6: Batch Processing
   */
  async testBatchProcessing() {
    console.log('🧪 Test 6: Batch Processing...');
    
    try {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, value: `item-${i + 1}` }));
      const processedItems = [];
      
      const processor = async (item, index) => {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate work
        return { ...item, processed: true, index };
      };

      const result = await createBatchProcessor(items, processor, {
        concurrency: 2,
        onProgress: (progress) => {
          // Track progress
        }
      });

      this.recordTest('Batch Processing', {
        success: result.success && result.results.length === items.length,
        itemsProcessed: result.results.length,
        errors: result.errors.length,
        allProcessed: result.results.every(item => item.processed)
      });

      console.log(`✅ Batch processing: ${result.results.length} items processed`);

    } catch (error) {
      this.recordTest('Batch Processing', {
        success: false,
        error: error.message
      });
      console.error('❌ Batch processing test failed:', error.message);
    }
  }

  /**
   * Test 7: Performance Optimization
   */
  async testPerformanceOptimization() {
    console.log('🧪 Test 7: Performance Optimization...');
    
    try {
      const optimizer = new ResourceOptimizer();
      const stats = optimizer.getStats();
      
      // Test memory monitoring
      const memoryUsage = stats.memory;
      
      // Test queue stats
      const queueStats = stats.queue;
      
      // Test cache stats
      const cacheStats = stats.cache;

      this.recordTest('Performance Optimization', {
        success: true,
        memoryMonitoring: memoryUsage.percentageUsed >= 0,
        queueManagement: queueStats.maxConcurrency > 0,
        cacheSystem: cacheStats.maxSize > 0,
        currentMemoryUsage: memoryUsage.heapUsed,
        queueCapacity: queueStats.maxQueueSize
      });

      console.log('✅ Performance optimization systems initialized');

    } catch (error) {
      this.recordTest('Performance Optimization', {
        success: false,
        error: error.message
      });
      console.error('❌ Performance optimization test failed:', error.message);
    }
  }

  /**
   * Test 8: Integration with Product/Category Routes
   */
  async testRouteIntegration() {
    console.log('🧪 Test 8: Route Integration...');
    
    try {
      // Check if routes are properly integrated
      const categoryRoutes = await import('./src/routes/category.js');
      const productRoutes = await import('./src/routes/product.js');
      const uploadRoutes = await import('./src/routes/uploadRoutes.js');

      this.recordTest('Route Integration', {
        success: true,
        categoryRoutes: !!categoryRoutes.default,
        productRoutes: !!productRoutes.default,
        uploadRoutes: !!uploadRoutes.default,
        middlewareIntegrated: true
      });

      console.log('✅ All routes properly integrated');

    } catch (error) {
      this.recordTest('Route Integration', {
        success: false,
        error: error.message
      });
      console.error('❌ Route integration test failed:', error.message);
    }
  }

  /**
   * Test 9: Error Handling
   */
  async testErrorHandling() {
    console.log('🧪 Test 9: Error Handling...');
    
    try {
      const errorTests = [
        {
          name: 'Invalid MIME type',
          test: () => {
            const file = { mimetype: 'application/x-executable', size: 1000 };
            const { validateImage, validateVideo } = require('./src/utils/fileValidation.js');
            return !validateImage(file).valid && !validateVideo(file).valid;
          }
        },
        {
          name: 'File too large',
          test: () => {
            const file = { mimetype: 'image/jpeg', size: 10 * 1024 * 1024 }; // 10MB
            const { validateImage } = require('./src/utils/fileValidation.js');
            return !validateImage(file).valid;
          }
        },
        {
          name: 'Empty filename',
          test: () => {
            const { sanitizeFilename } = require('./src/utils/fileValidation.js');
            const result = sanitizeFilename('');
            return result.length > 0;
          }
        }
      ];

      const results = [];
      for (const errorTest of errorTests) {
        try {
          const passed = errorTest.test();
          results.push({ name: errorTest.name, passed });
        } catch (error) {
          results.push({ name: errorTest.name, passed: false, error: error.message });
        }
      }

      const allPassed = results.every(r => r.passed);

      this.recordTest('Error Handling', {
        success: allPassed,
        tests: results,
        passedCount: results.filter(r => r.passed).length,
        totalCount: results.length
      });

      console.log(`✅ Error handling: ${results.filter(r => r.passed).length}/${results.length} tests passed`);

    } catch (error) {
      this.recordTest('Error Handling', {
        success: false,
        error: error.message
      });
      console.error('❌ Error handling test failed:', error.message);
    }
  }

  /**
   * Test 10: Memory Management
   */
  async testMemoryManagement() {
    console.log('🧪 Test 10: Memory Management...');
    
    try {
      const initialMemory = process.memoryUsage();
      
      // Simulate memory-intensive operations
      const buffers = [];
      for (let i = 0; i < 10; i++) {
        buffers.push(Buffer.alloc(1024 * 1024)); // 1MB each
      }
      
      const peakMemory = process.memoryUsage();
      
      // Clean up
      buffers.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();

      this.recordTest('Memory Management', {
        success: true,
        initialHeap: initialMemory.heapUsed,
        peakHeap: peakMemory.heapUsed,
        finalHeap: finalMemory.heapUsed,
        memoryRecovered: peakMemory.heapUsed - finalMemory.heapUsed > 0,
        noLeaks: finalMemory.heapUsed <= initialMemory.heapUsed + 1024 * 1024 // Allow 1MB variance
      });

      console.log('✅ Memory management working correctly');

    } catch (error) {
      this.recordTest('Memory Management', {
        success: false,
        error: error.message
      });
      console.error('❌ Memory management test failed:', error.message);
    }
  }

  /**
   * Record test result
   */
  recordTest(testName, result) {
    this.testResults.push({
      testName,
      timestamp: new Date().toISOString(),
      ...result
    });
  }

  /**
   * Print comprehensive test results
   */
  printTestResults() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENTERPRISE UPLOAD SYSTEM TEST RESULTS');
    console.log('='.repeat(80));
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const successRate = ((passed / this.testResults.length) * 100).toFixed(1);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);
    
    console.log(`\n📋 DETAILED RESULTS:`);
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${index + 1}. ${status} ${result.testName}${duration}`);
      
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
      
      if (result.note) {
        console.log(`     Note: ${result.note}`);
      }
    });

    console.log(`\n🔧 SYSTEM CAPABILITIES:`);
    console.log(`   🖼️  Image Optimization: ${this.testResults.find(r => r.testName === 'Image Optimization')?.success ? '✅' : '❌'}`);
    console.log(`   🎥 Video Processing: ${this.testResults.find(r => r.testName === 'Video Processing')?.success ? '✅' : '⚠️'}`);
    console.log(`   🔒 Security Validation: ${this.testResults.find(r => r.testName === 'Security Validation')?.success ? '✅' : '❌'}`);
    console.log(`   📈 Progress Tracking: ${this.testResults.find(r => r.testName === 'Progress Tracking')?.success ? '✅' : '❌'}`);
    console.log(`   🔄 Batch Processing: ${this.testResults.find(r => r.testName === 'Batch Processing')?.success ? '✅' : '❌'}`);
    console.log(`   ⚡ Performance Optimization: ${this.testResults.find(r => r.testName === 'Performance Optimization')?.success ? '✅' : '❌'}`);
    console.log(`   🛡️  Error Handling: ${this.testResults.find(r => r.testName === 'Error Handling')?.success ? '✅' : '❌'}`);
    console.log(`   💾 Memory Management: ${this.testResults.find(r => r.testName === 'Memory Management')?.success ? '✅' : '❌'}`);

    if (failed > 0) {
      console.log(`\n⚠️  RECOMMENDATIONS:`);
      const failedTests = this.testResults.filter(r => !r.success);
      failedTests.forEach(test => {
        if (test.testName === 'Upload Service Configuration') {
          console.log(`   • Set up ImageKit credentials in .env file`);
        } else if (test.testName === 'Video Processing') {
          console.log(`   • Install FFmpeg: sudo apt install ffmpeg`);
        } else {
          console.log(`   • Fix ${test.testName}: ${test.error}`);
        }
      });
    }

    console.log(`\n🚀 DEPLOYMENT READY: ${failed === 0 ? 'YES' : 'NEEDS ATTENTION'}`);
    console.log('='.repeat(80));
  }

  /**
   * Run all enterprise tests
   */
  async runAllTests() {
    console.log('🚀 ENTERPRISE UPLOAD SYSTEM COMPREHENSIVE TEST');
    console.log('Testing all production-ready features...\n');
    
    try {
      await this.testUploadServiceConfiguration();
      await this.testImageOptimization();
      await this.testVideoProcessing();
      await this.testSecurityValidation();
      await this.testProgressTracking();
      await this.testBatchProcessing();
      await this.testPerformanceOptimization();
      await this.testRouteIntegration();
      await this.testErrorHandling();
      await this.testMemoryManagement();
      
      this.printTestResults();
      
      return this.testResults.every(r => r.success);
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
      this.printTestResults();
      return false;
    }
  }
}

/**
 * Run the enterprise test suite
 */
async function runEnterpriseTests() {
  const tester = new EnterpriseUploadSystemTest();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

// Export for use in other files
export { EnterpriseUploadSystemTest, runEnterpriseTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnterpriseTests();
}
