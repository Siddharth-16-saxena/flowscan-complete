const { env } = require('../config/env');

function attachUserContext(req, _res, next) {
  req.user = {
    id: req.header('x-user-id') || env.defaultUserId,
  };

  next();
}

module.exports = { attachUserContext };
