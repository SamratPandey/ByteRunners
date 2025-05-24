
const User = require('../models/User');


exports.checkAuth = async (req, res) => {
  // If this middleware is reached, the user is authenticated
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      accountType: user.accountType
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
