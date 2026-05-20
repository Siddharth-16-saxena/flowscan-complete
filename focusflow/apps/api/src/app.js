const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { env } = require('./core/config/env');
const { attachUserContext } = require('./core/middleware/attach-user-context');
const { errorHandler } = require('./core/middleware/error-handler');
const { notFoundHandler } = require('./core/middleware/not-found');
const { router: healthRouter } = require('./modules/health/health.routes');
const { router: settingsRouter } = require('./modules/settings/settings.routes');
const { router: permissionsRouter } = require('./modules/permissions/permissions.routes');
const { router: usageRouter } = require('./modules/usage/usage.routes');
const { router: focusSessionRouter } = require('./modules/focus-sessions/focus-session.routes');
const { router: analyticsRouter } = require('./modules/analytics/analytics.routes');
const { router: insightsRouter } = require('./modules/insights/insights.routes');
const { router: nudgesRouter } = require('./modules/nudges/nudges.routes');
const { router: toolingRouter } = require('./modules/tooling/tooling.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(attachUserContext);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/permissions', permissionsRouter);
app.use('/api/v1/usage', usageRouter);
app.use('/api/v1/focus-sessions', focusSessionRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/insights', insightsRouter);
app.use('/api/v1/nudges', nudgesRouter);
app.use('/api/v1/tooling', toolingRouter);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
