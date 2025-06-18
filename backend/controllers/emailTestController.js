const EmailTemplateService = require('../utils/emailTemplateService');
const { 
  sendTestEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail,
  sendJobApplicationEmail,
  sendNotificationEmail,
  sendTemplatedEmail
} = require('./sendMail');

// Preview email template without sending
const previewEmailTemplate = async (req, res) => {
  try {
    const { templateName, data = {} } = req.body;
    
    if (!templateName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name is required' 
      });
    }

    // Sample data for preview
    const sampleData = {
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      resetLink: 'https://byterunners.com/reset-password/sample-token',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Tech Corp',
      applicationDate: new Date().toISOString(),
      applicationId: 'APP-123456',
      courseName: 'JavaScript Fundamentals',
      completionDate: new Date().toISOString(),
      certificateUrl: 'https://byterunners.com/certificates/sample',
      notificationTitle: 'Course Completion',
      notificationMessage: 'Congratulations! You have completed the course.',
      testMessage: 'This is a test email preview.',
      testDate: new Date().toISOString(),
      ...data
    };

    const htmlContent = await EmailTemplateService.generateEmail(templateName, sampleData);
    
    if (!htmlContent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    res.json({
      success: true,
      templateName,
      htmlContent,
      data: sampleData
    });
  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to preview email template',
      error: error.message 
    });
  }
};

// Send test email
const sendTestEmailController = async (req, res) => {
  try {
    const { email, templateName, data = {} } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    if (!templateName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name is required' 
      });
    }

    // Sample data for testing
    const testData = {
      userName: 'Test User',
      userEmail: email,
      resetLink: 'https://byterunners.com/reset-password/test-token',
      jobTitle: 'Software Engineer',
      companyName: 'Test Company',
      applicationDate: new Date().toISOString(),
      applicationId: 'TEST-123456',
      courseName: 'Test Course',
      completionDate: new Date().toISOString(),
      certificateUrl: 'https://byterunners.com/certificates/test',
      notificationTitle: 'Test Notification',
      notificationMessage: 'This is a test notification email.',
      testMessage: 'This is a test email.',
      testDate: new Date().toISOString(),
      ...data
    };

    // Send email based on template type
    let result;
    switch (templateName) {
      case 'welcome':
        result = await sendWelcomeEmail(email, testData);
        break;
      case 'password-reset':
        result = await sendPasswordResetEmail(email, testData);
        break;
      case 'password-reset-success':
        result = await sendPasswordResetSuccessEmail(email, testData);
        break;
      case 'job-application-confirmation':
        result = await sendJobApplicationEmail(email, testData);
        break;
      case 'notification':
        result = await sendNotificationEmail(email, testData);
        break;
      case 'test-email':
        result = await sendTestEmail(email);
        break;
      default:
        result = await sendTemplatedEmail(email, `Test: ${templateName}`, templateName, testData);
    }

    res.json({
      success: true,
      message: 'Test email sent successfully',
      templateName,
      recipient: email,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
};

// Get list of available email templates
const getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplateService.getAvailableTemplates();
    
    res.json({
      success: true,
      templates: templates.map(template => ({
        name: template,
        displayName: template.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
    });
  } catch (error) {
    console.error('Error getting email templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get email templates',
      error: error.message 
    });
  }
};

// Get email template content for editing
const getEmailTemplateContent = async (req, res) => {
  try {
    const { templateName } = req.params;
    
    if (!templateName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name is required' 
      });
    }

    const templateContent = EmailTemplateService.loadTemplate(`${templateName}.html`);
    
    if (!templateContent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    res.json({
      success: true,
      templateName,
      content: templateContent
    });
  } catch (error) {
    console.error('Error getting email template content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get email template content',
      error: error.message 
    });
  }
};

module.exports = {
  previewEmailTemplate,
  sendTestEmailController,
  getEmailTemplates,
  getEmailTemplateContent
};
