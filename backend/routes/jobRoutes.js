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

router.get('/',  getAllJobs);
router.get('/:id', protect, getJobById);
router.post('/', adminProtect, createJob);
router.put('/:id', adminProtect, updateJob);
router.delete('/:id', adminProtect, deleteJob);

module.exports = router;