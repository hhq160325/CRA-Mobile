import React from 'react';
import {AppNavigator} from './app/navigators/app-navigator';
import {AuthProvider} from './lib/auth-context';

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
