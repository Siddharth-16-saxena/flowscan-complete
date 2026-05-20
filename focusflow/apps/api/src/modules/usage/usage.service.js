const { AppError } = require('../../core/errors/app-error');
const { getUserState } = require('../../core/store/dev-store');
const { getWeekKey } = require('../../core/utils/time');

const DISTRACTING_CATEGORIES = new Set(['social', 'video', 'gaming', 'shopping']);

function normalizeApps(apps = []) {
  return apps.map((app) => ({
    appId: app.appId,
    appName: app.appName,
    minutes: Number(app.minutes || 0),
    category: app.category || 'other',
  }));
}

function saveDailyUsage(userId, payload) {
  if (!payload.dateKey) {
    throw new AppError(400, 'DATE_KEY_REQUIRED', 'dateKey is required.');
  }

  const apps = normalizeApps(payload.apps);
  const totalDistractionMinutes = apps
    .filter((app) => DISTRACTING_CATEGORIES.has(app.category))
    .reduce((sum, app) => sum + app.minutes, 0);
  const totalProductiveMinutes = apps
    .filter((app) => !DISTRACTING_CATEGORIES.has(app.category))
    .reduce((sum, app) => sum + app.minutes, 0);

  const usageDoc = {
    dateKey: payload.dateKey,
    timezone: payload.timezone || 'UTC',
    totalUsageMinutes: Number(payload.totalUsageMinutes || 0),
    totalDistractionMinutes,
    totalProductiveMinutes,
    topDistractingApps: apps
      .filter((app) => DISTRACTING_CATEGORIES.has(app.category))
      .sort((left, right) => right.minutes - left.minutes)
      .slice(0, 5),
    hourlyBreakdown: payload.hourlyBreakdown || [],
    peakDistractionHour: (payload.hourlyBreakdown || []).reduce(
      (bestHour, current) => (current.minutes > bestHour.minutes ? current : bestHour),
      { hour: null, minutes: -1 },
    ).hour,
    sourceCompleteness: payload.sourceCompleteness || 'partial',
    updatedAt: new Date().toISOString(),
  };

  const state = getUserState(userId);
  state.usageDaily[payload.dateKey] = usageDoc;

  return {
    usageDaily: usageDoc,
    weekKey: getWeekKey(payload.dateKey),
  };
}

function getDailyUsage(userId, dateKey) {
  const usage = getUserState(userId).usageDaily[dateKey];

  if (!usage) {
    throw new AppError(404, 'USAGE_NOT_FOUND', `No usage summary exists for ${dateKey}.`);
  }

  return usage;
}

module.exports = { saveDailyUsage, getDailyUsage };
