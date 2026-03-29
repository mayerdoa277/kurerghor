import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function testVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('🔍 Connected to MongoDB');

    // Check all users
    const allUsers = await User.find({});
    console.log('📊 Total users in database:', allUsers.length);

    // Check vendor users
    const vendors = await User.find({ role: 'vendor' });
    console.log('📊 Vendors in database:', vendors.length);

    if (vendors.length > 0) {
      vendors.forEach(v => {
        console.log('  - ID:', v._id);
        console.log('    Name:', v.name);
        console.log('    Email:', v.email);
        console.log('    Role:', v.role);
        console.log('    Vendor Request:', v.vendorRequest);
        console.log('    Shop Name:', v.vendorRequest?.shopName || 'N/A');
        console.log('    ---');
      });
    } else {
      console.log('❌ No vendors found in database');

      // Check if there are any users with vendor requests
      const vendorRequests = await User.find({ 'vendorRequest.requested': true });
      console.log('📊 Users with vendor requests:', vendorRequests.length);

      if (vendorRequests.length > 0) {
        vendorRequests.forEach(u => {
          console.log('  - User with request:', u.name, u.email);
          console.log('    Request status:', u.vendorRequest);
        });
      }
    }

    // Create a test vendor if none exist
    if (vendors.length === 0) {
      console.log('🔧 Creating a test vendor...');
      const testVendor = new User({
        name: 'Test Vendor',
        email: 'testvendor@example.com',
        password: 'password123',
        role: 'vendor',
        vendorRequest: {
          requested: true,
          approved: true,
          shopName: 'Test Shop',
          shopDescription: 'A test shop for demonstration',
          shopAddress: '123 Test Street',
          shopPhone: '123-456-7890'
        }
      });

      await testVendor.save();
      console.log('✅ Test vendor created:', testVendor._id);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testVendors();
