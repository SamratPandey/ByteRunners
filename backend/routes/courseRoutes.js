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
    getCourseStats
} = require('../controllers/couresController');
const { protect } = require('../middleware/auth');
 
// Public routes
router.get('/all', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/stats', getCourseStats);
router.get('/:id', getCourseById);

// Protected routes - requires authentication
router.post('/purchase', protect, purchaseCourse);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:courseId', protect, removeFromWishlist);
router.get('/user/wishlist', protect, getWishlist);
router.post('/:courseId/review', protect, addReview);

module.exports = router;