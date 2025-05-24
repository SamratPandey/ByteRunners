const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;
  
  // Check for token in cookies first
  if (req.cookies.userToken) {
    token = req.cookies.userToken;
  }
  // Fallback to Authorization header
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]; 
  }
  // Special handling for check-auth endpoint
  if (!token && req.originalUrl.includes('/check-auth')) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authenticated'
    });
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); 
  } catch (error) {
    console.error(error);    // Special handling for check-auth endpoint
    if (req.originalUrl.includes('/check-auth')) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated'
      });
    }
    
    return res.status(401).json({ message: 'Token not valid' });
  }
};

module.exports = { protect };
