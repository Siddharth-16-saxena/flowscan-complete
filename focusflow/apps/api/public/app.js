const dateKey = new Date().toISOString().slice(0, 10);
let latestUsageDaily = null;

async function api(path, options = {}) {
  const response = await fetch(`/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || 'Request failed');
  }

  return response.json();
}

function showToast(message) {
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2200);
}

function wireNavigation() {
  const navButtons = Array.from(document.querySelectorAll('.nav-link'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      navButtons.forEach((item) => item.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`panel-${button.dataset.panel}`).classList.add('active');
    });
  });
}

function renderDashboard(payload) {
  const focusScorePercent = Math.round(payload.today.focusScore * 100);
  const consistencyPercent = Math.round(payload.currentWeek.consistencyScore * 100);
  const totalTracked = payload.today.focusMinutes + payload.today.distractionMinutes;
  const progressPercent = totalTracked === 0 ? 0 : Math.round((payload.today.focusMinutes / totalTracked) * 100);

  document.getElementById('metric-focus').textContent = `${payload.today.focusMinutes} min`;
  document.getElementById('metric-distraction').textContent = `${payload.today.distractionMinutes} min`;
  document.getElementById('metric-sessions').textContent = `${payload.today.sessionCount}`;
  document.getElementById('weekly-focus').textContent = `${payload.currentWeek.focusMinutes} min`;
  document.getElementById('weekly-distraction').textContent = `${payload.currentWeek.distractionMinutes} min`;
  document.getElementById('weekly-completion').textContent = `${Math.round(payload.currentWeek.completedSessionRate * 100)}%`;
  document.getElementById('focus-score-pill').textContent = `Focus Score ${focusScorePercent}%`;
  document.getElementById('consistency-pill').textContent = `Consistency ${consistencyPercent}%`;
  document.getElementById('focus-progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('focus-progress-copy').textContent =
    totalTracked === 0
      ? 'No focus signal yet.'
      : `${progressPercent}% of today’s tracked time has been protected for focus.`;
}

function renderStatList(target, entries) {
  target.innerHTML = '';
  entries.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'stat-item';
    row.innerHTML = `<strong>${label}</strong><small>${value}</small>`;
    target.appendChild(row);
  });
}

function renderTimeline(target, items, formatter, emptyText) {
  target.innerHTML = '';

  if (!items.length) {
    target.classList.add('empty');
    target.textContent = emptyText;
    return;
  }

  target.classList.remove('empty');
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = formatter(item);
    target.appendChild(row);
  });
}

function renderTooling(tooling) {
  const target = document.getElementById('tooling-list');
  const stackStrip = document.getElementById('stack-strip');
  target.innerHTML = '';
  stackStrip.innerHTML = '';

  tooling.forEach((item) => {
    const block = document.createElement('div');
    block.className = `tooling-item ${item.available ? 'ready' : 'missing'}`;
    block.innerHTML = `
      <strong>${item.name}</strong>
      <small>${item.available ? item.detail : `Missing: ${item.detail}`}</small>
    `;
    target.appendChild(block);

    const chip = document.createElement('div');
    chip.className = `stack-chip ${item.available ? 'ready' : 'missing'}`;
    chip.innerHTML = `
      <strong>${item.name}</strong>
      <small>${item.available ? item.role : 'Needs setup before this layer can run.'}</small>
    `;
    stackStrip.appendChild(chip);
  });
}

function renderPermissionHealth(permissions) {
  const states = [
    ['Usage access', permissions.usageAccessGranted],
    ['Notifications', permissions.notificationPermissionGranted],
    ['Battery relaxed', permissions.batteryOptimizationIgnored],
  ];

  const target = document.getElementById('permission-health');
  target.innerHTML = '';

  states.forEach(([label, enabled]) => {
    const block = document.createElement('div');
    block.className = 'signal-card';
    block.innerHTML = `
      <strong>${label}</strong>
      <small>${enabled ? 'Ready' : 'Needs attention'}</small>
    `;
    target.appendChild(block);
  });
}

function renderHeatmap(usageDaily) {
  const target = document.getElementById('hourly-heatmap');
  target.innerHTML = '';

  const breakdown = (usageDaily?.hourlyBreakdown || []).slice(0, 12);

  if (!breakdown.length) {
    document.getElementById('heatmap-caption').textContent = 'No usage summary yet.';
    return;
  }

  breakdown.forEach((entry) => {
    const level = entry.minutes >= 40 ? 'high' : entry.minutes >= 20 ? 'mid' : 'low';
    const block = document.createElement('div');
    block.className = `heat-block ${level}`;
    block.innerHTML = `<strong>${String(entry.hour).padStart(2, '0')}:00</strong><span>${entry.minutes} min</span>`;
    target.appendChild(block);
  });

  const peakHour = usageDaily?.peakDistractionHour;
  document.getElementById('heatmap-caption').textContent =
    peakHour === null || peakHour === undefined
      ? 'No peak distraction hour available yet.'
      : `Peak distraction hour today is ${String(peakHour).padStart(2, '0')}:00.`;
}

function renderTrendSummary(daily, weekly, insights) {
  const message = [
    `Today shows ${daily.focusMinutes} minutes of protected focus against ${daily.distractionMinutes} minutes of distraction.`,
    `Weekly completion is ${Math.round(weekly.completedSessionRate * 100)}% with a consistency score of ${Math.round(weekly.consistencyScore * 100)}%.`,
    insights[0]?.recommendation || 'Generate more usage and session data to sharpen the guidance.',
  ].join(' ');

  document.getElementById('trend-summary').textContent = message;
}

function renderTimerPreview() {
  const form = document.getElementById('session-form');
  const plannedDuration = Number(form.plannedDurationMinutes.value || 25);
  const actualDuration = Number(form.actualDurationMinutes.value || 0);
  const completed = form.completed.checked;
  const ratio = plannedDuration === 0 ? 0 : Math.min(actualDuration / plannedDuration, 1);
  const degrees = Math.round(ratio * 360);

  document.getElementById('timer-display').textContent = `${String(plannedDuration).padStart(2, '0')}:00`;
  document.getElementById('timer-caption').textContent = completed
    ? 'Preview of a completed focus block'
    : 'Preview of an interrupted focus block';
  document.getElementById('session-state-pill').textContent = completed ? 'Completed' : 'Interrupted';
  document.getElementById('timer-ring').style.background =
    `conic-gradient(var(--accent) ${degrees}deg, rgba(28, 124, 84, 0.14) ${degrees}deg)`;
}

async function refreshAll() {
  const requests = await Promise.all([
    api(`/analytics/dashboard?dateKey=${dateKey}`),
    api(`/analytics/daily/${dateKey}`),
    api(`/analytics/weekly/${dateKey}`),
    api('/insights'),
    api('/nudges'),
    api('/focus-sessions'),
    api('/settings'),
    api('/permissions'),
    api('/tooling'),
    api(`/usage/daily/${dateKey}`).catch(() => ({ usageDaily: null })),
  ]);

  const [dashboard, dailyAnalytics, weeklyAnalytics, insights, nudges, sessions, settings, permissions, tooling, usageDailyResponse] = requests;

  latestUsageDaily = usageDailyResponse.usageDaily;

  renderDashboard(dashboard);
  renderTooling(tooling.tooling);
  renderPermissionHealth(permissions.permissions);
  renderHeatmap(latestUsageDaily);
  renderTrendSummary(dailyAnalytics.analyticsDaily, weeklyAnalytics.analyticsWeekly, insights.insights);

  renderStatList(document.getElementById('daily-analytics'), [
    ['Focus minutes', `${dailyAnalytics.analyticsDaily.focusMinutes}`],
    ['Distraction minutes', `${dailyAnalytics.analyticsDaily.distractionMinutes}`],
    ['Interruption count', `${dailyAnalytics.analyticsDaily.interruptionCount}`],
    ['Data quality', dailyAnalytics.analyticsDaily.dataQuality],
  ]);

  renderStatList(document.getElementById('weekly-analytics'), [
    ['Focus score', `${Math.round(weeklyAnalytics.analyticsWeekly.focusScore * 100)}%`],
    ['Session count', `${weeklyAnalytics.analyticsWeekly.sessionCount}`],
    ['Completion rate', `${Math.round(weeklyAnalytics.analyticsWeekly.completedSessionRate * 100)}%`],
    ['Trend direction', weeklyAnalytics.analyticsWeekly.trendDirection],
  ]);

  renderTimeline(
    document.getElementById('insights-list'),
    insights.insights,
    (item) => `<strong>${item.title}</strong><small>${item.summary}</small><small>${item.recommendation}</small>`,
    'No insights yet.',
  );

  renderTimeline(
    document.getElementById('nudges-list'),
    nudges.nudges,
    (item) => `<strong>${item.title}</strong><small>${item.message}</small>`,
    'No nudges yet.',
  );

  renderTimeline(
    document.getElementById('session-list'),
    sessions.sessions,
    (item) => `<strong>${item.actualDurationMinutes} minute session</strong><small>${item.completed ? 'Completed' : 'Interrupted'} with ${item.interruptionCount} interruptions</small>`,
    'No sessions yet.',
  );

  document.getElementById('primary-insight-copy').textContent =
    insights.insights[0]?.summary || 'Load realistic sample day to generate your first insight.';

  const settingsForm = document.getElementById('settings-form');
  settingsForm.defaultFocusDurationMinutes.value = settings.settings.defaultFocusDurationMinutes;
  settingsForm.defaultBreakDurationMinutes.value = settings.settings.defaultBreakDurationMinutes;
  settingsForm.lateNightThresholdHour.value = settings.settings.lateNightThresholdHour;
  settingsForm.nudgeSensitivity.value = settings.settings.nudgeSensitivity;

  const permissionsForm = document.getElementById('permissions-form');
  permissionsForm.usageAccessGranted.checked = permissions.permissions.usageAccessGranted;
  permissionsForm.notificationPermissionGranted.checked = permissions.permissions.notificationPermissionGranted;
  permissionsForm.batteryOptimizationIgnored.checked = permissions.permissions.batteryOptimizationIgnored;

  renderStatList(document.getElementById('permissions-summary'), [
    ['Platform', `${permissions.permissions.platform} ${permissions.permissions.platformVersion}`],
    ['Last checked', permissions.permissions.lastCheckedAt || 'Never'],
  ]);

  renderTimerPreview();
}

async function seedDemoData() {
  await api('/permissions', {
    method: 'PUT',
    body: JSON.stringify({
      usageAccessGranted: true,
      notificationPermissionGranted: true,
      batteryOptimizationIgnored: true,
      platform: 'android',
      platformVersion: '14',
    }),
  });

  await api('/usage/daily', {
    method: 'POST',
    body: JSON.stringify({
      dateKey,
      timezone: 'Asia/Kolkata',
      totalUsageMinutes: 314,
      sourceCompleteness: 'complete',
      apps: [
        { appId: 'com.instagram.android', appName: 'Instagram', minutes: 64, category: 'social' },
        { appId: 'com.youtube.android', appName: 'YouTube', minutes: 51, category: 'video' },
        { appId: 'com.notion.mobile', appName: 'Notion', minutes: 72, category: 'work' },
        { appId: 'com.whatsapp', appName: 'WhatsApp', minutes: 29, category: 'messaging' },
      ],
      hourlyBreakdown: [
        { hour: 8, minutes: 10 },
        { hour: 9, minutes: 18 },
        { hour: 10, minutes: 14 },
        { hour: 11, minutes: 9 },
        { hour: 18, minutes: 12 },
        { hour: 20, minutes: 17 },
        { hour: 21, minutes: 26 },
        { hour: 22, minutes: 37 },
        { hour: 23, minutes: 44 },
      ],
    }),
  });

  await api('/focus-sessions', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: `session-${Date.now()}`,
      plannedDurationMinutes: 25,
      actualDurationMinutes: 22,
      interruptionCount: 1,
      interruptionReasons: ['notification'],
      completed: false,
      startedAt: `${dateKey}T09:00:00.000Z`,
      endedAt: `${dateKey}T09:22:00.000Z`,
    }),
  });

  await api('/focus-sessions', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: `session-${Date.now() + 1}`,
      plannedDurationMinutes: 25,
      actualDurationMinutes: 25,
      interruptionCount: 0,
      interruptionReasons: [],
      completed: true,
      startedAt: `${dateKey}T11:00:00.000Z`,
      endedAt: `${dateKey}T11:25:00.000Z`,
    }),
  });

  await api('/focus-sessions', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: `session-${Date.now() + 2}`,
      plannedDurationMinutes: 45,
      actualDurationMinutes: 38,
      interruptionCount: 1,
      interruptionReasons: ['app_switch'],
      completed: false,
      startedAt: `${dateKey}T15:00:00.000Z`,
      endedAt: `${dateKey}T15:38:00.000Z`,
    }),
  });

  await api('/insights/refresh', {
    method: 'POST',
    body: JSON.stringify({ dateKey }),
  });

  showToast('Sample day loaded');
  await refreshAll();
}

function handleSessionForm() {
  const form = document.getElementById('session-form');
  ['plannedDurationMinutes', 'actualDurationMinutes', 'completed'].forEach((fieldName) => {
    form[fieldName].addEventListener('input', renderTimerPreview);
    form[fieldName].addEventListener('change', renderTimerPreview);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const actualDurationMinutes = Number(formData.get('actualDurationMinutes'));

    await api('/focus-sessions', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: `session-${Date.now()}`,
        plannedDurationMinutes: Number(formData.get('plannedDurationMinutes')),
        actualDurationMinutes,
        interruptionCount: Number(formData.get('interruptionCount')),
        interruptionReasons: Number(formData.get('interruptionCount')) > 0 ? ['manual_stop'] : [],
        completed: formData.get('completed') === 'on',
        startedAt: `${dateKey}T14:00:00.000Z`,
        endedAt: `${dateKey}T14:${String(Math.min(actualDurationMinutes, 59)).padStart(2, '0')}:00.000Z`,
      }),
    });

    showToast('Session saved');
    await api('/insights/refresh', {
      method: 'POST',
      body: JSON.stringify({ dateKey }),
    });
    await refreshAll();
  });

  document.getElementById('preview-timer').addEventListener('click', renderTimerPreview);
}

function handleSettingsForm() {
  const form = document.getElementById('settings-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    await api('/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        defaultFocusDurationMinutes: Number(formData.get('defaultFocusDurationMinutes')),
        defaultBreakDurationMinutes: Number(formData.get('defaultBreakDurationMinutes')),
        lateNightThresholdHour: Number(formData.get('lateNightThresholdHour')),
        nudgeSensitivity: formData.get('nudgeSensitivity'),
      }),
    });

    showToast('Preferences updated');
    await refreshAll();
  });
}

function handlePermissionsForm() {
  const form = document.getElementById('permissions-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    await api('/permissions', {
      method: 'PUT',
      body: JSON.stringify({
        usageAccessGranted: formData.get('usageAccessGranted') === 'on',
        notificationPermissionGranted: formData.get('notificationPermissionGranted') === 'on',
        batteryOptimizationIgnored: formData.get('batteryOptimizationIgnored') === 'on',
        platform: 'android',
        platformVersion: '14',
      }),
    });

    showToast('Permissions updated');
    await refreshAll();
  });
}

function wireActions() {
  document.getElementById('seed-demo').addEventListener('click', seedDemoData);
  document.getElementById('evaluate-nudge').addEventListener('click', async () => {
    await api('/nudges/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        localTime: new Date().toISOString(),
        recentDistractionMinutes: 28,
        activeSession: false,
      }),
    });

    showToast('Nudge evaluated');
    await refreshAll();
  });
}

async function bootstrap() {
  wireNavigation();
  handleSessionForm();
  handleSettingsForm();
  handlePermissionsForm();
  wireActions();
  await refreshAll();
}

bootstrap().catch((error) => {
  console.error(error);
  showToast(error.message);
});
