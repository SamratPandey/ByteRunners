const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, getDashboardData } = require('../controllers/authController');
const { executeCode } = require('../utils/judge0'); 
const { protect } = require('../middleware/auth');
const { getProblemById } = require('../controllers/problemController');
const LANGUAGE_MAP = require('../utils/languageMap');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);  
router.post('/reset-password', resetPassword);  

router.post('/run-code', async (req, res) => {
  const { source_code, language, stdin = '' } = req.body;

  if (!source_code || !language) {
    return res.status(400).json({ error: 'Source code and language are required.' });
  }

  const language_id = LANGUAGE_MAP[language.toLowerCase()];
  if (!language_id) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }
 

  try {
    const result = await executeCode(source_code, language_id, stdin);
    const success = result.status?.id === 3;

    res.status(200).json({ success, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Code execution failed.' });
  }
});

router.post('/submit', protect, async (req, res) => {
  const { userId, problemId, code, language, stdin = '' } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  const language_id = LANGUAGE_MAP[language.toLowerCase()];
  if (!language_id) {
    return res.status(400).json({ error: 'Unsupported language submitted.' });
  }

  try {
    const user = await User.findById(userId);
    const problem = await Problem.findById(problemId);

    if (!user || !problem) {
      return res.status(404).json({ error: 'User or problem not found.' });
    }

    if (user.solvedProblems.includes(problemId)) {
      return res.status(400).json({ error: 'Problem already solved.' });
    }

    const result = await executeCode(code, language_id, stdin);
    const output = result.stdout?.trim();
    const expected = problem.expectedOutput?.trim();

    const isSolved = result.status?.id === 3 && output === expected;

    user.totalSubmissions += 1;
    if (isSolved) {
      user.solvedProblems.push(problemId);
      user.problemsSolved += 1;
      await user.save();
      return res.status(200).json({ status: 'solved', message: 'Problem solved!' });
    }

    await user.save();
    res.status(400).json({ status: 'failed', message: 'Incorrect solution.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/dashboard', protect, getDashboardData); 
router.get('/profile', protect, getDashboardData); 
router.get('/problem/:id', protect, getProblemById);

module.exports = router;
