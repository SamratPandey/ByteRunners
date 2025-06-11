const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['video', 'article', 'quiz', 'assignment'],
    required: true
  },
  content: {
    type: String, 
    required: true
  },
  videoUrl: String,
  duration: Number, // in minutes
  isPreview: { type: Boolean, default: false },
  downloadableResources: [{
    name: String,
    url: String,
    type: String // pdf, zip, etc.
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: { type: Number, default: 70 }
  },
  translations: [{
    language: String,
    title: String,
    content: String
  }],
  order: { type: Number, default: 0 }
});


const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
  lessons: [lessonSchema]
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerifiedPurchase: { type: Boolean, default: false },
  ratedAt: { type: Date, default: Date.now }
});

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true },
  discount: { type: Number, required: true }, // percentage
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  maxUses: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId },
  totalTimeSpent: { type: Number, default: 0 }, // in minutes
  certificateIssued: { type: Boolean, default: false },
  certificateUrl: String,
  completedAt: Date,
  paymentDetails: {
    transactionId: String,
    amount: Number,
    currency: { type: String, default: 'INR' },
    paymentMethod: String,
    paidAt: { type: Date, default: Date.now },
    couponUsed: String,
    discountAmount: Number
  }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  subtitle: { type: String, maxlength: 120 },
  description: { type: String, required: true },
  summary: { type: String, maxlength: 300 },
  thumbnail: { type: String, required: true },
  previewVideo: String,
  introVideo: String,
  
  // Pricing
  price: { type: Number, required: true, default: 0 },
  originalPrice: Number,
  discountPercentage: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  currency: { type: String, default: 'INR' },
  
  // Course Info
  category: { type: String, required: true },
  subcategory: String,
  topic: String,
  tags: [String],
  language: { type: String, default: 'English' },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all levels'],
    default: 'beginner'
  },
  
  // Duration & Content
  totalDuration: { type: Number, default: 0 }, // in minutes
  totalLessons: { type: Number, default: 0 },
  totalSections: { type: Number, default: 0 },
  
  // Instructor
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Learning Outcomes
  whatYouWillLearn: [String],
  prerequisites: [String],
  targetAudience: [String],
  
  // Content
  curriculum: [sectionSchema],
  
  // Reviews & Ratings
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  ratingBreakdown: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  
  // Enrollments
  enrollments: [enrollmentSchema],
  totalEnrollments: { type: Number, default: 0 },
  
  // Marketing
  coupons: [couponSchema],
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  
  // Status
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  lastUpdated: { type: Date, default: Date.now },
  
  // SEO
  metaDescription: String,
  metaKeywords: [String],
  
  // Additional Features
  hasSubtitles: { type: Boolean, default: false },
  hasCertificate: { type: Boolean, default: true },
  lifetime_access: { type: Boolean, default: true },
  mobile_access: { type: Boolean, default: true },
  
  // Analytics
  views: { type: Number, default: 0 },
  wishlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total duration from lessons
courseSchema.virtual('calculatedDuration').get(function() {
  let total = 0;
  this.curriculum.forEach(section => {
    section.lessons.forEach(lesson => {
      if (lesson.duration) total += lesson.duration;
    });
  });
  return total;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.totalEnrollments === 0) return 0;
  const completedEnrollments = this.enrollments.filter(e => e.progress === 100).length;
  return Math.round((completedEnrollments / this.totalEnrollments) * 100);
});

// Indexes for better performance
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalEnrollments: -1 });
courseSchema.index({ price: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ featured: -1, bestseller: -1 });

// Pre-save middleware to update calculated fields
courseSchema.pre('save', function(next) {
  // Update total lessons and sections
  this.totalSections = this.curriculum.length;
  this.totalLessons = this.curriculum.reduce((total, section) => total + section.lessons.length, 0);
  
  // Update total duration
  this.totalDuration = this.calculatedDuration;
  
  // Update total enrollments
  this.totalEnrollments = this.enrollments.length;
  
  // Update total reviews
  this.totalReviews = this.reviews.length;
  
  // Calculate average rating
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    
    // Update rating breakdown
    this.ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviews.forEach(review => {
      this.ratingBreakdown[review.rating]++;
    });
  }
  
  next();
});

module.exports = mongoose.model('Course', courseSchema);
