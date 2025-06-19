const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { sendWelcomeEmail } = require('../controllers/sendMail');

// Google OAuth handler - Redirect to Google
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// GitHub OAuth handler - Redirect to GitHub
const githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  passport.authenticate('google', { failureRedirect: '/login' }, async (err, user) => {
    
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
    
    if (!user) {
      console.error('Google OAuth: No user returned from passport');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }    
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          accountType: user.accountType, 
          isPremium: user.isPremium 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }      );
      
      // Set cookie with the token
      res.cookie('userToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Send welcome email for new users
      if (user.createdAt && (Date.now() - user.createdAt.getTime()) < 60000) { // Created in last minute
        try {
          await sendWelcomeEmail(user.email, {
            name: user.name,
            email: user.email
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }      
      // Redirect to onboarding for new users or home for existing users
      // Check if user was just created (within last minute) or doesn't have onboarding completed
      const isNewUser = user.createdAt && (Date.now() - user.createdAt.getTime()) < 60000;
      const needsOnboarding = !user.onboardingData?.isCompleted;        const redirectUrl = (isNewUser || needsOnboarding)
        ? `${process.env.FRONTEND_URL}/onboarding`
        : `${process.env.FRONTEND_URL}/`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
    }
  })(req, res);
};

// GitHub OAuth callback handler
const githubCallback = async (req, res) => {
  passport.authenticate('github', { failureRedirect: '/login' }, async (err, user) => {
    if (err) {
      console.error('GitHub OAuth callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id, 
          accountType: user.accountType, 
          isPremium: user.isPremium 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      // Set cookie with the token
      res.cookie('userToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Send welcome email for new users
      if (user.createdAt && (Date.now() - user.createdAt.getTime()) < 60000) { // Created in last minute
        try {
          await sendWelcomeEmail(user.email, {
            name: user.name,
            email: user.email
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }      // Redirect to onboarding for new users or home for existing users
      // Check if user was just created (within last minute) or doesn't have onboarding completed
      const isNewUser = user.createdAt && (Date.now() - user.createdAt.getTime()) < 60000;
      const needsOnboarding = !user.onboardingData?.isCompleted;
      
      const redirectUrl = (isNewUser || needsOnboarding)
        ? `${process.env.FRONTEND_URL}/onboarding`
        : `${process.env.FRONTEND_URL}/`;
        
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
    }
  })(req, res);
};

// OAuth logout handler
const oauthLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('OAuth logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    
    // Clear the user token cookie with the same options used when setting it
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
  });
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
  googleCallback,
  githubCallback,
  oauthLogout,
  createOrFindOAuthUser
};
