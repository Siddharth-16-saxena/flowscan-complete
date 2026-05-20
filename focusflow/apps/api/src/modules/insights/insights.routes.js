const express = require('express');

const { listInsights, refreshInsights } = require('./insights.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ insights: listInsights(req.user.id) });
});

router.post('/refresh', (req, res) => {
  const dateKey = req.body.dateKey || new Date().toISOString().slice(0, 10);
  res.json({ insights: refreshInsights(req.user.id, dateKey) });
});

module.exports = { router };
