import React from 'react';
import { AppNavigator } from './app/navigators/app-navigator';
import { AuthProvider } from './lib/auth-context';
import { LanguageProvider } from './lib/language-context';

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
