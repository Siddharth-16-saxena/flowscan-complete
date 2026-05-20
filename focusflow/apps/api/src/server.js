require('dotenv').config();

const app = require('./app');
const { env } = require('./core/config/env');

app.listen(env.port, () => {
  console.log(`FocusFlow API listening on port ${env.port}`);
});
