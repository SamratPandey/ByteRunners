const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  problemsSolved: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  recentActivity: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    problemTitle: String,
    status: { 
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error']
    },
    language: String,
    executionTime: Number,
    memoryUsed: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  rank: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  avatar: { type: String, default: 'default-avatar-url' },
  bio: { type: String, maxlength: 500 },
  socialLinks: {
    github: String,
    linkedin: String,
    website: String,
    twitter: String,
    instagram: String,
    facebook: String
  },  solvedProblems: [{ 
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 1 }
  }],
  preferredLanguages: [String],
  isPremium: { type: Boolean, default: false },
  subscriptionExpiry: Date,
  accountType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },  purchasedCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    price: Number,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    certificateEarned: {
      type: Boolean,
      default: false
    },
    certificateUrl: String
  }],
  // Onboarding and Test Data
  onboardingData: {
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    interests: [String],
    goals: String,
    preferredLanguages: [String],
    skillAssessment: {
      score: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      answers: [{
        questionId: String,
        question: String,
        selectedAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        timeSpent: Number, // in seconds
        answeredAt: { type: Date, default: Date.now }
      }],
      completedAt: Date
    },
    recommendations: [String]
  },
  // Test and Quiz History
  testHistory: [{
    testId: { type: mongoose.Schema.Types.ObjectId },
    testType: {
      type: String,
      enum: ['skill_assessment', 'practice_quiz', 'interview_prep', 'custom']
    },
    subject: String, // JavaScript, Python, Data Structures, etc.
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    questions: [{
      questionId: String,
      question: String,
      options: [String],
      selectedAnswer: Number,
      correctAnswer: Number,
      isCorrect: Boolean,
      explanation: String,
      timeSpent: Number,
      aiGenerated: { type: Boolean, default: false },
      topic: String
    }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeSpent: Number, // total time in seconds
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    aiAnalysis: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      nextSteps: [String],
      studyPlan: String,
      confidenceLevel: Number // 1-10
    }
  }],
  // Learning Analytics
  learningAnalytics: {
    totalTestsTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    strongTopics: [String],
    weakTopics: [String],
    learningStreak: { type: Number, default: 0 },
    lastTestDate: Date,
    improvementTrend: Number, // percentage improvement over time
    timeSpentLearning: { type: Number, default: 0 } // in minutes
  },
  // OAuth-related fields
  oauthProviders: {
    google: String,
    github: String
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.index({ score: -1 });

module.exports = mongoose.model('User', userSchema);
