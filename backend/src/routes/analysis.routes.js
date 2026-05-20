const express = require('express');
const router = express.Router();
const { getAnalysis, rerunAnalysis } = require('../controllers/analysis.controller');

// GET /analysis/:id — fetch full analysis for a workflow
router.get('/:id', getAnalysis);

// POST /analysis/:id/rerun — force re-run analysis
router.post('/:id/rerun', rerunAnalysis);

module.exports = router;
