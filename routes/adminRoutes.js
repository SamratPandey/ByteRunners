const express = require('express');
const { 
  registerAdmin, 
  loginAdmin, 
  getAllUsers, 
  deleteUser, 
  createProblem, 
  updateProblem, 
  getAnalytics 
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

const router = express.Router();

// Authentication Routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// User Management Routes
router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:id', adminProtect, deleteUser);

// Problem Management Routes
router.post('/problems', adminProtect, createProblem);
router.put('/problems/:id', adminProtect, updateProblem);

// Analytics Route
router.get('/analytics', adminProtect, getAnalytics);

module.exports = router;