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
  }  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If verification succeeds but token is expired (shouldn't happen with jwt.verify, but just in case)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ 
        success: false,
        message: 'Session expired'
      });
    }

    req.user = decoded;
    next(); 
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (req.originalUrl.includes('/check-auth')) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated'
      });
    }
    
    return res.status(401).json({ 
      message: error.name === 'TokenExpiredError' ? 'Session expired' : 'Token not valid' 
    });
  }
};

module.exports = { protect };
