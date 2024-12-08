const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get the token from Authorization header
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Add the user info to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { protect };
