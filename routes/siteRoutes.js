const express = require('express');
const router = express.Router();

const { getAllProblems } =require('../controllers/adminController')


router.get('/problems', getAllProblems);

module.exports = router;