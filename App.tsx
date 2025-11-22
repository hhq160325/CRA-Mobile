import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { AppNavigator } from './app/navigators/app-navigator';
import { AuthProvider } from './lib/auth-context';
import { LanguageProvider } from './lib/language-context';

// Disable all LogBox warnings and errors on the device
LogBox.ignoreAllLogs(true);

// Optionally, disable console errors and warnings in production
if (!__DEV__) {
  console.error = () => { };
  console.warn = () => { };
}

const App = () => {
  useEffect(() => {
    // Disable yellow box warnings
    console.disableYellowBox = true;
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
