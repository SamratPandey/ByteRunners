const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');

// Apply for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter, additionalNotes } = req.body;
        const userId = req.user.id;

        // Validate if jobId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }

        // Check if job is still active
        if (!job.isActive) {
            return res.status(400).json({ 
                success: false, 
                message: 'This job posting is no longer active' 
            });
        }

        // Check if application deadline has passed
        if (job.applicationDeadline && new Date() > job.applicationDeadline) {
            return res.status(400).json({ 
                success: false, 
                message: 'Application deadline has passed' 
            });
        }

        // Check if user already applied
        const existingApplication = await JobApplication.findOne({ 
            userId, 
            jobId 
        });

        if (existingApplication) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already applied for this job' 
            });
        }

        // Create new application
        const application = new JobApplication({
            userId,
            jobId,
            coverLetter: coverLetter || '',
            additionalNotes: additionalNotes || ''
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });

    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while submitting application' 
        });
    }
};

// Get user's job applications
const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const applications = await JobApplication.find({ userId })
            .populate('jobId', 'title company location salary type')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.error('Get user applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching applications' 
        });
    }
};

// Check if user has applied for a specific job
const checkApplicationStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        // Validate if jobId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        const application = await JobApplication.findOne({ userId, jobId });

        res.json({
            success: true,
            hasApplied: !!application,
            application: application || null
        });

    } catch (error) {
        console.error('Check application status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while checking application status' 
        });
    }
};

// Admin: Get all applications for a job
const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Validate if jobId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        const applications = await JobApplication.find({ jobId })
            .populate('userId', 'name email')
            .populate('jobId', 'title company')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.error('Get job applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching job applications' 
        });
    }
};

// Admin: Get all applications
const getAllApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find()
            .populate('userId', 'name email')
            .populate('jobId', 'title company location')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching applications' 
        });
    }
};

// Admin: Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        // Validate if applicationId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID format'
            });
        }

        if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status' 
            });
        }

        const application = await JobApplication.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        ).populate('userId', 'name email')
         .populate('jobId', 'title company');

        if (!application) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application
        });

    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating application status' 
        });
    }
};

module.exports = {
    applyForJob,
    getUserApplications,
    checkApplicationStatus,
    getJobApplications,
    getAllApplications,
    updateApplicationStatus
};
