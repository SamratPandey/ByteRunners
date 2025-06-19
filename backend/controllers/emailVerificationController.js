const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('./sendMail');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send email verification OTP
const sendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate OTP and set expiration (10 minutes)
    const otp = generateOTP();
    user.emailVerificationToken = otp;
    user.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send OTP email
    const emailSubject = 'Verify Your Email - ByteRunners';
    const emailText = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Email Verification - ByteRunners</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #22c55e; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The ByteRunners Team
        </p>
      </div>
    `;
    
    try {
      await sendEmail(email, emailSubject, emailText, emailHtml);
      
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      // For development, show the OTP in console and still allow verification
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(50));
        console.log('EMAIL SERVICE FAILED - DEVELOPMENT MODE');
        console.log(`OTP for ${email}: ${otp}`);
        console.log('Use this OTP to verify your email');
        console.log('='.repeat(50));
        
        res.status(200).json({
          success: true,
          message: 'Verification code generated (check console for OTP)',
          developmentOTP: otp // Only in development
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again.'
        });
      }
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// Verify email with OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({
      email,
      emailVerificationToken: otp,
      emailVerificationExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
      // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
      // Set authentication cookie after successful email verification
    const token = jwt.sign({ 
      id: user._id, 
      accountType: user.accountType, 
      isPremium: user.isPremium 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully!'
    });
      } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Check if we can resend (rate limiting - 1 minute between requests)
    if (user.emailVerificationExpire && (Date.now() - (user.emailVerificationExpire - 10 * 60 * 1000)) < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification code'
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    user.emailVerificationToken = otp;
    user.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send OTP email
    const emailSubject = 'Verify Your Email - ByteRunners';
    const emailText = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Email Verification - ByteRunners</h2>
        <p>Hello ${user.name},</p>
        <p>Here's your new verification code:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #22c55e; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The ByteRunners Team
        </p>
      </div>    `;
    
    try {
      await sendEmail(email, emailSubject, emailText, emailHtml);
      
      res.status(200).json({
        success: true,
        message: 'New verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      
      // For development, show the OTP in console and still allow verification
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔑 Resent OTP for ${email}: ${otp}`);
        res.status(200).json({
          success: true,
          message: 'New verification code generated (check server console for development)',
          developmentOtp: otp // Only in development
        });
      } else {
        // In production, fail if email can't be sent
        res.status(500).json({
          success: false,
          message: 'Failed to resend verification email. Please try again later.'
        });
      }
    }      } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendEmailVerification,
  verifyEmail,
  resendVerification
};
