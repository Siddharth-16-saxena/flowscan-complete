const { getUserState } = require('../../core/store/dev-store');
const { getWeekKey } = require('../../core/utils/time');

function calculateFocusMinutes(sessions, dateKey) {
  return sessions
    .filter((session) => session.startedAt.startsWith(dateKey))
    .reduce((sum, session) => sum + Number(session.actualDurationMinutes || 0), 0);
}

function calculateDailyAnalytics(userId, dateKey) {
  const state = getUserState(userId);
  const usage = state.usageDaily[dateKey];
  const focusMinutes = calculateFocusMinutes(state.focusSessions, dateKey);
  const distractionMinutes = usage?.totalDistractionMinutes || 0;
  const denominator = focusMinutes + distractionMinutes;

  return {
    dateKey,
    focusMinutes,
    distractionMinutes,
    focusScore: denominator === 0 ? 0 : Number((focusMinutes / denominator).toFixed(2)),
    sessionCount: state.focusSessions.filter((session) => session.startedAt.startsWith(dateKey)).length,
    completedSessionCount: state.focusSessions.filter(
      (session) => session.startedAt.startsWith(dateKey) && session.completed,
    ).length,
    interruptionCount: state.focusSessions
      .filter((session) => session.startedAt.startsWith(dateKey))
      .reduce((sum, session) => sum + Number(session.interruptionCount || 0), 0),
    dataQuality: usage?.sourceCompleteness || 'missing',
    computedAt: new Date().toISOString(),
  };
}

function calculateWeeklyAnalytics(userId, dateKey) {
  const state = getUserState(userId);
  const weekKey = getWeekKey(dateKey);
  const weekUsage = Object.values(state.usageDaily).filter((usage) => getWeekKey(usage.dateKey) === weekKey);
  const weekFocusSessions = state.focusSessions.filter((session) => getWeekKey(session.startedAt.slice(0, 10)) === weekKey);
  const focusMinutes = weekFocusSessions.reduce((sum, session) => sum + Number(session.actualDurationMinutes || 0), 0);
  const distractionMinutes = weekUsage.reduce((sum, usage) => sum + Number(usage.totalDistractionMinutes || 0), 0);
  const denominator = focusMinutes + distractionMinutes;
  const activeFocusDays = new Set(weekFocusSessions.map((session) => session.startedAt.slice(0, 10))).size;

  return {
    weekKey,
    focusMinutes,
    distractionMinutes,
    focusScore: denominator === 0 ? 0 : Number((focusMinutes / denominator).toFixed(2)),
    sessionCount: weekFocusSessions.length,
    completedSessionRate: weekFocusSessions.length === 0
      ? 0
      : Number((weekFocusSessions.filter((session) => session.completed).length / weekFocusSessions.length).toFixed(2)),
    consistencyScore: Number((Math.min(activeFocusDays / 7, 1)).toFixed(2)),
    trendDirection: 'steady',
    computedAt: new Date().toISOString(),
  };
}

function getDashboard(userId, dateKey) {
  return {
    today: calculateDailyAnalytics(userId, dateKey),
    currentWeek: calculateWeeklyAnalytics(userId, dateKey),
  };
}

module.exports = { calculateDailyAnalytics, calculateWeeklyAnalytics, getDashboard };
