import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import { connectDB } from './src/config/database.js';

async function testDB() {
  try {
    await connectDB();
    console.log('🔍 Testing database connection...');
    
    const categories = await Category.find({});
    console.log('📋 Total categories in DB:', categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) - Active: ${cat.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test error:', error);
    process.exit(1);
  }
}

testDB();
