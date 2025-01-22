// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
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
    website: String
  },
  solvedProblems: [{ 
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
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ score: -1 });

module.exports = mongoose.model('User', userSchema);
