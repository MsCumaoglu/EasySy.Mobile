import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom, useAtomValue} from 'jotai';
import {BusStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useRTL} from '../../../core/hooks/useRTL';
import {busSearchParamsAtom, busResultsAtom} from '../state/busAtoms';
import {busMockService} from '../services/busMockService';
import BusTripCard from '../components/BusTripCard';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';
import BusFilterModal, {BusFilters} from '../components/BusFilterModal';
import BusSortModal, {BusSortOption} from '../components/BusSortModal';
import {BusTrip} from '../models/BusTrip';
import {useEffect} from 'react';

type BusResultsNavProp = NativeStackNavigationProp<BusStackParamList, 'BusResults'>;

// ---------------------------------------------------------------------------
// Helpers — client-side filter & sort
// ---------------------------------------------------------------------------

function departureToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function matchesDepartureSlot(
  time: string,
  slot: BusFilters['departureSlot'],
): boolean {
  const mins = departureToMinutes(time);
  switch (slot) {
    case 'morning':   return mins >= 0 && mins < 12 * 60;
    case 'afternoon': return mins >= 12 * 60 && mins < 17 * 60;
    case 'evening':   return mins >= 17 * 60 && mins < 21 * 60;
    case 'night':     return mins >= 21 * 60;
    default:          return true;
  }
}

function applyFilters(trips: BusTrip[], filters: BusFilters): BusTrip[] {
  return trips.filter(tr => {
    if (filters.busType && tr.busType !== filters.busType) {return false;}
    if (filters.maxPrice !== undefined && tr.price > filters.maxPrice) {return false;}
    if (filters.departureSlot && !matchesDepartureSlot(tr.departureTime, filters.departureSlot)) {return false;}
    if (filters.amenities && filters.amenities.length > 0) {
      if (!filters.amenities.every(a => tr.amenities.includes(a))) {return false;}
    }
    return true;
  });
}

function applySort(trips: BusTrip[], sort: BusSortOption): BusTrip[] {
  const arr = [...trips];
  switch (sort) {
    case 'price_asc':       return arr.sort((a, b) => a.price - b.price);
    case 'price_desc':      return arr.sort((a, b) => b.price - a.price);
    case 'departure_asc':   return arr.sort((a, b) => departureToMinutes(a.departureTime) - departureToMinutes(b.departureTime));
    case 'duration_asc':    return arr.sort((a, b) => a.durationMinutes - b.durationMinutes);
    default:                return arr;
  }
}

function hasActiveFilters(f: BusFilters): boolean {
  return !!(f.busType || f.maxPrice !== undefined || f.departureSlot || (f.amenities?.length ?? 0) > 0);
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const BusResultsScreen: React.FC = () => {
  const navigation = useNavigation<BusResultsNavProp>();
  const {t, i18n} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const {isRTL} = useRTL();
  const params = useAtomValue(busSearchParamsAtom);
  const [results, setResults] = useAtom(busResultsAtom);
  const [loading, setLoading] = useState(true);

  // Modal visibility
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Filter & sort state
  const [activeFilters, setActiveFilters] = useState<BusFilters>({});
  const [activeSort, setActiveSort] = useState<BusSortOption>('recommended');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await busMockService.searchTrips(params);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params, setResults]);

  // Filtered + sorted list
  const trips = useMemo(
    () => applySort(applyFilters(results, activeFilters), activeSort),
    [results, activeFilters, activeSort],
  );

  const isFilterActive = hasActiveFilters(activeFilters);
  const isSortActive = activeSort !== 'recommended';

  // Format date for subtitle
  const dateStr = params.date
    ? new Date(params.date).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language, {day: 'numeric', month: 'short'})
    : '---';

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      gap: spacing.sm,
    },
    subtitleIcon: {fontSize: 13, color: colors.textSecondary},
    subtitleText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    subtitleSep: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    tripCountText: {
      ...typography.subtitle,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    controlsRight: {flexDirection: 'row', gap: spacing.md},
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    controlBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    controlBtnText: {
      ...typography.caption,
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    controlBtnTextActive: {color: colors.primary},
    controlBtnIcon: {fontSize: 14, color: colors.textPrimary},
    controlBtnIconActive: {fontSize: 14, color: colors.primary},
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginLeft: 2,
    },
    list: {padding: spacing.xl},
    emptyContainer: {
      flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80,
    },
    emptyEmoji: {fontSize: 50, marginBottom: spacing.lg, color: colors.textSecondary},
    emptyText: {...typography.subtitle, color: colors.textSecondary},
  });

  const subtitleNode = (
    <View style={styles.subtitleRow}>
      <Icon name="calendar-outline" style={styles.subtitleIcon} />
      <Text style={styles.subtitleText}>{dateStr}</Text>
      <Text style={styles.subtitleSep}>{'|'}</Text>
      <Icon name="people-outline" style={styles.subtitleIcon} />
      <Text style={styles.subtitleText}>{params.passengers}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={params.from && params.to ? `${params.from} → ${params.to}` : t('bus.results')}
          subtitleNode={subtitleNode}
          centered
          containerStyle={styles.header}
        />
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      <ScreenHeader
        title={params.from && params.to ? `${params.from} → ${params.to}` : t('bus.results')}
        subtitleNode={subtitleNode}
        centered
        containerStyle={styles.header}
      />

      {/* Trip count + Filter / Sort */}
      <View style={styles.controlsRow}>
        <Text style={styles.tripCountText}>
          {t('bus.tripList')} ({trips.length})
        </Text>
        <View style={styles.controlsRight}>
          {/* Filter button */}
          <TouchableOpacity
            style={[styles.controlBtn, isFilterActive && styles.controlBtnActive]}
            activeOpacity={0.75}
            onPress={() => setFilterOpen(true)}>
            <Text style={[styles.controlBtnText, isFilterActive && styles.controlBtnTextActive]}>
              {t('common.filter')}
            </Text>
            <Icon
              name="funnel-outline"
              style={[styles.controlBtnIcon, isFilterActive && styles.controlBtnIconActive]}
            />
            {isFilterActive && <View style={styles.activeDot} />}
          </TouchableOpacity>

          {/* Sort button */}
          <TouchableOpacity
            style={[styles.controlBtn, isSortActive && styles.controlBtnActive]}
            activeOpacity={0.75}
            onPress={() => setSortOpen(true)}>
            <Text style={[styles.controlBtnText, isSortActive && styles.controlBtnTextActive]}>
              {t('common.sort')}
            </Text>
            <Icon
              name="swap-vertical-outline"
              style={[styles.controlBtnIcon, isSortActive && styles.controlBtnIconActive]}
            />
            {isSortActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={trips}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => <BusTripCard trip={item} onPress={() => {}} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bus-outline" style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>{t('bus.noTrips')}</Text>
          </View>
        }
      />

      {/* Bottom sheet modals */}
      <BusFilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={activeFilters}
        onApply={setActiveFilters}
      />
      <BusSortModal
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        activeSort={activeSort}
        onSelect={setActiveSort}
      />
    </SafeAreaView>
  );
};

export default BusResultsScreen;
