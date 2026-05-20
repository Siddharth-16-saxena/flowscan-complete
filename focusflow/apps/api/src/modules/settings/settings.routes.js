const express = require('express');

const { updateSettings, getSettings } = require('./settings.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ settings: getSettings(req.user.id) });
});

router.patch('/', (req, res) => {
  res.json({ settings: updateSettings(req.user.id, req.body || {}) });
});

module.exports = { router };
