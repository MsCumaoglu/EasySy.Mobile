import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import {BusStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {busSearchParamsAtom} from '../state/busAtoms';
import {useRTL} from '../../../core/hooks/useRTL';
import SelectBusCityModal from '../components/SelectBusCityModal';
import SelectBusDateModal from '../components/SelectBusDateModal';

const illustrationImage = require('../../../assets/images/illustration/image.png');

type SearchBusNavProp = NativeStackNavigationProp<BusStackParamList, 'SearchBus'>;

const POPULAR_CITIES = [
  {nameKey: 'cities.damascus', icon: 'business-outline'},
  {nameKey: 'cities.latakkia',  icon: 'water-outline'},
  {nameKey: 'cities.aleppo',    icon: 'home-outline'},
  {nameKey: 'cities.homs',      icon: 'leaf-outline'},
  {nameKey: 'cities.tartus',    icon: 'boat-outline'},
  {nameKey: 'cities.deirEzZor', icon: 'sunny-outline'},
];

const SearchBusScreen: React.FC = () => {
  const navigation = useNavigation<SearchBusNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const [params, setParams] = useAtom(busSearchParamsAtom);
  const [loading, setLoading] = useState(false);
  const {isRTL, flipIcon} = useRTL();

  // Modal visibility
  const [fromModalVisible,  setFromModalVisible]  = useState(false);
  const [toModalVisible,    setToModalVisible]    = useState(false);
  const [dateModalVisible,  setDateModalVisible]  = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('BusResults');
    }, 300);
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},

    /* ── Illustration ── */
    illustrationContainer: {
      alignItems: 'center', justifyContent: 'center',
      marginVertical: spacing.md, paddingHorizontal: spacing.md,
    },
    illustration: {width: '100%', height: 220, resizeMode: 'contain'},

    /* ── Search Card ── */
    searchCard: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.xl,
      borderRadius: radius.xl,
      padding: spacing.xl,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.05,
      shadowRadius: 15,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    fieldIcon: {
      fontSize: 20, color: colors.primary,
      marginRight: spacing.md, width: 24, textAlign: 'center',
    },
    fieldText: {
      ...typography.body, color: colors.textSecondary, flex: 1, fontSize: 16,
    },
    valueText: {
      ...typography.body, color: colors.textPrimary,
      flex: 1, fontSize: 16, fontWeight: '500',
    },
    divider: {height: 1, backgroundColor: colors.border},

    /* ── Search Button ── */
    searchBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      marginTop: spacing.xl,
    },
    searchBtnIcon: {fontSize: 20, color: colors.white, marginRight: spacing.sm},
    searchBtnText: {...typography.subtitle, color: colors.white, fontWeight: '700'},

    /* ── Popular Cities ── */
    popularSection: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.xxl,
      paddingBottom: spacing.xxl,
    },
    popularHeader: {
      flexDirection: 'row', alignItems: 'center',
      marginBottom: spacing.lg, gap: spacing.sm,
    },
    popularHeaderIcon: {fontSize: 18, color: colors.primary},
    popularTitle: {
      ...typography.subtitle, color: colors.textPrimary,
      fontWeight: '700', fontSize: 17,
    },
    chipsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md},
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    chipIcon: {fontSize: 14, color: colors.primary},
    chipText: {...typography.body, color: colors.textPrimary, fontSize: 14, fontWeight: '500'},
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScreenHeader title={t('bus.searchTitle')} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Illustration ── */}
        <View style={styles.illustrationContainer}>
          <Image source={illustrationImage} style={styles.illustration} />
        </View>

        {/* ── Search Card ── */}
        <View style={styles.searchCard}>

          {/* From */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setFromModalVisible(true)}>
            <Icon name="location-outline" style={styles.fieldIcon} />
            {params.from ? (
              <Text style={styles.valueText}>{params.from}</Text>
            ) : (
              <Text style={styles.fieldText}>{t('bus.fromPlaceholder')}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* To */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setToModalVisible(true)}>
            <Icon name="bus-outline" style={styles.fieldIcon} />
            {params.to ? (
              <Text style={styles.valueText}>{params.to}</Text>
            ) : (
              <Text style={styles.fieldText}>{t('bus.toPlaceholder')}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Date */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setDateModalVisible(true)}>
            <Icon name="calendar-outline" style={styles.fieldIcon} />
            <Text style={params.date ? styles.valueText : styles.fieldText}>
              {params.date
                ? dayjs(params.date).format('DD/MM/YYYY')
                : t('bus.datePlaceholder')}
            </Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearch}
            activeOpacity={0.8}>
            <Icon name="search" style={styles.searchBtnIcon} />
            <Text style={styles.searchBtnText}>{t('bus.searchBus')}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Popular Cities ── */}
        <View style={styles.popularSection}>
          <View style={styles.popularHeader}>
            <Icon name="flame-outline" style={styles.popularHeaderIcon} />
            <Text style={styles.popularTitle}>{t('bus.popularCities')}</Text>
          </View>
          <View style={styles.chipsGrid}>
            {POPULAR_CITIES.map(city => {
              const cityName = t(city.nameKey);
              return (
                <TouchableOpacity
                  key={city.nameKey}
                  style={styles.chip}
                  activeOpacity={0.75}
                  onPress={() =>
                    setParams(p => ({
                      ...p,
                      from: p.from ? p.from : cityName,
                      to: p.from ? cityName : p.to,
                    }))
                  }>
                  <Icon name={city.icon} style={styles.chipIcon} />
                  <Text style={styles.chipText}>{cityName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ── Modals ── */}
      <SelectBusCityModal
        isVisible={fromModalVisible}
        onClose={() => setFromModalVisible(false)}
        onSelect={name => {
          setParams(p => ({...p, from: name}));
          setFromModalVisible(false);
        }}
        title={t('bus.departureCity')}
        initialValue={params.from}
      />

      <SelectBusCityModal
        isVisible={toModalVisible}
        onClose={() => setToModalVisible(false)}
        onSelect={name => {
          setParams(p => ({...p, to: name}));
          setToModalVisible(false);
        }}
        title={t('bus.destinationCity')}
        initialValue={params.to}
      />

      <SelectBusDateModal
        isVisible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        onConfirm={date => {
          setParams(p => ({...p, date}));
          setDateModalVisible(false);
        }}
        initialDate={params.date}
      />

    </SafeAreaView>
  );
};

export default SearchBusScreen;
