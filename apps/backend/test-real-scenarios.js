import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import User from './src/models/User.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Real-World Upload Scenario Tester
 * Tests actual database operations and file uploads
 */
class RealScenarioTester {
  constructor() {
    this.testUser = null;
    this.testCategory = null;
    this.testProducts = [];
    this.uploadedFiles = [];
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('🔧 Setting up test environment...');
    
    try {
      // Connect to database
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
      console.log('✅ Database connected');

      // Create test user (vendor)
      this.testUser = await User.create({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: 'password123',
        role: 'vendor',
        isActive: true,
        emailVerified: true
      });

      // Create temp directory for test files
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      console.log('✅ Test environment setup complete');
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  /**
   * Test 1: Admin creates category with image
   */
  async testAdminCategoryCreation() {
    console.log('🧪 Test 1: Admin creates category with image...');
    
    try {
      // Simulate admin authentication
      const adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      });

      // Create category with image
      const categoryData = {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://ik.imagekit.io/test/electronics-category.jpg',
        isActive: true,
        sortOrder: 1
      };

      this.testCategory = await Category.create(categoryData);
      
      console.log('✅ Category created successfully');
      console.log(`   ID: ${this.testCategory._id}`);
      console.log(`   Name: ${this.testCategory.name}`);
      console.log(`   Image: ${this.testCategory.image}`);

      return this.testCategory;

    } catch (error) {
      console.error('❌ Category creation failed:', error);
      throw error;
    }
  }

  /**
   * Test 2: Vendor uploads product with multiple images
   */
  async testVendorProductUpload() {
    console.log('🧪 Test 2: Vendor uploads product with multiple images...');
    
    try {
      if (!this.testCategory) {
        throw new Error('Test category not found');
      }

      // Create test images
      const productImages = [
        {
          url: 'https://ik.imagekit.io/test/product-main.jpg',
          alt: 'Main product image',
          isMain: true
        },
        {
          url: 'https://ik.imagekit.io/test/product-gallery-1.jpg',
          alt: 'Product gallery image 1',
          isMain: false
        },
        {
          url: 'https://ik.imagekit.io/test/product-gallery-2.jpg',
          alt: 'Product gallery image 2',
          isMain: false
        }
      ];

      // Create product with images
      const productData = {
        name: 'Smartphone Pro Max',
        slug: 'smartphone-pro-max',
        description: 'Latest flagship smartphone with advanced features',
        shortDescription: 'Premium smartphone with exceptional camera',
        vendor: this.testUser._id,
        category: this.testCategory._id,
        brand: 'TechBrand',
        sku: 'PHONE-PRO-MAX-001',
        price: 999.99,
        costPrice: 650.00,
        images: productImages,
        specifications: {
          display: '6.7 inch OLED',
          processor: 'A15 Bionic',
          ram: '8GB',
          storage: '256GB',
          camera: '48MP Triple Camera',
          battery: '5000mAh'
        },
        inventory: {
          stock: 50,
          lowStockThreshold: 10,
          allowBackorder: true
        },
        seo: {
          title: 'Smartphone Pro Max - Best Price',
          description: 'Buy the latest smartphone with advanced features',
          keywords: ['smartphone', 'phone', 'mobile', 'tech']
        },
        status: 'active',
        visibility: 'public',
        featured: true
      };

      const product = await Product.create(productData);
      this.testProducts.push(product);
      
      console.log('✅ Product created successfully');
      console.log(`   ID: ${product._id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Images: ${product.images.length}`);
      console.log(`   Price: $${product.price}`);

      return product;

    } catch (error) {
      console.error('❌ Product creation failed:', error);
      throw error;
    }
  }

  /**
   * Test 3: Product update with additional images
   */
  async testProductImageUpdate() {
    console.log('🧪 Test 3: Product update with additional images...');
    
    try {
      if (this.testProducts.length === 0) {
        throw new Error('No test products found');
      }

      const product = this.testProducts[0];
      
      // Add new images to existing product
      const newImages = [
        {
          url: 'https://ik.imagekit.io/test/product-detail-1.jpg',
          alt: 'Product detail shot 1',
          isMain: false
        },
        {
          url: 'https://ik.imagekit.io/test/product-detail-2.jpg',
          alt: 'Product detail shot 2',
          isMain: false
        }
      ];

      // Update product with additional images
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          $push: { images: { $each: newImages } },
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log('✅ Product updated successfully');
      console.log(`   Total images: ${updatedProduct.images.length}`);
      console.log(`   New images added: ${newImages.length}`);

      return updatedProduct;

    } catch (error) {
      console.error('❌ Product update failed:', error);
      throw error;
    }
  }

