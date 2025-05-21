const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminProtect = async (req, res, next) => {
  let token;

  // Check if authorization header is present and properly formatted
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]; 
  } else {
    return res.status(400).json({ message: 'Authorization header is malformed or missing' });
  }

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
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
  } catch (error) {
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
