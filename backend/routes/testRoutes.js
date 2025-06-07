const express = require('express');
const router = express.Router();
const {
  generateTestQuestions,
  submitTestAnswers,
  getPersonalizedRecommendations,
  getTestAnalytics
} = require('../controllers/testController');
const { protect } = require('../middleware/auth');

// All test routes require authentication
router.use(protect);

// Generate AI-powered test questions
router.post('/generate-questions', generateTestQuestions);

// Submit test answers and get AI analysis
router.post('/submit-answers', submitTestAnswers);

// Get personalized recommendations
router.get('/recommendations', getPersonalizedRecommendations);

// Get test analytics and history
router.get('/analytics', getTestAnalytics);

module.exports = router;
