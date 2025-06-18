const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

class EmailTemplateService {
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates');
        this.baseTemplate = null;
        this.registerHelpers();
    }

    // Register Handlebars helpers for email templates
    registerHelpers() {
        Handlebars.registerHelper('formatDate', function(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        });

        Handlebars.registerHelper('formatCurrency', function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });

        Handlebars.registerHelper('uppercase', function(str) {
            return str ? str.toUpperCase() : '';
        });

        Handlebars.registerHelper('capitalize', function(str) {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        });
    }

    // Load and cache the base template
    async loadBaseTemplate() {
        if (!this.baseTemplate) {
            const baseTemplatePath = path.join(this.templatesPath, 'base.html');
            this.baseTemplate = await fs.readFile(baseTemplatePath, 'utf8');
        }
        return this.baseTemplate;
    }    // Replace placeholders in template with actual values
    replacePlaceholders(template, data) {
        let result = template;
        
        try {
            // Try to use Handlebars compilation first
            const compiledTemplate = Handlebars.compile(template);
            result = compiledTemplate(data);
        } catch (error) {
            // Fallback to simple placeholder replacement
            for (const [key, value] of Object.entries(data)) {
                const placeholder = new RegExp(`{{${key}}}`, 'g');
                result = result.replace(placeholder, value || '');
            }
        }
        
        return result;
    }

    // Generate complete email HTML
    async generateEmail(templateName, data = {}) {
        try {
            // Load base template
            const baseTemplate = await this.loadBaseTemplate();
            
            // Load specific content template
            const contentTemplatePath = path.join(this.templatesPath, `${templateName}.html`);
            const contentTemplate = await fs.readFile(contentTemplatePath, 'utf8');
            
            // Default data
            const defaultData = {
                websiteUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
                year: new Date().getFullYear(),
                unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe`,
                title: 'ByteRunners - Accelerating Your Coding Journey'
            };
            
            // Merge default data with provided data
            const templateData = { ...defaultData, ...data };
            
            // Replace placeholders in content template
            const processedContent = this.replacePlaceholders(contentTemplate, templateData);
            
            // Insert processed content into base template
            const finalData = { ...templateData, content: processedContent };
            const finalEmail = this.replacePlaceholders(baseTemplate, finalData);
            
            return finalEmail;
        } catch (error) {
            console.error('Error generating email template:', error);
            throw new Error(`Failed to generate email template: ${error.message}`);
        }
    }

    // Generate plain text version of email (fallback)
    generatePlainText(templateName, data = {}) {
        switch (templateName) {
            case 'password-reset':
                return `Hello ${data.userName || 'there'},

We received a request to reset your password for your ByteRunners account.

Reset Link: ${data.resetLink}

This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.

If you continue to have trouble, please contact our support team.

Best regards,
The ByteRunners Team`;

            case 'test-email':
                return `Hello there!

This is a test email from ByteRunners to verify that our email system is working correctly.

If you're reading this, it means our email delivery system is functioning perfectly!

Thank you for helping us test our email system!

Best regards,
The ByteRunners Team`;

            case 'welcome':
                return `Welcome to ByteRunners, ${data.userName || 'Developer'}!

We're thrilled to have you join our community of passionate developers! Your account has been successfully created.

Visit us at: ${data.websiteUrl || 'http://localhost:3000'}

Here's what you can do next:
- Complete your profile setup
- Browse our extensive course library
- Explore job opportunities
- Check out the leaderboard
- Solve daily coding problems

Best regards,
The ByteRunners Team`;

            case 'password-reset-success':
                return `Congratulations, ${data.userName || 'there'}!

Your password has been successfully reset! You can now log in to your ByteRunners account using your new password.

Login at: ${data.websiteUrl || 'http://localhost:3000'}/login

For your security, please keep your password secure and don't share it with anyone.

Best regards,
The ByteRunners Team`;

            default:
                return `Hello from ByteRunners!

Thank you for being part of our community.

Best regards,
The ByteRunners Team`;
        }
    }    // List available templates
    async getAvailableTemplates() {
        try {
            const files = await fs.readdir(this.templatesPath);
            return files
                .filter(file => file.endsWith('.html') && file !== 'base.html')
                .map(file => file.replace('.html', ''));
        } catch (error) {
            console.error('Error listing templates:', error);
            return [];
        }
    }

    // Convenient methods for specific email types
    async getWelcomeEmail(userData) {
        return await this.generateEmail('welcome', {
            userName: userData.name,
            userEmail: userData.email,
            activationLink: userData.activationLink,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        });
    }

    async getPasswordResetEmail(userData) {
        return await this.generateEmail('password-reset', {
            userName: userData.name,
            resetLink: userData.resetLink,
            expirationTime: '1 hour'
        });
    }

    async getPasswordResetSuccessEmail(userData) {
        return await this.generateEmail('password-reset-success', {
            userName: userData.name,
            loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        });
    }

    async getCourseCompletionEmail(userData) {
        return await this.generateEmail('course-completion', {
            userName: userData.name,
            courseName: userData.courseName,
            completionDate: userData.completionDate,
            certificateUrl: userData.certificateUrl,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        });
    }

    async getJobApplicationEmail(userData) {
        return await this.generateEmail('job-application-confirmation', {
            userName: userData.name,
            jobTitle: userData.jobTitle,
            companyName: userData.companyName,
            applicationDate: userData.applicationDate,
            applicationId: userData.applicationId,
            jobsUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs`
        });
    }

    async getNotificationEmail(userData) {
        return await this.generateEmail('notification', {
            userName: userData.name,
            notificationTitle: userData.title,
            notificationMessage: userData.message,
            notificationDate: userData.date,
            actionUrl: userData.actionUrl,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        });
    }

    async getCoursePurchaseEmail(userData) {
        return await this.generateEmail('course-purchase', {
            userName: userData.name,
            coursePurchases: userData.courses,
            multipleCourses: userData.courses && userData.courses.length > 1,
            orderId: userData.orderId,
            invoiceNumber: userData.invoiceNumber,
            totalAmount: userData.totalAmount,
            paymentMethod: userData.paymentMethod,
            purchaseDate: userData.purchaseDate,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        });
    }

    async getTestEmail() {
        return await this.generateEmail('test-email', {
            testMessage: 'This is a test email to verify your email configuration is working correctly.',
            testDate: new Date().toISOString()
        });
    }
}

module.exports = new EmailTemplateService();
