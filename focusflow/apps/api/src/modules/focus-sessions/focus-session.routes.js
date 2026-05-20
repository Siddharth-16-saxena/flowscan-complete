const express = require('express');

const { listSessions, saveSession } = require('./focus-session.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ sessions: listSessions(req.user.id) });
});

router.post('/', (req, res) => {
  res.status(201).json({ session: saveSession(req.user.id, req.body || {}) });
});

router.patch('/:sessionId', (req, res) => {
  res.json({
    session: saveSession(req.user.id, {
      ...req.body,
      sessionId: req.params.sessionId,
    }),
  });
});

module.exports = { router };
