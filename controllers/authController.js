const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity'); 
const crypto = require('crypto');
const sendEmail = require('../controllers/sendMail');

require('dotenv').config();

// Register User  
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    // Log the registration activity
    const activity = new Activity({
      type: 'User Registered',
      description: `New user ${user.name} (${user.email}) has registered.`,
    });
    await activity.save();

    const token = jwt.sign({ id: user._id, accountType: user.accountType }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log the login activity
    const activity = new Activity({
      type: 'User Logged In',
      description: `User ${user.name} (${user.email}) logged in.`,
    });
    await activity.save();

    const token = jwt.sign({ id: user._id, accountType: user.accountType, isPremium: user.isPremium }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Forgot Password - Send Password Reset Link
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpire = Date.now() + 3600000; // 1 hour from now

    // Save the reset token and expiry time to the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Log the forgot password activity
    const activity = new Activity({
      type: 'Password Reset Requested',
      description: `User ${user.name} requested a password reset.`,
    });
    await activity.save();

    // Create the reset link to be sent in the email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email using sendEmail function
    await sendEmail(user.email, 'Password Reset Request', `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password - Set New Password (Without Hashing)
const resetPassword = async (req, res) => {
  const { resetToken, password } = req.body;

  try {
    // Find user by reset token and check if the token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined; 
    await user.save();

    // Log the reset password activity
    const activity = new Activity({
      type: 'Password Reset',
      description: `User ${user.name} reset their password successfully.`,
    });
    await activity.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select(`
        name 
        rank 
        problemsSolved 
        totalSubmissions 
        accuracy 
        streak 
        lastActive
        recentActivity 
        avatar 
        isPremium 
        preferredLanguages 
        badges 
        socialLinks 
        bio 
        score
        solvedProblems
        accountType
      `)
      .populate({
        path: 'recentActivity.problemId',
        select: 'title difficulty'
      })
      .populate({
        path: 'solvedProblems.problemId',
        select: 'title difficulty'
      })
      .lean(); 
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User profile not found' 
      });
    }

    // Prepare dashboard response with structured data
    const dashboardData = {
      profile: {
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        socialLinks: user.socialLinks,
        rank: user.rank,
        score: user.score,
        isPremium: user.isPremium,
        accountType: user.accountType,
        preferredLanguages: user.preferredLanguages,
        lastActive: user.lastActive
      },
      performance: {
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions,
        accuracy: user.accuracy,
        streak: user.streak,
        recentActivity: user.recentActivity.map(activity => ({
          problemTitle: activity.problemTitle,
          status: activity.status,
          language: activity.language,
          executionTime: activity.executionTime,
          memoryUsed: activity.memoryUsed,
          timestamp: activity.timestamp
        }))
      },
      achievements: {
        badges: user.badges,
        solvedProblems: user.solvedProblems.map(solve => ({
          problemTitle: solve.problemId.title,
          difficulty: solve.problemId.difficulty,
          solvedAt: solve.solvedAt,
          attempts: solve.attempts
        }))
      }
    };

    // Successful response
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    // Improved error handling
    console.error('Dashboard Data Retrieval Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getDashboardData
};

// Get Profile Data
const getProfileData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email bio avatar rank problemsSolved totalSubmissions accuracy isPremium accountType preferredLanguages');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      rank: user.rank,
      problemsSolved: user.problemsSolved,
      totalSubmissions: user.totalSubmissions,
      accuracy: user.accuracy,
      isPremium: user.isPremium,
      accountType: user.accountType,
      preferredLanguages: user.preferredLanguages,
    });
  } catch (error) {
    console.error('Error in getProfileData:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getDashboardData, getProfileData };
