import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView as RNSafeAreaView,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {appThemeAtom, appLanguageAtom, appCurrencyAtom, AppLanguage, AppCurrency} from '../../../state/appAtoms';
import {userAtom, isGuestAtom} from '../../../core/auth/authAtoms';
import {authService} from '../../../core/auth/authService';
import {useRTL} from '../../../core/hooks/useRTL';
import i18n from '../../../localization/i18n';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

type Language = {code: AppLanguage; label: string; nativeLabel: string; isRTL: boolean; flag: string};
type ThemeOption = {code: 'light' | 'dark' | 'system'; labelKey: string; icon: string};
type CurrencyOption = {code: AppCurrency; label: string; symbol: string};

const LANGUAGES: Language[] = [
  {code: 'en', label: 'English',  nativeLabel: 'English',  isRTL: false, flag: '🇬🇧'},
  {code: 'tr', label: 'Turkish',  nativeLabel: 'Türkçe',   isRTL: false, flag: '🇹🇷'},
  {code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  isRTL: true, flag: '🇸🇦'},
];

const THEMES: ThemeOption[] = [
  {code: 'light',  labelKey: 'settings.light',  icon: 'sunny-outline'},
  {code: 'dark',   labelKey: 'settings.dark',   icon: 'moon-outline'},
  {code: 'system', labelKey: 'settings.system', icon: 'phone-portrait-outline'},
];

