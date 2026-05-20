const express = require('express');

const { getDailyUsage, saveDailyUsage } = require('./usage.service');

const router = express.Router();

router.post('/daily', (req, res) => {
  res.status(201).json(saveDailyUsage(req.user.id, req.body || {}));
});

router.get('/daily/:dateKey', (req, res) => {
  res.json({ usageDaily: getDailyUsage(req.user.id, req.params.dateKey) });
});

module.exports = { router };
