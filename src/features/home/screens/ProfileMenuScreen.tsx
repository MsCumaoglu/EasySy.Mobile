import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView as RNSafeAreaView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import {RootStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {userAtom, isGuestAtom} from '../../../core/auth/authAtoms';
import {appThemeAtom, appLanguageAtom, appCurrencyAtom, AppLanguage, AppCurrency} from '../../../state/appAtoms';
import {authService} from '../../../core/auth/authService';
import {useRTL} from '../../../core/hooks/useRTL';
import {useProfile} from '../hooks/useProfile';
import {useUpdateProfile} from '../hooks/useUpdateProfile';
import i18n from '../../../localization/i18n';
import ScreenHeader from '../../../shared/components/ScreenHeader';

type ProfileMenuNavProp = NativeStackNavigationProp<RootStackParamList>;

type Language = {code: AppLanguage; label: string; nativeLabel: string; isRTL: boolean; flag: string};
type ThemeOption = {code: 'light' | 'dark' | 'system'; labelKey: string; icon: string};

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

type CurrencyOption = {code: AppCurrency; labelKey: string; symbol: string};

const CURRENCIES: CurrencyOption[] = [
  {code: 'USD', labelKey: 'currency.usd', symbol: '$'},
  {code: 'EUR', labelKey: 'currency.eur', symbol: '€'},
  {code: 'TRY', labelKey: 'currency.try', symbol: '₺'},
  {code: 'SYP', labelKey: 'currency.syp', symbol: 'SYP'},
];

const ProfileMenuScreen: React.FC = () => {
  const navigation = useNavigation<ProfileMenuNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  
  // Auth & Profile
  const [user, setUser] = useAtom(userAtom);
  const [, setGuest] = useAtom(isGuestAtom);
  const {data: profile} = useProfile();
  const updateProfile = useUpdateProfile();
  const {isRTL, flipIcon} = useRTL();

  // App Settings
  const [theme, setTheme] = useAtom(appThemeAtom);
  const [language, setLanguage] = useAtom(appLanguageAtom);
  const [currency, setCurrency] = useAtom(appCurrencyAtom);

  const [activeModal, setActiveModal] = useState<'language' | 'theme' | 'currency' | null>(null);

  const handleLanguageChange = async (lang: AppLanguage) => {
    if (lang === language) return;
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    setActiveModal(null);
    if (user) {
      updateProfile.mutate({ preferredLang: lang });
    }
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

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    scrollContent: {paddingBottom: spacing.xxl, paddingTop: spacing.md},
    
    // Profile Card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
      backgroundColor: colors.card,
      padding: spacing.xl,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
      position: 'relative',
    },
    avatar: {
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: '#E8F4FD',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    profileInfo: {
      flex: 1,
      marginLeft: spacing.lg,
    },
    name: {
      ...typography.title,
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    email: {
      ...typography.body,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    roleBadge: {
      backgroundColor: '#E3F2FD', // Light blue background
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
    },
    roleText: {
      ...typography.caption,
      color: '#1976D2', // Darker blue text
      fontWeight: '600',
      fontSize: 11,
    },
    editIconBtn: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      padding: 6,
    },

    // Horizontal Action Cards (Bookings / Favorites)
    actionCardsRow: {
      flexDirection: 'row',
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
      justifyContent: 'space-between',
    },
    actionCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    actionCardSpacer: {
      width: spacing.md,
    },
    actionCardIcon: {
      fontSize: 32,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    actionCardText: {
      ...typography.body,
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    },

    // Sections
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
      paddingTop: spacing.md,
    },
    sectionTitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 14,
    },
    sectionCard: {
      marginHorizontal: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.xl,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    optionRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionIconWrap: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      marginRight: spacing.md,
    },
    optionLabel: {
      flex: 1,
      ...typography.body, color: colors.textPrimary,
      fontWeight: '500', fontSize: 15,
      textAlign: 'left',
    },
    optionValue: {
      ...typography.body, color: colors.textSecondary, fontSize: 13,
      fontWeight: '400',
      marginRight: spacing.xs,
    },
    chevron: {
      fontSize: 18, color: colors.textPrimary,
      fontWeight: '800',
    },
    
    // Logout Button
    logoutBtn: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.md,
      backgroundColor: '#FF5252',
      paddingVertical: spacing.lg,
      borderRadius: radius.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutBtnText: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
      marginRight: spacing.sm,
    },
    logoutIcon: {
      fontSize: 20,
      color: '#FFFFFF',
    },

    // Footer
    versionRow: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    versionText: {
      ...typography.caption, color: colors.textSecondary,
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
      width: 48, height: 6, backgroundColor: colors.border,
      borderRadius: 10, alignSelf: 'center',
      marginBottom: spacing.lg, marginTop: spacing.xs,
    },
    modalHeader: {
      alignItems: 'center', paddingBottom: spacing.xl,
      borderBottomWidth: 1, borderBottomColor: colors.surface,
    },
    modalTitle: {
      ...typography.title, fontSize: 20, color: colors.textPrimary, fontWeight: '700',
    },
    optionsContainer: {
      paddingHorizontal: spacing.xl, paddingTop: spacing.md,
    },
    modalOptionRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    modalOptionLabel: {
      ...typography.body, fontSize: 16, color: colors.textPrimary, fontWeight: '500',
      textAlign: 'left',
    },
    radioCircle: {
      width: 24, height: 24, borderRadius: 12,
      borderWidth: 2, borderColor: colors.textSecondary,
      alignItems: 'center', justifyContent: 'center',
      marginLeft: spacing.md,
    },
    radioCircleSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary,
    },
  });

  const currentLanguageLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';
  const currentThemeLabel = THEMES.find(t => t.code === theme)?.labelKey || 'settings.light';
  
  const selectedCurrency = CURRENCIES.find(c => c.code === currency);
  const currentCurrencyLabel = selectedCurrency ? t(selectedCurrency.labelKey, {defaultValue: currency}) : 'USD';
  
  // Custom helper to display the specific design names for theme like "Ligth" in mockup
  const getThemeDisplayValue = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

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
        <Icon name={icon} style={{fontSize: 22, color: isSelected ? colors.primary : colors.textSecondary, marginRight: spacing.md, width: 28, textAlign: 'center'}} />
      )}
      {iconText && (
        <View style={{marginRight: spacing.md, width: 28, alignItems: 'center'}}>
          <Text style={{fontSize: 22, color: colors.textPrimary}}>{iconText}</Text>
        </View>
      )}
      <View style={{flex: 1}}>
        <Text style={[styles.modalOptionLabel, isSelected && {color: colors.primary, fontWeight: '700'}]}>{label}</Text>
        {subtext && <Text style={{...typography.caption, color: colors.textSecondary, marginTop: 2, textAlign: 'left'}}>{subtext}</Text>}
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
        title={t('settings.title', {defaultValue: 'Settings'})} 
        onBackPress={() => navigation.goBack()}
        containerStyle={{paddingBottom: spacing.md}} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Info */}
        {user ? (
          <View style={styles.profileCard}>
            <Image 
              source={{uri: user.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}} 
              style={styles.avatar} 
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.name} numberOfLines={1}>{profile?.displayName || user.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{profile?.email || user?.email}</Text>
              {profile?.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText} numberOfLines={1}>{t(`roles.${profile.role}`, {defaultValue: profile.role})}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.editIconBtn} 
              onPress={() => navigation.navigate('ProfileEdit' as any)}
            >
              <Icon name="pencil" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Action Cards */}
        {user ? (
          <View style={styles.actionCardsRow}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Icon name="briefcase-outline" style={styles.actionCardIcon} />
              <Text style={styles.actionCardText}>{t('settings.myBookings', {defaultValue: 'My Booking'})}</Text>
            </TouchableOpacity>
            
            <View style={styles.actionCardSpacer} />

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <Icon name="heart-outline" style={styles.actionCardIcon} />
              <Text style={styles.actionCardText}>{t('settings.favorites', {defaultValue: 'My Favorites'})}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* App Settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.appSettings', {defaultValue: 'App Settings'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          {/* Language Option */}
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} onPress={() => setActiveModal('language')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FBE9E7'}]}>
              <Icon name="language-outline" style={{fontSize: 20, color: '#D84315'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.language', {defaultValue: 'Languages'})}</Text>
            <Text style={styles.optionValue}>{currentLanguageLabel}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          {/* Theme Option */}
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} onPress={() => setActiveModal('theme')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#EFEBE9'}]}>
              <Icon name="contrast-outline" style={{fontSize: 20, color: '#4E342E'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.theme', {defaultValue: 'Theme'})}</Text>
            <Text style={styles.optionValue}>{t(currentThemeLabel, {defaultValue: getThemeDisplayValue()})}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          {/* Currency Option */}
          <TouchableOpacity style={styles.optionRow} onPress={() => setActiveModal('currency')} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FBE9E7'}]}>
              <Icon name="cash-outline" style={{fontSize: 20, color: '#3E2723'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.currency', {defaultValue: 'Currency'})}</Text>
            <Text style={styles.optionValue}>{currentCurrencyLabel}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.about', {defaultValue: 'About'})}</Text>
        </View>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#EFEBE9'}]}>
              <Icon name="shield-half-outline" style={{fontSize: 20, color: '#000000'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.privacy', {defaultValue: 'Privacy Policy'})}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, styles.optionRowDivider]} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FBE9E7'}]}>
              <Icon name="document-text-outline" style={{fontSize: 20, color: '#000000'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.terms', {defaultValue: 'Kullanım Koşulları'})}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} activeOpacity={0.7}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#EFEBE9'}]}>
              <Icon name="chatbubble-ellipses-outline" style={{fontSize: 20, color: '#000000'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.contact', {defaultValue: 'İletişim'})}</Text>
            <Icon name={flipIcon('chevron-forward')} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>{t('settings.logout', {defaultValue: 'Logout'})}</Text>
            <Icon name="log-out-outline" style={styles.logoutIcon} />
          </TouchableOpacity>
        ) : null}

        {/* Footer */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>EasySy Travel - v{t('settings.version', {defaultValue: '1.0.0'})}</Text>
        </View>

      </ScrollView>

      {/* Settings Modals */}
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
                        {CURRENCIES.map(curr => renderModalOption(`${curr.code} - ${t(curr.labelKey, {defaultValue: curr.code})}`, currency === curr.code, () => {
                          setCurrency(curr.code);
                          setActiveModal(null);
                          if (user) {
                            updateProfile.mutate({ preferredCurrency: curr.code });
                          }
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
                          if (user) {
                            updateProfile.mutate({ theme: th.code });
                          }
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

export default ProfileMenuScreen;
