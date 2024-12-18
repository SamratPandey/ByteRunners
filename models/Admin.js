const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superAdmin', 'moderator'],
    default: 'moderator'
  },
  permissions: {
    manageUsers: { 
      type: Boolean, 
      default: false 
    },
    manageCodingProblems: { 
      type: Boolean, 
      default: false 
    },
    manageCodeExecutionSettings: { 
      type: Boolean, 
      default: false 
    },
    viewAnalytics: { 
      type: Boolean, 
      default: false 
    }
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;