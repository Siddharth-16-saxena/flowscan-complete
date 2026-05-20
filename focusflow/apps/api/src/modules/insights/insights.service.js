const { getUserState } = require('../../core/store/dev-store');
const { calculateWeeklyAnalytics } = require('../analytics/analytics.service');

function buildLateNightInsight(userId, dateKey) {
  const state = getUserState(userId);
  const usageDays = Object.values(state.usageDaily);
  const lateNightUsage = usageDays
    .flatMap((usage) => usage.hourlyBreakdown || [])
    .filter((hour) => hour.hour >= 22)
    .reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);

  if (lateNightUsage < 60) {
    return null;
  }

  const weeklyAnalytics = calculateWeeklyAnalytics(userId, dateKey);

  return {
    insightId: 'late-night-distraction',
    type: 'late_night_distraction',
    title: 'Your distraction rises late at night',
    summary: 'Recent usage suggests your most distracting window starts after 10 PM.',
    recommendation: 'Try adding a short wind-down session before the hour when distractions usually climb.',
    confidence: weeklyAnalytics.focusScore < 0.5 ? 0.84 : 0.72,
    severity: 'medium',
    status: 'active',
    generatedAt: new Date().toISOString(),
  };
}

function refreshInsights(userId, dateKey) {
  const state = getUserState(userId);
  const insights = [buildLateNightInsight(userId, dateKey)].filter(Boolean);

  state.insights = insights;

  return insights;
}

function listInsights(userId) {
  return getUserState(userId).insights;
}

module.exports = { refreshInsights, listInsights };
