const nodemailer = require('nodemailer');

// Create the transporter using Gmail's SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use 'gmail' service, or any other supported SMTP service
  auth: {
    user: process.env.EMAIL_USER,  // Your Gmail email address (loaded from environment variable)
    pass: process.env.EMAIL_PASS,  // Your Gmail password or app password
  },
});

// Function to send emails
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender email
      to: to,  // Recipient email
      subject: subject,  // Email subject
      text: text,  // Email body text
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
