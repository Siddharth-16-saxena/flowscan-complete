const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');

// GET /dashboard — aggregated stats
router.get('/', getDashboard);

module.exports = router;
