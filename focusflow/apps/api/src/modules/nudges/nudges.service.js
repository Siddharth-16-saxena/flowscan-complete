const { getUserState } = require('../../core/store/dev-store');

function evaluateNudges(userId, payload) {
  const state = getUserState(userId);
  const recentActiveNudge = state.nudges.find((nudge) => !nudge.actedOn && nudge.status === 'pending');

  if (recentActiveNudge) {
    return recentActiveNudge;
  }

  const shouldNudge = Number(payload.recentDistractionMinutes || 0) >= 20 && !payload.activeSession;

  if (!shouldNudge) {
    return null;
  }

  const nudge = {
    nudgeId: `nudge-${Date.now()}`,
    type: 'pre_risk_nudge',
    title: 'You usually drift around this hour',
    message: 'A 15-minute focus block now could protect the rest of your evening.',
    status: 'pending',
    actedOn: false,
    createdAt: new Date().toISOString(),
  };

  state.nudges.unshift(nudge);

  return nudge;
}

function listNudges(userId) {
  return getUserState(userId).nudges;
}

module.exports = { evaluateNudges, listNudges };
