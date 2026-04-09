import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import JotaiProvider from './providers/RecoilProvider';
import ThemeProvider from './providers/ThemeProvider';
import RootNavigator from './navigation/RootNavigator';
import '../localization/i18n';

const AppContent: React.FC = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <JotaiProvider>
        <AppContent />
      </JotaiProvider>
    </SafeAreaProvider>
  );
};

export default App;
