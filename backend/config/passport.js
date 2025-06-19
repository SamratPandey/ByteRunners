const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {    // Check if user already exists with this Google ID
    let user = await User.findOne({ 'oauthProviders.google': profile.id });
    
    if (user) {
      // User exists, ensure they have all required fields for profile
      let needsUpdate = false;
      
      // Check and initialize missing fields
      if (user.problemsSolved === undefined) {
        user.problemsSolved = 0;
        needsUpdate = true;
      }
      if (user.totalSubmissions === undefined) {
        user.totalSubmissions = 0;
        needsUpdate = true;
      }
      if (user.accuracy === undefined) {
        user.accuracy = 0;
        needsUpdate = true;
      }
      if (user.streak === undefined) {
        user.streak = 0;
        needsUpdate = true;
      }
      if (user.rank === undefined) {
        user.rank = 0;
        needsUpdate = true;
      }
      if (user.score === undefined) {
        user.score = 0;
        needsUpdate = true;
      }
      if (!user.recentActivity) {
        user.recentActivity = [];
        needsUpdate = true;
      }
      if (!user.solvedProblems) {
        user.solvedProblems = [];
        needsUpdate = true;
      }
      if (!user.badges) {
        user.badges = [];
        needsUpdate = true;
      }
      if (!user.preferredLanguages) {
        user.preferredLanguages = [];
        needsUpdate = true;
      }
      if (!user.socialLinks) {
        user.socialLinks = {};
        needsUpdate = true;
      }
      if (user.bio === undefined) {
        user.bio = '';
        needsUpdate = true;
      }
      if (!user.onboardingData) {
        user.onboardingData = { isCompleted: false };
        needsUpdate = true;
      }
        if (needsUpdate) {
        await user.save();
      }
      
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
      // User exists with email, link Google account and ensure required fields
      user.oauthProviders.google = profile.id;
      if (profile.photos && profile.photos[0] && !user.avatar) {
        user.avatar = profile.photos[0].value;
      }
      
      // Ensure all required fields exist
      let needsUpdate = false;
      if (user.problemsSolved === undefined) {
        user.problemsSolved = 0;
        needsUpdate = true;
      }
      if (user.totalSubmissions === undefined) {
        user.totalSubmissions = 0;
        needsUpdate = true;
      }
      if (user.accuracy === undefined) {
        user.accuracy = 0;
        needsUpdate = true;
      }
      if (user.streak === undefined) {
        user.streak = 0;
        needsUpdate = true;
      }
      if (user.rank === undefined) {
        user.rank = 0;
        needsUpdate = true;
      }
      if (user.score === undefined) {
        user.score = 0;
        needsUpdate = true;
      }
      if (!user.recentActivity) {
        user.recentActivity = [];
        needsUpdate = true;
      }
      if (!user.solvedProblems) {
        user.solvedProblems = [];
        needsUpdate = true;
      }
      if (!user.badges) {
        user.badges = [];
        needsUpdate = true;
      }
      if (!user.preferredLanguages) {
        user.preferredLanguages = [];
        needsUpdate = true;
      }
      if (!user.socialLinks) {
        user.socialLinks = {};
        needsUpdate = true;
      }
      if (user.bio === undefined) {
        user.bio = '';
        needsUpdate = true;
      }
      if (!user.onboardingData) {
        user.onboardingData = { isCompleted: false };
        needsUpdate = true;
      }
        if (needsUpdate) {
      }
      
      await user.save();
      return done(null, user);
    }
      // Create new user
    const newUser = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: 'oauth_google_' + Date.now(), // Placeholder password
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : 'default-avatar-url',
      accountType: 'free',      oauthProviders: {
        google: profile.id
      },
      isEmailVerified: true, // OAuth emails are pre-verified
      // Initialize default values for profile
      problemsSolved: 0,
      totalSubmissions: 0,
      accuracy: 0,
      streak: 0,
      rank: 0,
      score: 0,
      recentActivity: [],
      solvedProblems: [],
      badges: [],
      preferredLanguages: [],
      socialLinks: {},
      bio: '',
      onboardingData: {
        isCompleted: false
      }
    });
    
    await newUser.save();
    
    // Log activity
    const activity = new Activity({
      type: 'OAuth User Registered',
      description: `New user ${newUser.name} (${newUser.email}) registered via Google.`,
    });
    await activity.save();
    
    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/github/callback`,
  scope: ['user:email'] // Request email access
}, async (accessToken, refreshToken, profile, done) => {
  try {    // Check if user already exists with this GitHub ID
    let user = await User.findOne({ 'oauthProviders.github': profile.id });
      if (user) {
      // User exists, ensure they have all required fields for profile
      let needsUpdate = false;
      
      // Check and initialize missing fields
      if (user.problemsSolved === undefined) {
        user.problemsSolved = 0;
        needsUpdate = true;
      }
      if (user.totalSubmissions === undefined) {
        user.totalSubmissions = 0;
        needsUpdate = true;
      }
      if (user.accuracy === undefined) {
        user.accuracy = 0;
        needsUpdate = true;
      }
      if (user.streak === undefined) {
        user.streak = 0;
        needsUpdate = true;
      }
      if (user.rank === undefined) {
        user.rank = 0;
        needsUpdate = true;
      }
      if (user.score === undefined) {
        user.score = 0;
        needsUpdate = true;
      }
      if (!user.recentActivity) {
        user.recentActivity = [];
        needsUpdate = true;
      }
      if (!user.solvedProblems) {
        user.solvedProblems = [];
        needsUpdate = true;
      }
      if (!user.badges) {
        user.badges = [];
        needsUpdate = true;
      }
      if (!user.preferredLanguages) {
        user.preferredLanguages = [];
        needsUpdate = true;
      }
      if (!user.socialLinks) {
        user.socialLinks = {};
        needsUpdate = true;
      }
      if (user.bio === undefined) {
        user.bio = '';
        needsUpdate = true;
      }
      if (!user.onboardingData) {
        user.onboardingData = { isCompleted: false };
        needsUpdate = true;
      }
        if (needsUpdate) {
        await user.save();
      }
      
      return done(null, user);
    }// Fetch user's email from GitHub API if not provided in profile
    let email = null;
    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
      email = profile.emails[0].value;
    } else {
      try {
        // Fetch emails using GitHub API
        const fetch = (await import('node-fetch')).default;
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `token ${accessToken}`,
            'User-Agent': 'ByteRunners-App'
          }
        });
        
        if (emailResponse.ok) {
          const emails = await emailResponse.json();
          // Find primary email or first verified email
          const primaryEmail = emails.find(e => e.primary && e.verified);
          const verifiedEmail = emails.find(e => e.verified);          email = primaryEmail?.email || verifiedEmail?.email || emails[0]?.email;
          
        }
      } catch (apiError) {
        console.error('GitHub API email fetch error:', apiError);
      }
    }
    
    // If still no email, use username-based email as fallback
    if (!email) {
      email = `${profile.username}@users.noreply.github.com`;
    }
    user = await User.findOne({ email: email });
    
    if (user) {
      // User exists with email, link GitHub account
      user.oauthProviders.github = profile.id;
      if (profile.photos && profile.photos[0] && !user.avatar) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }
      // Create new user
    const newUser = new User({
      name: profile.displayName || profile.username,
      email: email,
      password: 'oauth_github_' + Date.now(), // Placeholder password
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : 'default-avatar-url',
      accountType: 'free',      oauthProviders: {
        github: profile.id
      },
      isEmailVerified: true, // OAuth emails are pre-verified
      // Initialize default values for profile
      problemsSolved: 0,
      totalSubmissions: 0,
      accuracy: 0,
      streak: 0,
      rank: 0,
      score: 0,
      recentActivity: [],
      solvedProblems: [],
      badges: [],
      preferredLanguages: [],
      socialLinks: {},
      bio: '',
      onboardingData: {
        isCompleted: false
      }
    });
    
    await newUser.save();
    
    // Log activity
    const activity = new Activity({
      type: 'OAuth User Registered',
      description: `New user ${newUser.name} (${newUser.email}) registered via GitHub.`,
    });
    await activity.save();
    
    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
