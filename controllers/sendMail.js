const nodemailer = require('nodemailer');

// Create the transporter using Gmail's SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

// Function to send emails
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,  
      to: to,  
      subject: subject,  
      text: text,  
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
