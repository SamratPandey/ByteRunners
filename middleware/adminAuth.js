const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find admin by ID and exclude password
      req.admin = await Admin.findById(decoded.id).select('-password');

      // Check if admin exists and is active
      if (!req.admin || !req.admin.isActive) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  // If no token
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
  }
};