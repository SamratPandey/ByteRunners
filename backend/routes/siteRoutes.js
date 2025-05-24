const express = require('express');
const router = express.Router();

const { getAllProblems } =require('../controllers/adminController')
const { runCodePublic } = require('../controllers/publicCodeController');

router.get('/problems', getAllProblems);
router.post('/run-code-public', runCodePublic);

module.exports = router;