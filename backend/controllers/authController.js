const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity'); 
const crypto = require('crypto');
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail 
} = require('../controllers/sendMail');

require('dotenv').config();

// Register User  
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }    const user = new User({ 
      name, 
      email, 
      password,
      isEmailVerified: false // Set to false for email verification
    });
    await user.save();

    const activity = new Activity({
      type: 'User Registered',
      description: `New user ${user.name} (${user.email}) has registered.`,
    });    await activity.save();     
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, {        name: user.name,
        email: user.email
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Don't set authentication cookie until email is verified
    res.status(201).json({ 
      success: true,
      requiresVerification: true,
      message: 'Account created successfully. Please verify your email to continue.',
      email: user.email // Send email for verification flow
    });
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

    const activity = new Activity({
      type: 'User Logged In',
      description: `User ${user.name} (${user.email}) logged in.`,
    });
    await activity.save();    const token = jwt.sign({ id: user._id, accountType: user.accountType, isPremium: user.isPremium }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set cookie with the token
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ success: true });
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

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpire = Date.now() + 3600000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const activity = new Activity({
      type: 'Password Reset Requested',
      description: `User ${user.name} requested a password reset.`,
    });
    await activity.save();    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, {
        name: user.name,        resetLink: resetLink
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      throw new Error('Failed to send password reset email');
    }

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
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined; 
    await user.save();

    const activity = new Activity({
      type: 'Password Reset',
      description: `User ${user.name} reset their password successfully.`,
    });
    await activity.save();

    // Send password reset success email
    try {
      await sendPasswordResetSuccessEmail(user.email, {
        name: user.name      });
    } catch (emailError) {
      console.error('Failed to send password reset success email:', emailError);
      // Don't fail the password reset if email fails
    }

    // Send password reset success email
    try {
      await sendPasswordResetSuccessEmail(user.email, {
        name: user.name
      });
    } catch (emailError) {
      console.error('Failed to send password reset success email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error("Error in resetPassword:", error);    res.status(500).json({ message: "Server Error" });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire')
      .populate('solvedProblems.problemId', 'title difficulty')
      .populate('enrolledCourses.course', 'title description');
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Structure the response to match frontend expectations
    res.json({ 
      success: true, 
      data: {
        profile: {
          id: user._id,
          name: user.name || '',
          email: user.email || '',
          avatar: user.avatar || '/images/user.png',
          bio: user.bio || '',
          location: user.location || '',
          phone: user.phone || '',
          preferredLanguages: user.preferredLanguages || [],
          socialLinks: user.socialLinks || {},
          accountType: user.accountType || 'free',
          score: user.score || 0,
          rank: user.rank || 0,
          isPremium: user.isPremium || false,
          joinedAt: user.createdAt,
          lastActive: user.lastActive || new Date()
        },
        performance: {
          problemsSolved: user.problemsSolved || 0,
          totalSubmissions: user.totalSubmissions || 0,
          accuracy: user.accuracy || 0,
          streak: user.streak || 0,
          maxStreak: user.maxStreak || 0,
          recentActivity: user.recentActivity || [],
          weeklyProgress: [],
          languageStats: {}
        },
        achievements: {
          badges: user.badges || [],
          solvedProblems: user.solvedProblems || [],
          certificates: [],
          coursesCompleted: user.enrolledCourses?.filter(course => course.progress === 100)?.length || 0,
          totalLearningHours: user.learningAnalytics?.timeSpentLearning || 0
        },
        stats: {
          globalRank: user.rank || 0,
          countryRank: 0,
          contestsParticipated: 0,
          averageRating: 0,
          maxRating: 0
        },
        courses: {
          enrolled: user.enrolledCourses || [],
          purchased: user.purchasedCourses || []
        },
        onboarding: user.onboardingData || { isCompleted: false },
        testHistory: user.testHistory || [],
        learningAnalytics: user.learningAnalytics || {
          totalTestsTaken: 0,
          averageScore: 0,
          strongTopics: [],
          weakTopics: [],
          learningStreak: 0,
          improvementTrend: 0,
          timeSpentLearning: 0
        }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getUserProfile };
