const {Router} = require('express');
const router = Router();
const { getCourses, getCourseById } = require('../controllers/couresController');

 


router.get('/all', getCourses);
router.get('/:id', getCourseById);

module.exports = router;