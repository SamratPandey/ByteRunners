const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    originalPrice: Number,
    discountAmount: {
      type: Number,
      default: 0
    }
  }],
  
  // Payment Details
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Coupon Details
  coupon: {
    code: String,
    discountPercentage: Number,
    discountAmount: Number
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'upi', 'card'],
    required: true
  },
  paymentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Billing Information
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Invoice
  invoiceNumber: {
    type: String,
    unique: true
  },
  invoiceUrl: String,
  
  // Timestamps
  paidAt: Date,
  failedAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String,
  
  // Notes
  notes: String,
  adminNotes: String
  
}, {
  timestamps: true
});

// Generate invoice number before saving
orderSchema.pre('save', function(next) {
  if (!this.invoiceNumber && this.status === 'completed') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.invoiceNumber = `BR-${year}${month}${day}-${random}`;
  }
  next();
});

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'courses.course': 1 });

module.exports = mongoose.model('Order', orderSchema);
