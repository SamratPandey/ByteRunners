

const express = require('express');
const { 
  loginAdmin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes - require admin authentication
router.use(adminProtect);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/user-stats', getUserStats);

module.exports = router;