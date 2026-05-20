const { AppError } = require('../../core/errors/app-error');
const { getUserState } = require('../../core/store/dev-store');

function validateSession(payload) {
  if (!payload.sessionId) {
    throw new AppError(400, 'SESSION_ID_REQUIRED', 'A sessionId is required.');
  }

  if (!payload.startedAt || !payload.endedAt) {
    throw new AppError(400, 'SESSION_TIMESTAMPS_REQUIRED', 'startedAt and endedAt are required.');
  }

  if ((payload.actualDurationMinutes || 0) < 0) {
    throw new AppError(400, 'INVALID_SESSION_DURATION', 'Session duration cannot be negative.');
  }
}

function saveSession(userId, payload) {
  validateSession(payload);

  const state = getUserState(userId);
  const existingIndex = state.focusSessions.findIndex((session) => session.sessionId === payload.sessionId);
  const session = {
    type: 'focus',
    mode: 'pomodoro',
    plannedDurationMinutes: 25,
    actualDurationMinutes: 0,
    interruptionCount: 0,
    interruptionReasons: [],
    completed: false,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    state.focusSessions[existingIndex] = {
      ...state.focusSessions[existingIndex],
      ...session,
    };
  } else {
    state.focusSessions.push({
      createdAt: new Date().toISOString(),
      ...session,
    });
  }

  return state.focusSessions.find((item) => item.sessionId === payload.sessionId);
}

function listSessions(userId) {
  return [...getUserState(userId).focusSessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

module.exports = { saveSession, listSessions };
