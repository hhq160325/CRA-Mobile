module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@app': './app',
          '@assets': './app/assets',
          '@components': './app/components',
          '@screens': './app/screens',
          '@navigators': './app/navigators',
          '@theme': './app/theme',
          '@utils': './app/utils',
          '@hooks': './app/hooks',
          '@services': './app/services',
          '@store': './app/store',
          '@config': './app/config',
          '@lib': './app/lib',
          '@features': './app/features',
        },
      },
    ],
  ],
};
