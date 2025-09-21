module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Note: nativewind/babel and react-native-reanimated/plugin will be added when dependencies are installed
    ],
  };
};