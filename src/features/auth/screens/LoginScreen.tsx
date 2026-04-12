import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAtom} from 'jotai';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {isGuestAtom, userAtom} from '../../../core/auth/authAtoms';
import {authService} from '../../../core/auth/authService';

// For now we use the illustration as the logo
const logoImage = require('../../../assets/images/home/logo.png');

const LoginScreen: React.FC = () => {
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const {t} = useTranslation();
  
  const [, setGuest] = useAtom(isGuestAtom);
  const [, setUser] = useAtom(userAtom);

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await authService.signInWithGoogle();
      
      const firebaseUser = userCredential.user;
      
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email || '',
        photoUrl: firebaseUser.photoURL || undefined,
      });
      // Ensure guest mode is off if logged in
      setGuest(false);
    } catch (e) {
      console.log('Google Sign-In flow failed', e);
    }
  };

  const handleContinueAsGuest = () => {
    setGuest(true);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 200,
      height: 100,
      resizeMode: 'contain',
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surface : '#FFFFFF',
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    googleIcon: {
      fontSize: 24,
      color: '#DB4437', // Google Red
    },
    googleBtnText: {
      ...typography.subtitle,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    guestBtn: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    guestBtnText: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '500',
      textDecorationLine: 'underline',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.container}>
        
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} />
          <Text style={styles.subtitle}>Explore the world with ease.</Text>
        </View>

        <TouchableOpacity 
          style={styles.googleBtn} 
          activeOpacity={0.7}
          onPress={handleGoogleLogin}
        >
          <Icon name="logo-google" style={styles.googleIcon} />
          <Text style={styles.googleBtnText}>{t('auth.continueWithGoogle', {defaultValue: 'Continue with Google'})}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestBtn} 
          activeOpacity={0.7}
          onPress={handleContinueAsGuest}
        >
          <Text style={styles.guestBtnText}>{t('auth.continueAsGuest', {defaultValue: 'Continue as Guest'})}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
