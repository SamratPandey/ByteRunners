const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { sendWelcomeEmail } = require('../controllers/sendMail');

// Google OAuth handler
const googleAuth = async (req, res) => {
  try {
    // TODO: Implement Google OAuth logic
    // For now, return coming soon response
    res.status(501).json({
      success: false,
      message: 'Google OAuth coming soon! Please use email signup for now.'
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth authentication failed'
    });
  }
};

// GitHub OAuth handler
const githubAuth = async (req, res) => {
  try {
    // TODO: Implement GitHub OAuth logic
    // For now, return coming soon response
    res.status(501).json({
      success: false,
      message: 'GitHub OAuth coming soon! Please use email signup for now.'
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth authentication failed'
    });
  }
};

// OAuth callback handler
const oauthCallback = async (req, res) => {
  try {
    const { provider, code, state } = req.query;
    
    // TODO: Exchange code for access token and get user info
    // This is where you would implement the actual OAuth flow
    
    res.status(501).json({
      success: false,
      message: 'OAuth callback coming soon!'
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth callback failed'
    });
  }
};

// Helper function to create or find user from OAuth data
const createOrFindOAuthUser = async (oauthData) => {
  try {
    const { email, name, provider, providerId, avatar } = oauthData;
    
    // Check if user already exists with this email
    let user = await User.findOne({ email });
    
    if (user) {
      // Update OAuth info if user exists
      user.oauthProviders = user.oauthProviders || {};
      user.oauthProviders[provider] = providerId;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        password: 'oauth_user_' + Date.now(), // Placeholder password for OAuth users
        avatar,
        accountType: 'oauth',
        oauthProviders: {
          [provider]: providerId
        }
      });
      await user.save();
      
      // Log activity
      const activity = new Activity({
        type: 'OAuth User Registered',
        description: `New user ${user.name} (${user.email}) registered via ${provider}.`,
      });
      await activity.save();
      
      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, {
          name: user.name,
          email: user.email
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error creating/finding OAuth user:', error);
    throw error;
  }
};

module.exports = {
  googleAuth,
  githubAuth,
  oauthCallback,
  createOrFindOAuthUser
};
