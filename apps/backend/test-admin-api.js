// Test admin categories API directly
import axios from 'axios';

const testAdminCategoriesAPI = async () => {
  try {
    console.log('🧪 Testing admin categories API...');
    
    const response = await axios.get('http://localhost:5000/api/v1/admin/categories', {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      withCredentials: true
    });
    
    console.log('✅ Direct API Test Results:');
    console.log('  - Status:', response.status);
    console.log('  - Data type:', typeof response.data);
    console.log('  - Data:', response.data);
    console.log('  - Data.data type:', typeof response.data?.data);
    console.log('  - Data.data:', response.data?.data);
    console.log('  - Is data.data array?', Array.isArray(response.data?.data));
    
    if (Array.isArray(response.data?.data)) {
      console.log('  - Array length:', response.data.data.length);
      console.log('  - Categories:', response.data.data.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        id: cat._id
      })));
    }
    
  } catch (error) {
    console.error('❌ Direct API Test Error:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Data:', error.response.data);
    }
  }
};

testAdminCategoriesAPI();
