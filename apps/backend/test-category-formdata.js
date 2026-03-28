import FormData from 'form-data';
import axios from 'axios';

// Test the category creation endpoint with FormData
const testCategoryCreation = async () => {
  try {
    console.log('🧪 Testing category creation with FormData...');
    
    // Create FormData
    const formData = new FormData();
    formData.append('name', 'Test Category');
    formData.append('slug', 'test-category');
    formData.append('description', 'This is a test category created via FormData');
    formData.append('status', 'active');
    
    // Optional: Add a test image (create a simple buffer)
    const testImageBuffer = Buffer.from('fake-image-data');
    formData.append('image', testImageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('📋 FormData created with fields:', Array.from(formData.keys()));
    
    // Make the request
    const response = await axios.post('http://localhost:5000/api/v1/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Run the test
testCategoryCreation();
