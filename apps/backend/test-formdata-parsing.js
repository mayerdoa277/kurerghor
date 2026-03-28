/**
 * Test FormData parsing without authentication
 */

import express from 'express';
import multer from 'multer';
import pkg from 'form-data';
const { FormData } = pkg;

const app = express();

// Configure body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for testing
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Test route
app.post('/test-formdata', upload.single('test'), (req, res) => {
  console.log('🔍 FormData Parsing Test:');
  console.log('📋 Request headers:', req.headers);
  console.log('📋 Request body:', req.body);
  console.log('📋 Request file:', req.file);
  console.log('📋 Body keys:', Object.keys(req.body || {}));
  
  res.json({
    success: true,
    bodyReceived: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
    fileReceived: !!req.file,
    fileName: req.file?.originalname
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  
  // Test after 1 second
  setTimeout(async () => {
    console.log('🧪 Sending test request...');
    
    const formData = new pkg();
    formData.append('name', 'Test Name');
    formData.append('slug', 'test-slug');
    formData.append('description', 'Test Description');
    
    try {
      const response = await fetch(`http://localhost:${PORT}/test-formdata`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const result = await response.json();
      console.log('✅ Test result:', result);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
  }, 1000);
});
