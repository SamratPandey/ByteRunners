const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, getDashboardData } = require('../controllers/authController');
const { executeCode } = require('../controllers/judge0'); // Updated to use utils/judge0
const { protect } = require('../middleware/auth');
const { getProblemDetails } = require('../controllers/problemController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);  
router.post('/reset-password', resetPassword);  

router.post('/run-code', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  try {
    const result = await executeCode(source_code, language_id, stdin);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /run-code route:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', protect, getDashboardData); 
router.get('/profile', protect, getDashboardData); 

router.get('/:id', getProblemDetails);

module.exports = router;
