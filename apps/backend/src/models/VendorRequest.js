import mongoose from 'mongoose';

const vendorRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot be more than 100 characters']
  },
  shopDescription: {
    type: String,
    required: [true, 'Shop description is required'],
    trim: true,
    maxlength: [1000, 'Shop description cannot be more than 1000 characters']
  },
  shopAddress: {
    type: String,
    required: [true, 'Shop address is required'],
    trim: true,
    maxlength: [500, 'Shop address cannot be more than 500 characters']
  },
  shopPhone: {
    type: String,
    required: [true, 'Shop phone is required'],
    trim: true,
    match: [
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      'Please add a valid phone number'
    ]
  },
  shopEmail: {
    type: String,
    required: [true, 'Shop email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'partnership'],
    default: 'individual'
  },
  taxId: {
    type: String,
    trim: true
  },
  documents: [{
    type: String, // URLs to uploaded documents
    required: false
  }],
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Review notes cannot be more than 500 characters']
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
vendorRequestSchema.index({ status: 1 });
vendorRequestSchema.index({ requestedAt: -1 });

// Prevent duplicate pending requests
vendorRequestSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'pending') {
    const existingRequest = await this.constructor.findOne({
      user: this.user,
      status: 'pending'
    });
    
    if (existingRequest) {
      const error = new Error('You already have a pending vendor request');
      error.code = 'DUPLICATE_REQUEST';
      return next(error);
    }
  }
  next();
});

export default mongoose.model('VendorRequest', vendorRequestSchema);
