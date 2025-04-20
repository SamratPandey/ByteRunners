const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, getDashboardData } = require('../controllers/authController');
const { executeCode } = require('../controllers/judge0'); 
const { protect } = require('../middleware/auth');
const { getProblemById } = require('../controllers/problemController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);  
router.post('/reset-password', resetPassword);  

router.post('/run-code', async (req, res) => {
  const { source_code, language_id, stdin = '' } = req.body;
  console.log('Request body:', {
    languageId: language_id,
    hasSourceCode: !!source_code,
    stdin: stdin
  });

  if (!source_code || !language_id) {
    return res.status(400).json({ error: 'Source code and language ID are required' });
  }

  try {
    const result = await executeCode(source_code, Number(language_id), stdin);
    console.log('Execution result:', result);
    
    if (result.status?.id === 3) {
      res.status(200).json({
        success: true,
        ...result
      });
    } else {
      res.status(200).json({
        success: false,
        ...result
      });
    }
  } catch (error) {
    console.error("Error in /run-code route:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/submit', protect, async (req, res) => {
  const { userId, problemId, code } = req.body;

  try {
    const user = await User.findById(userId);
    const problem = await Problem.findById(problemId);

    if (user.solvedProblems.includes(problemId)) {
      return res.status(400).json({ error: 'Problem already solved.' });
    }

    const isSolved = true; 

    if (isSolved) {
      user.solvedProblems.push(problemId);
      user.problemsSolved += 1;
      user.totalSubmissions += 1;
      await user.save();

      res.status(200).json({ status: 'solved', message: 'Problem solved!' });
    } else {
      res.status(400).json({ status: 'failed', message: 'Incorrect solution.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/dashboard', protect, getDashboardData); 
router.get('/profile', protect, getDashboardData); 
router.get('/problem/:id', protect, getProblemById);

module.exports = router;
