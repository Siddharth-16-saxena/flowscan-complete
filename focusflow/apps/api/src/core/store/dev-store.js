const store = {
  users: new Map(),
};

function buildDefaultState(userId) {
  return {
    userId,
    profile: {
      displayName: 'Demo User',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      focusGoalMinutesPerDay: 120,
    },
    settings: {
      defaultFocusDurationMinutes: 25,
      defaultBreakDurationMinutes: 5,
      autoStartBreak: false,
      autoStartNextFocus: false,
      nudgeSensitivity: 'medium',
      lateNightThresholdHour: 23,
      weeklyReportEnabled: true,
      blockedAppsDuringFocus: [],
      allowedNotificationWindows: ['08:00-21:30'],
      updatedAt: new Date().toISOString(),
    },
    permissions: {
      usageAccessGranted: false,
      notificationPermissionGranted: false,
      exactAlarmPermissionGranted: false,
      batteryOptimizationIgnored: false,
      platform: 'android',
      platformVersion: 'unknown',
      lastCheckedAt: null,
    },
    focusSessions: [],
    usageDaily: {},
    insights: [],
    nudges: [],
  };
}

function getUserState(userId) {
  if (!store.users.has(userId)) {
    store.users.set(userId, buildDefaultState(userId));
  }

  return store.users.get(userId);
}

module.exports = { getUserState };
