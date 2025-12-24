import React, { useEffect } from 'react';
import { LogBox, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { AppNavigator } from './app/navigators/app-navigator';
import { AuthProvider } from './lib/auth-context';
import { FavoritesProvider } from './lib/favorites-context';
import { GPSTrackingProvider } from './lib/providers/GPSTrackingProvider';



LogBox.ignoreAllLogs(false);


if (__DEV__) {
  console.log(' App starting in development mode');
}


const App = () => {

  console.log('🚀 App component rendered');

  useEffect(() => {
    console.log('🎯 App useEffect triggered');

    const checkForUpdates = async () => {
      try {
        if (!__DEV__) {
          console.log('Checking for updates...');
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            console.log('Update available, downloading...');
            await Updates.fetchUpdateAsync();
            console.log('Update downloaded, reloading...');
            await Updates.reloadAsync();
          } else {
            console.log('No updates available');

            const manifest = Updates.manifest;
            console.log('Current update ID:', Updates.updateId);
            console.log('Current runtime version:', Updates.runtimeVersion);
          }
        }
      } catch (error) {
        console.error('Update check failed:', error);
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
