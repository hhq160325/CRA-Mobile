import React, { useEffect } from 'react';
import { LogBox, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { AppNavigator } from './app/navigators/app-navigator';
import { AuthProvider } from './lib/auth-context';
import { FavoritesProvider } from './lib/favorites-context';
import { GPSTrackingProvider } from './lib/providers/GPSTrackingProvider';
import './lib/utils/logger';


LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs([
  'HTTP error',
  'Network request failed',
  'Request failed',
  'API Error',
  'Connection timeout',
  'Server error',
  'Authentication required',
  'Invalid request data',
  'The requested resource was not found'
]);

if (__DEV__) {
  console.log(' App starting in development mode');
}


const App = () => {
  if (__DEV__) {
    console.log(' App component rendered');
  }

  useEffect(() => {
    if (__DEV__) {
      console.log(' App useEffect triggered');
    }

    const checkForUpdates = async () => {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (error) {

        if (__DEV__) {
          console.error('Update check failed:', error);
        }
      }
    };

    checkForUpdates();
  }, []);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <GPSTrackingProvider>
          <AppNavigator />
        </GPSTrackingProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
