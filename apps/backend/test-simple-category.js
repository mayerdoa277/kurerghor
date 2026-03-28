/**
 * Simple test to check category route without auth
 */

// Test direct call to the category creation handler
import Category from './src/models/Category.js';

async function testDirectCategoryCreation() {
  console.log('🧪 Testing direct category creation...');
  
  try {
    // Simulate what should be in req.body after multer processes FormData
    const mockReq = {
      body: {
        name: 'Test Category Direct',
        slug: 'test-category-direct',
        description: 'Direct test category',
        status: 'active'
      },
      file: null // No file for this test
    };
    
    console.log('📋 Mock request body:', mockReq.body);
    
    // Test the validation logic we wrote
    const { name, slug, description } = mockReq.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('❌ Name validation failed:', name);
      return;
    }
    
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.log('❌ Slug validation failed:', slug);
      return;
    }
    
    console.log('✅ Manual validation passed');
    
    // Test database creation
    const categoryData = { ...mockReq.body };
    console.log('📋 Category data for DB:', categoryData);
    
    const category = await Category.create(categoryData);
    console.log('✅ Category created in DB:', category._id);
    
  } catch (error) {
    console.error('❌ Direct test failed:', error);
  }
}

testDirectCategoryCreation();
