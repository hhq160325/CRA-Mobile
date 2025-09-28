module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-vector-icons
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
        },
      ],
    ],
  };
};
