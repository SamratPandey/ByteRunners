const {Router} = require('express');
const router = Router();
const { 
    getCourses, 
    getCourseById, 
    purchaseCourse,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    addReview,
    getFeaturedCourses,
    getCourseStats,
    getUserEnrolledCourses,
    getUserCourseProgress
} = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
 
// Public routes
router.get('/all', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/stats', getCourseStats);
router.get('/:id', optionalAuth, getCourseById);

// Protected routes - requires authentication
router.post('/purchase', protect, purchaseCourse);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:courseId', protect, removeFromWishlist);
router.get('/user/wishlist', protect, getWishlist);
router.get('/user/enrolled', protect, getUserEnrolledCourses);
router.get('/user/progress/:courseId', protect, getUserCourseProgress);
router.post('/:courseId/review', protect, addReview);

module.exports = router;