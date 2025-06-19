const nodemailer = require('nodemailer');
const EmailTemplateService = require('../utils/emailTemplateService');

// Create the transporter using Gmail's SMTP with explicit configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send emails with HTML support
const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS environment variables are required');
    }    // Test connection first
    await transporter.verify();
    const mailOptions = {
      from: {
        name: 'ByteRunners',
        address: process.env.EMAIL_USER
      },
      to: to,  
      subject: subject,  
      text: text,
    };

    // Add HTML content if provided
    if (html) {
      mailOptions.html = html;
      // Ensure HTML takes precedence      mailOptions.attachDataUrls = true;
    }
    
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Detailed email error:', error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Authentication failed. Please check your email credentials and ensure 2FA is enabled with an app password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Connection failed. Please check your internet connection and Gmail SMTP settings.');
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }  }
};

// Function to send templated emails
const sendTemplatedEmail = async (to, subject, templateName, templateData) => {
  try {
    // Generate HTML content using template
    const htmlContent = await EmailTemplateService.generateEmail(templateName, templateData);
    
    // Generate plain text fallback
    const plainTextContent = EmailTemplateService.generatePlainText(templateName, templateData);
    
    // Send email with both HTML and plain text
    return await sendEmail(to, subject, plainTextContent, htmlContent);
  } catch (error) {
    console.error('Error sending templated email:', error);
    throw error;
  }
};

// Convenient functions for specific email types
const sendWelcomeEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getWelcomeEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('welcome', userData);
  return await sendEmail(to, 'Welcome to ByteRunners!', plainTextContent, htmlContent);
};

const sendPasswordResetEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getPasswordResetEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('password-reset', userData);
  return await sendEmail(to, 'Reset Your ByteRunners Password', plainTextContent, htmlContent);
};

const sendPasswordResetSuccessEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getPasswordResetSuccessEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('password-reset-success', userData);
  return await sendEmail(to, 'Password Reset Successful', plainTextContent, htmlContent);
};

const sendCourseCompletionEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getCourseCompletionEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('course-completion', userData);
  return await sendEmail(to, `Congratulations! You've completed ${userData.courseName}`, plainTextContent, htmlContent);
};

const sendJobApplicationEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getJobApplicationEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('job-application-confirmation', userData);
  return await sendEmail(to, 'Job Application Confirmation', plainTextContent, htmlContent);
};

const sendNotificationEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getNotificationEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('notification', userData);
  return await sendEmail(to, userData.title || 'New Notification', plainTextContent, htmlContent);
};

const sendTestEmail = async (to) => {
  const htmlContent = await EmailTemplateService.getTestEmail();
  const plainTextContent = EmailTemplateService.generatePlainText('test-email', {});
  return await sendEmail(to, 'Test Email from ByteRunners', plainTextContent, htmlContent);
};

const sendCoursePurchaseEmail = async (to, userData) => {
  const htmlContent = await EmailTemplateService.getCoursePurchaseEmail(userData);
  const plainTextContent = EmailTemplateService.generatePlainText('course-purchase', userData);
  const subject = userData.courses && userData.courses.length > 1 
    ? 'Your Courses Are Ready!' 
    : 'Your Course Is Ready!';
  return await sendEmail(to, subject, plainTextContent, htmlContent);
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendCourseCompletionEmail,
  sendJobApplicationEmail,
  sendNotificationEmail,
  sendTestEmail,
  sendCoursePurchaseEmail
};
