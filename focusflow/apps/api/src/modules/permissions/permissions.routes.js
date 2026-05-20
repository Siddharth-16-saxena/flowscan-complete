const express = require('express');

const { getPermissions, updatePermissions } = require('./permissions.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ permissions: getPermissions(req.user.id) });
});

router.put('/', (req, res) => {
  res.json({ permissions: updatePermissions(req.user.id, req.body || {}) });
});

module.exports = { router };
