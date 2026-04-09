import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import dayjs from 'dayjs';
import {BusStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {busSearchParamsAtom} from '../state/busAtoms';
import SearchInput from '../../../shared/components/SearchInput';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import Icon from 'react-native-vector-icons/Ionicons';

type SearchBusNavProp = NativeStackNavigationProp<BusStackParamList, 'SearchBus'>;

const POPULAR_CITIES = ['Damascus', 'Lattakia', 'Tartus', 'Aleppo', 'Homs'];

const SearchBusScreen: React.FC = () => {
  const navigation = useNavigation<SearchBusNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [params, setParams] = useAtom(busSearchParamsAtom);
  const [loading, setLoading] = useState(false);

  const handleSwap = () => {
    setParams(p => ({...p, from: p.to, to: p.from}));
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('BusResults');
    }, 300);
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    backIcon: {fontSize: 22, color: colors.textPrimary},
    headerTitle: {...typography.title, color: colors.textPrimary},
    routeContainer: {
      position: 'relative',
    },
    swapBtn: {
      position: 'absolute',
      right: spacing.md,
      top: '50%',
      marginTop: -18,
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    swapIcon: {fontSize: 18, color: colors.white},
    fieldSpacer: {height: spacing.md},
    content: {padding: spacing.xl},
    fieldLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    dateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    dateIcon: {fontSize: 18, color: colors.textSecondary},
    dateText: {
      ...typography.body,
      color: params.date ? colors.textPrimary : colors.textSecondary,
    },
    popularSection: {marginTop: spacing.xl},
    popularTitle: {
      ...typography.subtitle,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    popularChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    cityChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cityChipText: {
      ...typography.body,
      color: colors.textPrimary,
    },
    searchBtn: {marginTop: spacing.xxl},
  });

  const today = dayjs().format('MMM DD, YYYY');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('bus.searchTitle')}</Text>
          </View>

          {/* From / To with swap */}
          <View style={styles.routeContainer}>
            <SearchInput
              value={params.from}
              onChangeText={v => setParams(p => ({...p, from: v}))}
              placeholder={t('bus.fromPlaceholder')}
              leftIconName="location-outline"
            />
            <View style={styles.fieldSpacer} />
            <SearchInput
              value={params.to}
              onChangeText={v => setParams(p => ({...p, to: v}))}
              placeholder={t('bus.toPlaceholder')}
              leftIconName="location-outline"
            />
            <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
              <Icon name="swap-vertical" style={styles.swapIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Date */}
          <Text style={styles.fieldLabel}>{t('common.date')}</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() =>
              setParams(p => ({...p, date: today}))
            }>
            <Icon name="calendar-outline" style={styles.dateIcon} />
            <Text style={styles.dateText}>
              {params.date || t('bus.datePlaceholder')}
            </Text>
          </TouchableOpacity>

          {/* Popular Routes */}
          <View style={styles.popularSection}>
            <Text style={styles.popularTitle}>Popular Routes</Text>
            <View style={styles.popularChips}>
              {POPULAR_CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  style={styles.cityChip}
                  onPress={() => setParams(p => ({...p, from: p.from || city, to: p.from ? city : p.to}))}
                  activeOpacity={0.7}>
                  <Text style={styles.cityChipText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search Button */}
          <PrimaryButton
            label={t('bus.searchBus')}
            onPress={handleSearch}
            loading={loading}
            style={styles.searchBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchBusScreen;
