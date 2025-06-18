const express = require('express');
const { 
  loginAdmin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserGrowthStats,
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  getProblemStats,
  getProblemGrowthStats,
  getTopPerformers,
  getRecentActivity  
} = require('../controllers/adminController');

// Import course management controllers
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCurriculum,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  getCourseAnalytics
} = require('../controllers/adminCourseController');

// Import order management controllers
const {
  getAllOrders,
  getOrder,
  updateOrderStatus,
  processRefund,
  getOrderAnalytics,
  exportOrders
} = require('../controllers/orderController');

// Import email testing controllers
const {
  previewEmailTemplate,
  sendTestEmailController,
  getEmailTemplates,
  getEmailTemplateContent
} = require('../controllers/emailTestController');

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
router.get('/user-growth-stats', getUserGrowthStats);

// Problem management routes
router.post('/problems', createProblem);
router.get('/problems', getAllProblems);
router.get('/problems/:id', getProblem);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);
router.get('/problem-stats', getProblemStats);
router.get('/problem-growth-stats', getProblemGrowthStats);

// Course management routes
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourse);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/curriculum', updateCurriculum);
router.post('/courses/:id/coupons', addCoupon);
router.put('/courses/:id/coupons/:couponId', updateCoupon);
router.delete('/courses/:id/coupons/:couponId', deleteCoupon);
router.get('/courses/:id/analytics', getCourseAnalytics);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', processRefund);
router.get('/orders/analytics/data', getOrderAnalytics);
router.get('/orders/export/csv', exportOrders);

// Routes for top performers and recent activity
router.get('/top-performers', getTopPerformers); 
router.get('/recent-activity', getRecentActivity); 

// Email testing and management routes
router.get('/email-templates', getEmailTemplates);
router.get('/email-templates/:templateName/content', getEmailTemplateContent);
router.post('/email-templates/preview', previewEmailTemplate);
router.post('/email-templates/test', sendTestEmailController);

module.exports = router;
