const express = require('express');
const router = express.Router();
const {
  saveOnboardingData,
  getOnboardingStatus,
  getSkillAssessmentQuestions,
  validateSkillAssessment
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');

// All onboarding routes require authentication
router.use(protect);

// Save onboarding data
router.post('/save', saveOnboardingData);

// Get onboarding status
router.get('/status', getOnboardingStatus);

// Get skill assessment questions
router.get('/assessment-questions', getSkillAssessmentQuestions);

// Validate skill assessment answers
router.post('/validate-assessment', validateSkillAssessment);

module.exports = router;
