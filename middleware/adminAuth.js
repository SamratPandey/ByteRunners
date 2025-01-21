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

  // Ensure token is not empty
  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Find admin by ID and exclude password
    req.admin = await Admin.findById(decoded.id).select('-password');

    // Check if admin exists and is active
    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({ message: 'Not authorized to access this resource' });
    }

    next();
  } catch (error) {
    console.error(`Token verification error: ${error.message}`);
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};
