const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['video', 'article', 'quiz'],
    required: true
  },
  content: {
    type: String, 
    required: true
  },
  duration: Number, 
  isPreview: { type: Boolean, default: false },
  downloadableResources: [{
    name: String,
    url: String
  }],
  translations: [{
    language: String,
    title: String,
    content: String
  }]
});


const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});


const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  ratedAt: { type: Date, default: Date.now }
});


const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  certificateIssued: { type: Boolean, default: false },
  certificateUrl: String
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  summary: { type: String, maxlength: 300 },
  thumbnail: String,
  introVideo: String,
  price: { type: Number, required: true, default: 0 },
  isFree: { type: Boolean, default: false },
  category: String,
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prerequisites: [String],
  curriculum: [sectionSchema],
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  enrollments: [enrollmentSchema],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
