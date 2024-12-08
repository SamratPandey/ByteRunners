  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');

  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    
    // New Fields
    problemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    recentActivity: [
      {
        problemTitle: String,
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    rank: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    avatar: { type: String, default: 'default-avatar-url' },
    bio: { type: String, default: '' },
  });

  // Hash the password before saving
  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
  });

  // Compare password for login
  userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  const User = mongoose.model('User', userSchema);

  module.exports = User;