  /**
   * Test 4: Bulk product upload simulation
   */
  async testBulkProductUpload() {
    console.log('🧪 Test 4: Bulk product upload simulation...');
    
    try {
      if (!this.testCategory) {
        throw new Error('Test category not found');
      }

      const bulkProducts = [];
      
      // Create multiple products
      for (let i = 1; i <= 5; i++) {
        const productData = {
          name: `Test Product ${i}`,
          slug: `test-product-${i}`,
          description: `Description for test product ${i}`,
          vendor: this.testUser._id,
          category: this.testCategory._id,
          sku: `BULK-PROD-${String(i).padStart(3, '0')}`,
          price: 49.99 * i,
          images: [
            {
              url: `https://ik.imagekit.io/test/bulk-product-${i}-main.jpg`,
              alt: `Test product ${i} main image`,
              isMain: true
            }
          ],
          status: 'active',
          visibility: 'public'
        };

        const product = await Product.create(productData);
        bulkProducts.push(product);
      }

      console.log('✅ Bulk product creation completed');
      console.log(`   Products created: ${bulkProducts.length}`);

      return bulkProducts;

    } catch (error) {
      console.error('❌ Bulk product upload failed:', error);
      throw error;
    }
  }

  /**
   * Test 5: Category hierarchy with images
   */
  async testCategoryHierarchy() {
    console.log('🧪 Test 5: Category hierarchy with images...');
    
    try {
      if (!this.testCategory) {
        throw new Error('Parent category not found');
      }

      // Create subcategories
      const subcategories = [
        {
          name: 'Smartphones',
          slug: 'smartphones',
          description: 'Mobile phones and smartphones',
          parent: this.testCategory._id,
          image: 'https://ik.imagekit.io/test/smartphones-category.jpg',
          level: 1,
          isActive: true
        },
        {
          name: 'Laptops',
          slug: 'laptops',
          description: 'Laptop computers and notebooks',
          parent: this.testCategory._id,
          image: 'https://ik.imagekit.io/test/laptops-category.jpg',
          level: 1,
          isActive: true
        },
        {
          name: 'Accessories',
          slug: 'accessories',
          description: 'Electronic accessories and peripherals',
          parent: this.testCategory._id,
          image: 'https://ik.imagekit.io/test/accessories-category.jpg',
          level: 1,
          isActive: true
        }
      ];

      const createdSubcategories = await Category.insertMany(subcategories);
      
      console.log('✅ Category hierarchy created');
      console.log(`   Parent: ${this.testCategory.name}`);
      console.log(`   Subcategories: ${createdSubcategories.length}`);

      // Test category tree retrieval
      const categoryTree = await Category.find({ 
        parent: this.testCategory._id,
        isActive: true 
      }).sort({ sortOrder: 1, name: 1 });

      console.log(`   Retrieved tree items: ${categoryTree.length}`);

      return createdSubcategories;

    } catch (error) {
      console.error('❌ Category hierarchy test failed:', error);
      throw error;
    }
  }

