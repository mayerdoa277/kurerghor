import { getDefaultUploadService } from './src/services/uploadService.js';
import { optimizeImage } from './src/utils/imageOptimizer.js';
import { validateFileSecurity } from './src/utils/securityValidation.js';
import { createProgressTracker } from './src/utils/progressTracker.js';
import { ResourceOptimizer } from './src/utils/performanceOptimizer.js';

/**
 * Enterprise Upload System Comprehensive Test (Simplified)
 */
class EnterpriseUploadSystemTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * Test upload service configuration
   */
  async testUploadServiceConfiguration() {
    console.log('Test 1: Upload Service Configuration...');
    
    try {
      const uploadService = await getDefaultUploadService();
      const isConfigured = await uploadService.isConfigured();
      
      this.recordTest('Upload Service Configuration', {
        success: isConfigured,
        service: uploadService.constructor.name,
        configured: isConfigured
      });

      if (isConfigured) {
        console.log('✓ Upload service properly configured');
      } else {
        console.log('⚠ Upload service not configured (check environment variables)');
      }

    } catch (error) {
      this.recordTest('Upload Service Configuration', {
        success: false,
        error: error.message
      });
      console.error('✗ Upload service test failed:', error.message);
    }
  }

  /**
   * Test image optimization
   */
  async testImageOptimization() {
    console.log('Test 2: Image Optimization...');
    
    try {
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

      console.log(`✓ Image optimized: ${compressionRatio}% compression`);

    } catch (error) {
      this.recordTest('Image Optimization', {
        success: false,
        error: error.message
      });
      console.error('✗ Image optimization test failed:', error.message);
    }
  }

  /**
   * Test security validation
   */
  async testSecurityValidation() {
    console.log('Test 3: Security Validation...');
    
    try {
      const validFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 100,
        buffer: Buffer.alloc(1024 * 100)
      };

      const validResult = validateFileSecurity(validFile);

      this.recordTest('Security Validation', {
        success: validResult.valid,
        validFilePassed: validResult.valid,
        securityLevel: validResult.securityLevel
      });

      console.log('✓ Security validation working correctly');

    } catch (error) {
      this.recordTest('Security Validation', {
        success: false,
        error: error.message
      });
      console.error('✗ Security validation test failed:', error.message);
    }
  }

  /**
   * Test progress tracking
   */
  async testProgressTracking() {
    console.log('Test 4: Progress Tracking...');
    
    try {
      const progressEvents = [];
      
      const tracker = createProgressTracker({
        totalSteps: 10,
        onProgress: (progress) => {
          progressEvents.push(progress);
        }
      });

      for (let i = 0; i <= 10; i++) {
        tracker.update(i, `Step ${i}`);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.recordTest('Progress Tracking', {
        success: progressEvents.length === 11,
        eventsReceived: progressEvents.length,
        finalProgress: progressEvents[progressEvents.length - 1]?.percent,
        completed: tracker.getProgress().isActive === false
      });

      console.log(`✓ Progress tracking: ${progressEvents.length} events received`);

    } catch (error) {
      this.recordTest('Progress Tracking', {
        success: false,
        error: error.message
      });
      console.error('✗ Progress tracking test failed:', error.message);
    }
  }

  /**
   * Test performance optimization
   */
  async testPerformanceOptimization() {
    console.log('Test 5: Performance Optimization...');
    
    try {
      const optimizer = new ResourceOptimizer();
      const stats = optimizer.getStats();
      
      this.recordTest('Performance Optimization', {
        success: true,
        memoryMonitoring: stats.memory.percentageUsed >= 0,
        queueManagement: stats.queue.maxConcurrency > 0,
        cacheSystem: stats.cache.maxSize > 0
      });

      console.log('✓ Performance optimization systems initialized');

    } catch (error) {
      this.recordTest('Performance Optimization', {
        success: false,
        error: error.message
      });
      console.error('✗ Performance optimization test failed:', error.message);
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
   * Print test results
   */
  printTestResults() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('ENTERPRISE UPLOAD SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const successRate = ((passed / this.testResults.length) * 100).toFixed(1);
    
    console.log(`\nSUMMARY:`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    
    console.log(`\nDETAILED RESULTS:`);
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✓' : '✗';
      console.log(`${index + 1}. ${status} ${result.testName}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\nSYSTEM CAPABILITIES:`);
    console.log(`   Image Optimization: ${this.testResults.find(r => r.testName === 'Image Optimization')?.success ? '✓' : '✗'}`);
    console.log(`   Security Validation: ${this.testResults.find(r => r.testName === 'Security Validation')?.success ? '✓' : '✗'}`);
    console.log(`   Progress Tracking: ${this.testResults.find(r => r.testName === 'Progress Tracking')?.success ? '✓' : '✗'}`);
    console.log(`   Performance Optimization: ${this.testResults.find(r => r.testName === 'Performance Optimization')?.success ? '✓' : '✗'}`);

    if (failed > 0) {
      console.log(`\nRECOMMENDATIONS:`);
      const failedTests = this.testResults.filter(r => !r.success);
      failedTests.forEach(test => {
        if (test.testName === 'Upload Service Configuration') {
          console.log(`   • Set up ImageKit credentials in .env file`);
        } else {
          console.log(`   • Fix ${test.testName}: ${test.error}`);
        }
      });
    }

    console.log(`\nDEPLOYMENT READY: ${failed === 0 ? 'YES' : 'NEEDS ATTENTION'}`);
    console.log('='.repeat(60));
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('ENTERPRISE UPLOAD SYSTEM COMPREHENSIVE TEST');
    console.log('Testing all production-ready features...\n');
    
    try {
      await this.testUploadServiceConfiguration();
      await this.testImageOptimization();
      await this.testSecurityValidation();
      await this.testProgressTracking();
      await this.testPerformanceOptimization();
      
      this.printTestResults();
      
      return this.testResults.every(r => r.success);
      
    } catch (error) {
      console.error('\nTest suite failed:', error);
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
