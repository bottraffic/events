const path = require('path');
// Monorepo fix: ensure expo-router knows the app root during bundling so
// babel-preset-expo inlines process.env.EXPO_ROUTER_APP_ROOT instead of leaving
// it as an unresolved expression (which breaks require.context).
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, 'app');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
