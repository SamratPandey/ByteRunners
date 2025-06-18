const express = require('express');
const router = express.Router();
const {adminProtect} = require('../middleware/adminAuth');
const { protect } = require('../middleware/auth');

const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
} = require('../controllers/jobController');

const {
    applyForJob,
    getUserApplications,
    checkApplicationStatus,
    getJobApplications,
    getAllApplications,
    updateApplicationStatus
} = require('../controllers/jobApplicationController');

// Job routes (non-parameterized routes first)
router.get('/', getAllJobs);
router.post('/', adminProtect, createJob);

// User application routes (specific routes before parameterized ones)
router.get('/user/applications', protect, getUserApplications);

// Admin application routes (specific routes before parameterized ones)  
router.get('/admin/applications', adminProtect, getAllApplications);
router.put('/admin/applications/:applicationId/status', adminProtect, updateApplicationStatus);

// Job-specific routes (parameterized routes come after specific ones)
router.get('/:id', protect, getJobById);
router.put('/:id', adminProtect, updateJob);
router.delete('/:id', adminProtect, deleteJob);

// Job application routes (parameterized routes come last)
router.post('/:jobId/apply', protect, applyForJob);
router.get('/:jobId/check-application', protect, checkApplicationStatus);
router.get('/:jobId/applications', adminProtect, getJobApplications);

module.exports = router;