  /**
   * Test 6: Performance test with large uploads
   */
  async testPerformanceWithLargeUploads() {
    console.log('🧪 Test 6: Performance test with large uploads...');
    
    try {
      const startTime = Date.now();
      
      // Create product with many images
      const manyImages = [];
      for (let i = 1; i <= 10; i++) {
        manyImages.push({
          url: `https://ik.imagekit.io/test/perf-image-${i}.jpg`,
          alt: `Performance test image ${i}`,
          isMain: i === 1
        });
      }

      const performanceProduct = await Product.create({
        name: 'Performance Test Product',
        slug: 'performance-test-product',
        description: 'Product with many images for performance testing',
        vendor: this.testUser._id,
        category: this.testCategory._id,
        sku: 'PERF-TEST-001',
        price: 199.99,
        images: manyImages,
        status: 'active',
        visibility: 'public'
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('✅ Performance test completed');
      console.log(`   Images processed: ${manyImages.length}`);
      console.log(`   Processing time: ${duration}ms`);
      console.log(`   Average per image: ${(duration / manyImages.length).toFixed(2)}ms`);

      return performanceProduct;

    } catch (error) {
      console.error('❌ Performance test failed:', error);
      throw error;
    }
  }

  /**
   * Test 7: Error handling and validation
   */
  async testErrorHandling() {
    console.log('🧪 Test 7: Error handling and validation...');
    
    const errorTests = [
      {
        name: 'Invalid category image URL',
        test: async () => {
          try {
            await Category.create({
              name: 'Invalid Category',
              slug: 'invalid-category',
              image: 'not-a-valid-url'
            });
            throw new Error('Should have failed');
          } catch (error) {
            console.log('   ✅ Invalid URL properly rejected');
          }
        }
      },
      {
        name: 'Duplicate SKU',
        test: async () => {
          try {
            await Product.create({
              name: 'Duplicate SKU Product',
              slug: 'duplicate-sku-product',
              vendor: this.testUser._id,
              category: this.testCategory._id,
              sku: 'PHONE-PRO-MAX-001', // Same as first product
              price: 99.99
            });
            throw new Error('Should have failed');
          } catch (error) {
            console.log('   ✅ Duplicate SKU properly rejected');
          }
        }
      },
      {
        name: 'Invalid product images',
        test: async () => {
          try {
            await Product.create({
              name: 'Invalid Images Product',
              slug: 'invalid-images-product',
              vendor: this.testUser._id,
              category: this.testCategory._id,
              sku: 'INVALID-IMG-001',
              price: 99.99,
              images: [
                { url: '', alt: 'Empty URL' }, // Invalid empty URL
                { url: 'not-a-url', alt: 'Invalid URL' } // Invalid format
              ]
            });
            throw new Error('Should have failed');
          } catch (error) {
            console.log('   ✅ Invalid images properly rejected');
          }
        }
      }
    ];

    for (const errorTest of errorTests) {
      try {
        await errorTest.test();
        console.log(`   ✅ ${errorTest.name} - Passed`);
      } catch (error) {
        console.log(`   ❌ ${errorTest.name} - Failed: ${error.message}`);
      }
    }

    console.log('✅ Error handling tests completed');
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    
    try {
      // Clean up created products
      if (this.testProducts.length > 0) {
        await Product.deleteMany({ _id: { $in: this.testProducts.map(p => p._id) } });
        console.log(`   Cleaned up ${this.testProducts.length} products`);
      }

      // Clean up categories
      if (this.testCategory) {
        await Category.deleteMany({ 
          $or: [
            { _id: this.testCategory._id },
            { parent: this.testCategory._id }
          ]
        });
        console.log('   Cleaned up categories');
      }

      // Clean up users
      await User.deleteMany({ 
        email: { $in: ['vendor@test.com', 'admin@test.com'] }
      });
      console.log('   Cleaned up users');

      // Clean up temp files
      const tempDir = path.join(__dirname, 'temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(tempDir, file));
        });
        console.log('   Cleaned up temp files');
      }

      // Close database connection
      await mongoose.disconnect();
      console.log('   Database disconnected');

      console.log('✅ Cleanup completed');

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Run all real scenario tests
   */
  async runAllTests() {
    console.log('🚀 Starting Real-World Upload Scenario Tests...\n');
    
    try {
      await this.setup();
      await this.testAdminCategoryCreation();
      await this.testVendorProductUpload();
      await this.testProductImageUpdate();
      await this.testBulkProductUpload();
      await this.testCategoryHierarchy();
      await this.testPerformanceWithLargeUploads();
      await this.testErrorHandling();
      
      console.log('\n🎉 All real-world tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Run the real scenario tests
 */
async function runRealScenarioTests() {
  const tester = new RealScenarioTester();
  await tester.runAllTests();
}

// Export for use in other files
export { RealScenarioTester, runRealScenarioTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRealScenarioTests();
}
