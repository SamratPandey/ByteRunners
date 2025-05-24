const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminProtect = async (req, res, next) => {
  let token;


  // Check for token in cookies first (preferred method)
  if (req.cookies.adminToken) {
    token = req.cookies.adminToken;
  } 
  // Fallback to Authorization header if cookie is not present
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]; 
  }  // Special handling for check-auth endpoint
  // Make sure we're checking the full path
  if (!token && req.originalUrl.includes('/check-auth')) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authenticated'
    });
  }
  
  if (!token) {
    return res.status(400).json({ message: 'Authentication token is missing' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ 
        message: 'Token has expired', 
        expired: true 
      });
    }
    
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ message: 'Not authorized to access this resource' });
    }

    next();
  } catch (error) {    // Special handling for check-auth endpoint
    if (req.originalUrl.includes('/check-auth')) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // JWT verify will throw an error if token is expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired', 
        expired: true 
      });
    }
    return res.status(401).json({ message: 'Token is invalid' });
  }
};
