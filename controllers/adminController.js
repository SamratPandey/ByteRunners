const Admin = require('../models/Admin');
const User = require('../models/User');
const Problem = require('../models/Problem');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({});

    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        username: 'admin', // default admin username
        email: 'admin@gmail.com', // default admin email
        password: 'admin', // default admin password
        role: 'superAdmin', // super admin role
        permissions: {
          manageUsers: true,
          manageCodingProblems: true,
          manageCodeExecutionSettings: true,
          viewAnalytics: true
        }
      });

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      defaultAdmin.password = await bcrypt.hash(defaultAdmin.password, salt);

      // Save the default admin to the database
      await defaultAdmin.save();

      return res.status(201).json({
        message: 'Default admin created successfully',
        admin: {
          id: defaultAdmin._id,
          username: defaultAdmin.username,
          email: defaultAdmin.email,
          role: defaultAdmin.role
        }
      });
    } else {
      return res.status(400).json({
        message: 'Admin already exists'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    // Create token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        permissions: admin.permissions 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};



// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email problemsSolved totalSubmissions accuracy rank score bio avatar')
      .lean();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email problemsSolved totalSubmissions accuracy rank score bio avatar recentActivity solvedProblems')
      .populate('solvedProblems', 'title difficulty');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'rank', 'score', 'bio', 'avatar'];
    const filteredBody = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageProblemsCompleted: { $avg: '$problemsSolved' },
          averageAccuracy: { $avg: '$accuracy' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};