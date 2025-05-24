
exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie('adminToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
