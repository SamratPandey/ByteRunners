// Controller for handling admin authentication status check
const Admin = require('../models/Admin');

// Check Admin Authentication Status
exports.checkAdminAuth = async (req, res) => {
  try {
    // req.admin is set by the adminAuth middleware
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    
    res.json({ 
      success: true, 
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