const CURRENCIES: CurrencyOption[] = [
  {code: 'USD', label: 'US Dollar', symbol: '$'},
  {code: 'EUR', label: 'Euro', symbol: '€'},
  {code: 'TRY', label: 'Turkish Lira', symbol: '₺'},
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [theme, setTheme] = useAtom(appThemeAtom);
  const [language, setLanguage] = useAtom(appLanguageAtom);
  const [currency, setCurrency] = useAtom(appCurrencyAtom);
  
  // Auth state
  const [user, setUser] = useAtom(userAtom);
  const [, setGuest] = useAtom(isGuestAtom);
  const {isRTL, flipIcon} = useRTL();

  const [activeModal, setActiveModal] = useState<'language' | 'theme' | 'currency' | null>(null);

  const handleLanguageChange = async (lang: AppLanguage) => {
    if (lang === language) return;
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    setActiveModal(null);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setGuest(true);
    } catch (e) {
      console.log('Error logging out', e);
    }
  };

  const handleLoginNav = () => {
    // When a guest clicks Login, just turn guest mode off 
    // to route them back to LoginScreen
    setGuest(false);
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    scrollContent: {paddingBottom: spacing.xxl, paddingTop: spacing.sm},
    sectionCard: {
      marginHorizontal: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    optionRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionIconWrap: {
      width: 40, height: 40, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
      marginRight: isRTL ? 0 : spacing.md,
      marginLeft: isRTL ? spacing.md : 0,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      ...typography.body, color: colors.textPrimary,
      fontWeight: '600', fontSize: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    optionSubtext: {
      ...typography.caption, color: colors.textSecondary,
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionValue: {
      ...typography.body, color: colors.textSecondary, fontSize: 14,
      fontWeight: '500',
    },
    chevron: {
      fontSize: 20, color: colors.textSecondary,
      marginLeft: isRTL ? 0 : spacing.sm,
      marginRight: isRTL ? spacing.sm : 0,
    },
    versionRow: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    versionText: {
      ...typography.caption, color: colors.textSecondary,
    },
    googleProfileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
      backgroundColor: colors.card,
      padding: spacing.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    googleProfileAvatar: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: '#E8F4FD',
      alignItems: 'center', justifyContent: 'center',
      marginRight: isRTL ? 0 : spacing.lg,
      marginLeft: isRTL ? spacing.lg : 0,
    },
    googleProfileTextWrap: {
      flex: 1,
    },
    googleProfileName: {
      ...typography.title,
      fontSize: 18,
      color: colors.textPrimary,
    },
    googleProfileEmail: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: 2,
    },
    logoutBtn: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.md,
      backgroundColor: '#FFEBEE',
      paddingVertical: spacing.lg,
      borderRadius: radius.xl,
      alignItems: 'center',
    },
    logoutBtnText: {
      ...typography.body,
      color: '#E53935',
      fontWeight: '700',
      fontSize: 16,
    },

    // Modal Styles
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
      maxHeight: '80%',
    },
    handle: {
      width: 48,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: spacing.lg,
      marginTop: spacing.xs,
    },
    modalHeader: {
      alignItems: 'center',
      paddingBottom: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    modalTitle: {
      ...typography.title,
      fontSize: 20,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    optionsContainer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    modalOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalOptionLabel: {
      ...typography.body,
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
      textAlign: isRTL ? 'right' : 'left',
    },
    radioCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: isRTL ? 0 : spacing.md,
      marginRight: isRTL ? spacing.md : 0,
    },
    radioCircleSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
  });

  const currentLanguageLabel = LANGUAGES.find(l => l.code === language)?.nativeLabel || '';
  const currentThemeLabel = THEMES.find(t => t.code === theme)?.labelKey || '';
  const currentCurrencyLabel = CURRENCIES.find(c => c.code === currency)?.code || '';

  const renderModalOption = (
    label: string, 
    isSelected: boolean, 
    onPress: () => void, 
    icon?: string,
    subtext?: string,
    iconText?: string
  ) => (
    <TouchableOpacity style={styles.modalOptionRow} onPress={onPress} activeOpacity={0.7}>
      {icon && !iconText && (
        <Icon name={icon} style={{fontSize: 22, color: isSelected ? colors.primary : colors.textSecondary, marginRight: isRTL ? 0 : spacing.md, marginLeft: isRTL ? spacing.md : 0, width: 28, textAlign: 'center'}} />
      )}
      {iconText && (
        <View style={{marginRight: isRTL ? 0 : spacing.md, marginLeft: isRTL ? spacing.md : 0, width: 28, alignItems: 'center'}}>
          <Text style={{fontSize: 22, color: colors.textPrimary}}>{iconText}</Text>
        </View>
      )}
      <View style={{flex: 1}}>
        <Text style={[styles.modalOptionLabel, isSelected && {color: colors.primary, fontWeight: '700'}]}>{label}</Text>
        {subtext && <Text style={{...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: isRTL ? 'right' : 'left'}}>{subtext}</Text>}
      </View>
      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />

      <ScreenHeader 
        title={t('settings.title')} 
        containerStyle={{paddingBottom: spacing.md}} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Google Profile summary ── */}
        {user ? (
          <View style={styles.googleProfileCard}>
            <View style={styles.googleProfileAvatar}>
              <Image 
                source={{uri: user.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}} 
                style={{width: 56, height: 56, borderRadius: 28}} 
              />
            </View>
            <View style={styles.googleProfileTextWrap}>
              <Text style={styles.googleProfileName}>{user.name}</Text>
              <Text style={styles.googleProfileEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.googleProfileCard} onPress={handleLoginNav} activeOpacity={0.8}>
            <View style={styles.googleProfileAvatar}>
              <Icon name="person-circle-outline" style={{fontSize: 32, color: colors.primary}} />
            </View>
            <View style={styles.googleProfileTextWrap}>
              <Text style={styles.googleProfileName}>Guest User</Text>
              <Text style={styles.googleProfileEmail}>Tap to Log In or Register</Text>
            </View>
          </TouchableOpacity>
        )}
        {/* ── Account Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.account', {defaultValue: 'Account'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} onPress={() => navigation.navigate('ProfileEdit')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E3F2FD'}]}>
              <Icon name="person-outline" style={{fontSize: 22, color: '#1976D2'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.editProfile', {defaultValue: 'Edit Profile'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FFF3E0'}]}>
              <Icon name="notifications-outline" style={{fontSize: 22, color: '#F57C00'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.notifications', {defaultValue: 'Notifications'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* ── Preferences Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.preferences', {defaultValue: 'Preferences'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          {/* Language Option */}
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} onPress={() => setActiveModal('language')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E8F4FD'}]}>
              <Icon name="language-outline" style={{fontSize: 22, color: '#2196F3'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.language', {defaultValue: 'Language'})}</Text>
              <Text style={styles.optionSubtext}>{currentLanguageLabel}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          {/* Currency Option */}
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} onPress={() => setActiveModal('currency')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E8F5E9'}]}>
              <Icon name="cash-outline" style={{fontSize: 22, color: '#4CAF50'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.currency', {defaultValue: 'Currency'})}</Text>
              <Text style={styles.optionSubtext}>{currentCurrencyLabel}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          {/* Theme Option */}
          <TouchableOpacity style={styles.optionRow} onPress={() => setActiveModal('theme')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FFF3E0'}]}>
              <Icon name="color-palette-outline" style={{fontSize: 22, color: '#FF9800'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.theme', {defaultValue: 'Theme'})}</Text>
              <Text style={styles.optionSubtext}>{t(currentThemeLabel, {defaultValue: theme})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* ── Security Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.security', {defaultValue: 'Security'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E0F2F1'}]}>
              <Icon name="finger-print-outline" style={{fontSize: 22, color: '#00796B'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.biometrics', {defaultValue: 'Face ID / Touch ID'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FFEBEE'}]}>
              <Icon name="lock-closed-outline" style={{fontSize: 22, color: '#E53935'}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.changePassword', {defaultValue: 'Change Password'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* ── About Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.about', {defaultValue: 'About'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: colors.surface}]}>
              <Icon name="document-text-outline" style={{fontSize: 22, color: colors.textSecondary}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.terms', {defaultValue: 'Terms of Service'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: colors.surface}]}>
              <Icon name="shield-checkmark-outline" style={{fontSize: 22, color: colors.textSecondary}} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>{t('settings.privacy', {defaultValue: 'Privacy Policy'})}</Text>
            </View>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          {/* App Version Option */}
          <View style={styles.optionRow}>
            <View style={[styles.optionIconWrap, {backgroundColor: colors.surface}]}>
              <Icon name="information-circle-outline" style={{fontSize: 22, color: colors.textSecondary}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.appVersion', {defaultValue: 'App Version'})}</Text>
            <Text style={styles.optionValue}>{t('settings.version', {defaultValue: '1.0.0'})}</Text>
          </View>
        </View>

        {/* ── Logout Button ── */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>{t('settings.logout', {defaultValue: 'Log Out'})}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>EasySy v{t('settings.version', {defaultValue: '1.0.0'})}</Text>
        </View>

      </ScrollView>

      {/* Reusable Bottom Sheet Modal */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}>
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                 <RNSafeAreaView>
                  <View style={styles.handle} />
                  
                  {activeModal === 'language' && (
                    <>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('settings.language', {defaultValue: 'Language'})}</Text>
                      </View>
                      <View style={styles.optionsContainer}>
                        {LANGUAGES.map(lang => renderModalOption(lang.nativeLabel, language === lang.code, () => handleLanguageChange(lang.code), undefined, lang.label, lang.flag))}
                      </View>
                    </>
                  )}

                  {activeModal === 'currency' && (
                    <>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('settings.currency', {defaultValue: 'Currency'})}</Text>
                      </View>
                      <View style={styles.optionsContainer}>
                        {CURRENCIES.map(curr => renderModalOption(`${curr.code} - ${curr.label}`, currency === curr.code, () => {
                          setCurrency(curr.code);
                          setActiveModal(null);
                        }, undefined, undefined, curr.symbol))}
                      </View>
                    </>
                  )}

                  {activeModal === 'theme' && (
                    <>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('settings.theme', {defaultValue: 'Theme'})}</Text>
                      </View>
                      <View style={styles.optionsContainer}>
                        {THEMES.map(th => renderModalOption(t(th.labelKey, {defaultValue: th.labelKey}), theme === th.code, () => {
                          setTheme(th.code as any);
                          setActiveModal(null);
                        }, th.icon))}
                      </View>
                    </>
                  )}
                </RNSafeAreaView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
};

export default SettingsScreen;
