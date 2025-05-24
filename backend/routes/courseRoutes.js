const {Router} = require('express');
const router = Router();
const { getCourses, getCourseById } = require('../controllers/couresController');
const { protect } = require('../middleware/auth');
 
// Public route - accessible by anyone
router.get('/all', getCourses);

// Protected route - requires authentication
router.get('/:id', protect, getCourseById);

module.exports = router;