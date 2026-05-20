const express = require('express');

const { evaluateNudges, listNudges } = require('./nudges.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ nudges: listNudges(req.user.id) });
});

router.post('/evaluate', (req, res) => {
  const nudge = evaluateNudges(req.user.id, req.body || {});
  res.json({ nudge });
});

module.exports = { router };
