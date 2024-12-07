const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../controllers/sendMail');
require('dotenv').config();

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Forgot Password - Send Password Reset Link
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpire = Date.now() + 3600000; // 1 hour from now

    // Save the reset token and expiry time to the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Create the reset link to be sent in the email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email using sendEmail function
    await sendEmail(user.email, 'Password Reset Request', `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password - Set New Password (Without Hashing)
const resetPassword = async (req, res) => {
  const { resetToken, password } = req.body;

  try {
    // Find user by reset token and check if the token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },  // Check if the token has expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update the user's password (no encryption here)
    user.password = password;  // Directly update password without hashing
    user.resetPasswordToken = undefined; // Clear the token
    user.resetPasswordExpire = undefined; // Clear the expiry time
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
