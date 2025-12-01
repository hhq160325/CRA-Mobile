import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
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
