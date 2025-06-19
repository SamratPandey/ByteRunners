
exports.logoutUser = async (req, res) => {
  try {    // Clear the user token cookie with the same options used when setting it
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Match the setting used when creating the cookie
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
