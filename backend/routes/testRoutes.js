const express = require('express');
const router = express.Router();
const {
  generateTestQuestions,
  submitTestAnswers,
  getPersonalizedRecommendations,
  getTestAnalytics,
  getDetailedAnalytics,
  getRecommendations,
  getUserTestHistory
} = require('../controllers/testController');
const { protect } = require('../middleware/auth');

// All test routes require authentication
router.use(protect);

// Generate AI-powered test questions
router.post('/generate-questions', generateTestQuestions);

// Submit test answers and get AI analysis
router.post('/submit-answers', submitTestAnswers);

// Get personalized recommendations (legacy endpoint)
router.get('/recommendations', getPersonalizedRecommendations);

// Get test analytics and history (legacy endpoint)
router.get('/analytics', getTestAnalytics);

// Enhanced analytics endpoints for TestAnalytics component
router.get('/detailed-analytics', getDetailedAnalytics);
router.get('/ai-recommendations', getRecommendations);
router.get('/test-history', getUserTestHistory);

module.exports = router;
