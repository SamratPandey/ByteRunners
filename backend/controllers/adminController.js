const Admin = require('../models/Admin');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Activity = require('../models/Activity')
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();

    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'adminn',  
        role: 'superAdmin',
        permissions: {
          manageUsers: true,
          manageCodingProblems: true,
          manageCodeExecutionSettings: true,
          viewAnalytics: true,
          manageContests: true,
          manageFeedback: true
        }
      });

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

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = Date.now();
    admin.loginHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    await admin.save();    
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );    // Set cookie with the token
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site cookies in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
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
    const users = await User.find()
      .select('name email problemsSolved totalSubmissions accuracy rank score bio avatar preferredLanguages isPremium accountType')
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

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email problemsSolved totalSubmissions accuracy rank score bio avatar recentActivity solvedProblems preferredLanguages isPremium accountType')
      .populate('solvedProblems.problemId', 'title difficulty');

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

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'rank', 'score', 'bio', 'avatar', 'preferredLanguages'];
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

exports.createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      constraints,
      timeLimit,
      memoryLimit,
      examples,
      testCases,
      solutions,
      tags,
      categories,
      premium,
      companies,
      status
    } = req.body;

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      inputFormat,
      outputFormat,
      constraints,
      timeLimit,
      memoryLimit,
      examples,
      testCases,
      solutions,
      tags,
      categories,
      premium,
      companies,
      status,
      createdBy: req.admin.id,
      lastModifiedBy: req.admin.id
    });

    await newProblem.save();

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: newProblem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating problem',
      error: error.message
    });
  }
};


exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
      .select(
        'title description difficulty inputFormat outputFormat constraints timeLimit memoryLimit examples starterTemplates testCases tags categories totalSubmissions acceptedSubmissions acceptanceRate status'
      )
      .populate('createdBy', 'username')
      .lean();

    const formattedProblems = problems.map(problem => ({
      id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      examples: problem.examples,
      testCases: problem.testCases,
      tags: problem.tags,
      starterTemplates: problem.starterTemplates,
      categories: problem.categories,
      totalSubmissions: problem.totalSubmissions,
      acceptedSubmissions: problem.acceptedSubmissions,
      acceptanceRate: problem.acceptanceRate,
      status: problem.status,
      createdBy: problem.createdBy?.username || null,
    }));

    res.status(200).json({
      success: true,
      data: formattedProblems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
      error: error.message,
    });
  }
};


exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')
      .lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: error.message
    });
  }
};


exports.updateProblem = async (req, res) => {
  try {
    const allowedFields = [
      'title',
      'description',
      'difficulty',
      'inputFormat',
      'outputFormat',
      'constraints',
      'timeLimit',
      'memoryLimit',
      'starterTemplates',
      'examples',
      'testCases',
      'solutions',
      'tags',
      'categories',
      'premium',
      'companies',
      'status'
    ];

    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      { ...filteredBody, lastModifiedBy: req.admin.id },
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: updatedProblem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating problem',
      error: error.message
    });
  }
};


exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(204).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting problem',
      error: error.message
    });
  }
};


exports.getProblemStats = async (req, res) => {
  try {
    const stats = await Problem.aggregate([
      {
        $group: {
          _id: null,
          totalProblems: { $sum: 1 },
          totalSubmissions: { $sum: '$totalSubmissions' },
          totalAccepted: { $sum: '$acceptedSubmissions' },
          averageAcceptanceRate: { $avg: '$acceptanceRate' }
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
      message: 'Error fetching problem stats',
      error: error.message
    });
  }
};

exports.getTopPerformers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; 
    const topPerformers = await User.find()
      .sort({ score: -1 }) 
      .limit(limit)
      .select('name email score rank avatar');

    res.status(200).json({
      success: true,
      data: topPerformers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
};


exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; 

    
    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 }) 
      .limit(limit);

    if (!recentActivities.length) {
      return res.status(404).json({
        success: false,
        message: 'No recent activities found'
      });
    }

    res.status(200).json({
      success: true,
      data: recentActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

// Get user growth statistics for charts
exports.getUserGrowthStats = async (req, res) => {
  try {
    const { period = 'daily', days = 7 } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Aggregate user registrations by day
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%b %d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          users: '$count',
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        totalUsers: await User.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error fetching user growth stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth statistics',
      error: error.message
    });
  }
};

// Get problem growth statistics for charts  
exports.getProblemGrowthStats = async (req, res) => {
  try {
    const { period = 'daily', days = 7 } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Aggregate problem creation by day
    const problemGrowth = await Problem.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%b %d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          problems: '$count',
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        problemGrowth,
        totalProblems: await Problem.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error fetching problem growth stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem growth statistics',
      error: error.message
    });
  }
};