
exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the admin token cookie with the same options used when setting it
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
