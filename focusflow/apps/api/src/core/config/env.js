const env = {
  port: Number(process.env.PORT || 5050),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultUserId: process.env.DEFAULT_USER_ID || 'demo-user',
};

module.exports = { env };
