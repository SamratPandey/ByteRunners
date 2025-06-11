const express = require('express');
const router = express.Router();
const {
  getGlobalLeaderboard,
  getUserLeaderboardPosition,
  getCategoryLeaderboard,
  getLeaderboardStats
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

// Public routes (anyone can view leaderboard)
router.get('/global', getGlobalLeaderboard);
router.get('/category', getCategoryLeaderboard);
router.get('/stats', getLeaderboardStats);

// Protected routes (require authentication)
router.get('/my-position', protect, getUserLeaderboardPosition);

module.exports = router;
