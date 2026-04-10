import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {appThemeAtom, appLanguageAtom, AppLanguage} from '../../../state/appAtoms';
import {useRTL} from '../../../core/hooks/useRTL';
import i18n from '../../../localization/i18n';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

type Language = {code: AppLanguage; label: string; nativeLabel: string; isRTL: boolean};
type ThemeOption = {code: 'light' | 'dark' | 'system'; labelKey: string; icon: string};

const LANGUAGES: Language[] = [
  {code: 'en', label: 'English',  nativeLabel: 'English',  isRTL: false},
  {code: 'tr', label: 'Turkish',  nativeLabel: 'Türkçe',   isRTL: false},
  {code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  isRTL: true},
];

const THEMES: ThemeOption[] = [
  {code: 'light',  labelKey: 'settings.light',  icon: 'sunny-outline'},
  {code: 'dark',   labelKey: 'settings.dark',   icon: 'moon-outline'},
  {code: 'system', labelKey: 'settings.system', icon: 'phone-portrait-outline'},
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [theme, setTheme] = useAtom(appThemeAtom);
  const [language, setLanguage] = useAtom(appLanguageAtom);
  const {isRTL, flipIcon} = useRTL();

  const handleLanguageChange = async (lang: Language) => {
    if (lang.code === language) return;
    await i18n.changeLanguage(lang.code);
    setLanguage(lang.code);
    // RTL is applied reactively via useRTL() hook — no app restart needed.
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},

    /* ── Header ── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19,
      alignItems: 'center', justifyContent: 'center',
    },
    backIcon: {fontSize: 24, color: colors.textPrimary},
    headerTitle: {
      ...typography.title, color: colors.textPrimary,
      fontWeight: '700', fontSize: 20,
      marginLeft: isRTL ? 0 : spacing.md,
      marginRight: isRTL ? spacing.md : 0,
    },

    /* ── Sections ── */
    scrollContent: {paddingBottom: spacing.xxl},
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    sectionCard: {
      marginHorizontal: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },

    /* ── Option row ── */
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    optionRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionIconWrap: {
      width: 38, height: 38, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      marginRight: isRTL ? 0 : spacing.md,
      marginLeft: isRTL ? spacing.md : 0,
    },
    optionLabel: {
      ...typography.body, color: colors.textPrimary,
      flex: 1, fontWeight: '500',
      textAlign: isRTL ? 'right' : 'left',
    },
    optionValue: {
      ...typography.body, color: colors.textSecondary, fontSize: 14,
    },
    chevron: {
      fontSize: 18, color: colors.textSecondary,
      marginLeft: isRTL ? spacing.sm : 0,
      marginRight: isRTL ? 0 : spacing.sm,
    },

    /* ── Language options ── */
    langGrid: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      gap: spacing.md,
    },
    langChip: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 4,
    },
    langChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '12',
    },
    langNative: {
      ...typography.subtitle, fontWeight: '700', fontSize: 16,
      color: colors.textPrimary,
    },
    langNativeActive: {color: colors.primary},
    langCode: {
      ...typography.caption, color: colors.textSecondary, fontSize: 11,
    },
    langCodeActive: {color: colors.primary},

    /* ── Theme chips ── */
    themeGrid: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      gap: spacing.md,
    },
    themeChip: {
      flex: 1, paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border,
      backgroundColor: colors.card, gap: 6,
    },
    themeChipActive: {borderColor: colors.primary, backgroundColor: colors.primary + '12'},
    themeIcon: {fontSize: 22, color: colors.textSecondary},
    themeIconActive: {color: colors.primary},
    themeLabel: {...typography.caption, color: colors.textSecondary, fontWeight: '600'},
    themeLabelActive: {color: colors.primary},

    /* ── Version ── */
    versionRow: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
    },
    versionText: {
      ...typography.caption, color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name={flipIcon('arrow-back')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Language Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={[styles.optionRow, styles.optionRowDivider]}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E8F4FD'}]}>
              <Icon name="language-outline" style={{fontSize: 20, color: '#2196F3'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.language')}</Text>
          </View>

          {/* Language chips */}
          <View style={styles.langGrid}>
            {LANGUAGES.map(lang => {
              const isActive = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, isActive && styles.langChipActive]}
                  activeOpacity={0.75}
                  onPress={() => handleLanguageChange(lang)}>
                  <Text style={[styles.langNative, isActive && styles.langNativeActive]}>
                    {lang.nativeLabel}
                  </Text>
                  <Text style={[styles.langCode, isActive && styles.langCodeActive]}>
                    {lang.code.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Appearance Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={[styles.optionRow, styles.optionRowDivider]}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#FFF3E0'}]}>
              <Icon name="color-palette-outline" style={{fontSize: 20, color: '#FF9800'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.theme')}</Text>
          </View>

          {/* Theme chips */}
          <View style={styles.themeGrid}>
            {THEMES.map(th => {
              const isActive = theme === th.code;
              return (
                <TouchableOpacity
                  key={th.code}
                  style={[styles.themeChip, isActive && styles.themeChipActive]}
                  activeOpacity={0.75}
                  onPress={() => setTheme(th.code as any)}>
                  <Icon
                    name={th.icon}
                    style={[styles.themeIcon, isActive && styles.themeIconActive]}
                  />
                  <Text style={[styles.themeLabel, isActive && styles.themeLabelActive]}>
                    {t(th.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── About ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.optionRow}>
            <View style={[styles.optionIconWrap, {backgroundColor: '#E8F5E9'}]}>
              <Icon name="information-circle-outline" style={{fontSize: 20, color: '#4CAF50'}} />
            </View>
            <Text style={styles.optionLabel}>{t('settings.appVersion')}</Text>
            <Text style={styles.optionValue}>{t('settings.version')}</Text>
          </View>
        </View>

        {/* Version footer */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>EasySy Travel · v{t('settings.version')}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
