import React, { useEffect } from 'react';
import { LogBox, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { AppNavigator } from './app/navigators/app-navigator';
import { AuthProvider } from './lib/auth-context';
import { LanguageProvider } from './lib/language-context';
import { FavoritesProvider } from './lib/favorites-context';


LogBox.ignoreAllLogs(true);


if (!__DEV__) {
  console.error = () => { };
  console.warn = () => { };
}

const App = () => {
  useEffect(() => {
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
            // Show current update info for debugging
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
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AppNavigator />
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
