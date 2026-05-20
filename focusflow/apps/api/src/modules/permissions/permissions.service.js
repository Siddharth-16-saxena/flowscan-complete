const { getUserState } = require('../../core/store/dev-store');

function getPermissions(userId) {
  return getUserState(userId).permissions;
}

function updatePermissions(userId, payload) {
  const state = getUserState(userId);

  state.permissions = {
    ...state.permissions,
    ...payload,
    lastCheckedAt: new Date().toISOString(),
  };

  return state.permissions;
}

module.exports = { getPermissions, updatePermissions };
