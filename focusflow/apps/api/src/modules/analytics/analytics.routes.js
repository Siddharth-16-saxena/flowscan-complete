const express = require('express');

const { calculateDailyAnalytics, calculateWeeklyAnalytics, getDashboard } = require('./analytics.service');

const router = express.Router();

router.get('/dashboard', (req, res) => {
  const dateKey = req.query.dateKey || new Date().toISOString().slice(0, 10);
  res.json(getDashboard(req.user.id, dateKey));
});

router.get('/daily/:dateKey', (req, res) => {
  res.json({ analyticsDaily: calculateDailyAnalytics(req.user.id, req.params.dateKey) });
});

router.get('/weekly/:dateKey', (req, res) => {
  res.json({ analyticsWeekly: calculateWeeklyAnalytics(req.user.id, req.params.dateKey) });
});

module.exports = { router };
