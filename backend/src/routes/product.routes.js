const express = require('express');
const controller = require('../controllers/product.controller');

const router = express.Router();

router.post('/barcode/:barcode/analyze', controller.analyzeBarcode);
router.get('/search', controller.searchProducts);
router.get('/scans/recent', controller.getRecentScans);

module.exports = router;
