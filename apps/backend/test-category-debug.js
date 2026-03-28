/**
 * Test category creation debugging
 */

async function testCategoryCreation() {
  console.log('🧪 Testing category creation debugging...');
  
  // Test FormData parsing
  const FormData = (await import('form-data')).default;
  
  const formData = new FormData();
  formData.append('name', 'Test Category Debug');
  formData.append('slug', 'test-category-debug');
  formData.append('description', 'Debug test category');
  formData.append('status', 'active');
  
  console.log('📋 FormData created:');
  console.log('  name:', 'Test Category Debug');
  console.log('  slug:', 'test-category-debug');
  console.log('  description:', 'Debug test category');
  console.log('  status:', 'active');
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/admin/categories', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const result = await response.json();
    console.log('✅ Response:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCategoryCreation();
