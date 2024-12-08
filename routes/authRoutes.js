const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, getDashboardData } = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const User = require('../models/User'); 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);  
router.post('/reset-password', resetPassword);  
router.get('/dashboard', protect, getDashboardData); 

module.exports = router;
