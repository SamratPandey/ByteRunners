const express = require('express');
const { 
  loginAdmin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  getProblemStats,
  getTopPerformers,
  getRecentActivity  
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

// Import the logoutAdmin function
const { logoutAdmin } = require('../controllers/tempLogoutAdmin');
const { checkAdminAuth } = require('../controllers/tempCheckAdminAuth');

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

// Auth check route - already uses adminProtect internally
router.get('/check-auth', adminProtect, checkAdminAuth);

// All other routes require admin authentication
router.use(adminProtect);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/user-stats', getUserStats);

// Problem management routes
router.post('/problems', createProblem);
router.get('/problems', getAllProblems);
router.get('/problems/:id', getProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);
router.get('/problem-stats', getProblemStats);

// Routes for top performers and recent activity
router.get('/top-performers', getTopPerformers); 
router.get('/recent-activity', getRecentActivity); 

module.exports = router;
