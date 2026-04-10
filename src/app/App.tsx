import React, {useEffect} from 'react';
import {I18nManager} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAtomValue} from 'jotai';
import JotaiProvider from './providers/RecoilProvider';
import ThemeProvider from './providers/ThemeProvider';
import RootNavigator from './navigation/RootNavigator';
import {appLanguageAtom} from '../state/appAtoms';
import i18n from '../localization/i18n';
import '../localization/i18n';

/**
 * Inner component that can access Jotai atoms.
 *
 * RTL strategy:
 *  - I18nManager.forceRTL() is called on every language change.
 *  - This corrects any stale RTL state persisted from a previous session.
 *  - Our manual `flexDirection: isRTL ? 'row-reverse' : 'row'` in screens
 *    is NOT used alongside I18nManager RTL (to avoid double-flip).
 *  - Instead, useRTL() reads I18nManager.isRTL **after** forceRTL is called,
 *    which is always in sync with the current language.
 */
const AppContent: React.FC = () => {
  const language = useAtomValue(appLanguageAtom);

  useEffect(() => {
    // 1. Sync i18n
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }

    // 2. Sync RTL — always force correct state based on current language.
    //    This fixes any stale forceRTL(true) that persisted from a prior session.
    const needsRTL = language === 'ar';
    I18nManager.forceRTL(needsRTL);
  }, [language]);

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
