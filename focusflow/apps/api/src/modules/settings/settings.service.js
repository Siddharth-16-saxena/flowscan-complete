const { getUserState } = require('../../core/store/dev-store');

function getSettings(userId) {
  return getUserState(userId).settings;
}

function updateSettings(userId, patch) {
  const state = getUserState(userId);

  state.settings = {
    ...state.settings,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  return state.settings;
}

module.exports = { getSettings, updateSettings };
