const express = require('express');

const { readToolingStatus } = require('./tooling.service');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(readToolingStatus());
});

module.exports = { router };
