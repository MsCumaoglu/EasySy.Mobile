import React, {useEffect} from 'react';
import {I18nManager} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAtomValue, useSetAtom} from 'jotai';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import JotaiProvider from './providers/RecoilProvider';
import ThemeProvider from './providers/ThemeProvider';
import QueryProvider from './providers/QueryProvider';
import RootNavigator from './navigation/RootNavigator';
import {appLanguageAtom} from '../state/appAtoms';
import {userAtom, isGuestAtom} from '../core/auth/authAtoms';
import i18n from '../localization/i18n';
import '../localization/i18n';
import {initDB} from '../core/database/db';

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
  const setUser = useSetAtom(userAtom);
  const setGuest = useSetAtom(isGuestAtom);

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

  /**
   * Firebase Auth State Listener
   * - Restores session on app cold-start (Firebase persists sessions automatically)
   * - Clears user state when token expires or user signs out from another device
   * - Prevents stale MMKV user data from keeping the user "logged in" after sign-out
   */
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (firebaseUser: FirebaseAuthTypes.User | null) => {
        if (firebaseUser) {
          // Firebase has a valid session — sync to Jotai
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoUrl: firebaseUser.photoURL || undefined,
          });
        } else {
          // Firebase session ended — clear user (but don't touch guest mode)
          setUser(null);
        }
      },
    );

    return unsubscribe;
  }, [setUser, setGuest]);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  // Initialise SQLite database once on app startup.
  // initDB() is idempotent — safe to call multiple times.
  useEffect(() => {
    initDB().catch(err =>
      console.error('[App] SQLite init failed:', err),
    );
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <JotaiProvider>
          <AppContent />
        </JotaiProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
};

export default App;
