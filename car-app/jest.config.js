module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@assets/(.*)$': '<rootDir>/app/assets/$1',
    '^@components/(.*)$': '<rootDir>/app/components/$1',
    '^@screens/(.*)$': '<rootDir>/app/screens/$1',
    '^@navigators/(.*)$': '<rootDir>/app/navigators/$1',
    '^@theme/(.*)$': '<rootDir>/app/theme/$1',
    '^@utils/(.*)$': '<rootDir>/app/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/app/hooks/$1',
    '^@services/(.*)$': '<rootDir>/app/services/$1',
    '^@store/(.*)$': '<rootDir>/app/store/$1',
    '^@config/(.*)$': '<rootDir>/app/config/$1',
    '^@lib/(.*)$': '<rootDir>/app/lib/$1',
    '^@features/(.*)$': '<rootDir>/app/features/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
