const Admin = require('../models/Admin');
const User = require('../models/User');
const Problem = require('../models/Problem');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role, permissions } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: role || 'moderator',
      permissions: permissions || {
        manageUsers: false,
        manageCodingProblems: false,
        manageCodeExecutionSettings: false,
        viewAnalytics: false
      }
    });

    await newAdmin.save();
    
    res.status(201).json({ 
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
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

exports.getAllUsers = async (req, res) => {
  try {
    // Check if admin has permission to manage users
    if (!req.admin.permissions.manageUsers) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    // Fetch users (excluding sensitive information)
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Check if admin has permission to manage users
    if (!req.admin.permissions.manageUsers) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

exports.createProblem = async (req, res) => {
  try {
    // Check if admin has permission to manage problems
    if (!req.admin.permissions.manageCodingProblems) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    const { title, description, difficulty, testCases } = req.body;
    
    const newProblem = new Problem({
      title,
      description,
      difficulty,
      testCases,
      createdBy: req.admin._id
    });

    await newProblem.save();
    
    res.status(201).json({ 
      message: 'Problem created successfully', 
      problem: newProblem 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating problem', 
      error: error.message 
    });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    // Check if admin has permission to manage problems
    if (!req.admin.permissions.manageCodingProblems) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    res.json({ 
      message: 'Problem updated successfully', 
      problem: updatedProblem 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating problem', 
      error: error.message 
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Check if admin has permission to view analytics
    if (!req.admin.permissions.viewAnalytics) {
      return res.status(403).json({ 
        message: 'Insufficient permissions' 
      });
    }

    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    
    // User growth by day
    const usersByDay = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalProblems,
      usersByDay
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};