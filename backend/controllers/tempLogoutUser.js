
exports.logoutUser = async (req, res) => {
  try {
    // Clear the user token cookie
    res.clearCookie('userToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
