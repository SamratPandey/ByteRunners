const {Router} = require('express');
const router = Router();
const { getAllCourses } = require('../controllers/couresController');


router.get('/course', getAllCourses);

module.exports = router;