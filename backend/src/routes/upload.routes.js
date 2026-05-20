const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadWorkflow } = require('../controllers/upload.controller');

// POST /upload — accept single file field named "file"
router.post('/', upload.single('file'), uploadWorkflow);

module.exports = router;
