import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAtom, useAtomValue} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useRTL} from '../../../core/hooks/useRTL';
import {hotelSearchParamsAtom, selectedHotelAtom} from '../state/hotelAtoms';
import {Hotel} from '../models/Hotel';
import HotelCard from '../components/HotelCard';
import Loader from '../../../shared/components/Loader';
import {useTranslation} from 'react-i18next';
import {useHotelSearch} from '../hooks/useHotelSearch';
import HotelFilterModal from '../components/HotelFilterModal';
import HotelSortModal from '../components/HotelSortModal';
import {HotelFilters, HotelSortOption} from '../types/hotelTypes';

type HotelResultsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'HotelResults'
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasActiveFilters(filters: HotelFilters): boolean {
  return !!(
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minGuestRating !== undefined ||
    filters.propertyType ||
    (filters.amenities && filters.amenities.length > 0)
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const HotelResultsScreen: React.FC = () => {
  const navigation = useNavigation<HotelResultsNavProp>();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const params = useAtomValue(hotelSearchParamsAtom);
  const [, setSelectedHotel] = useAtom(selectedHotelAtom);
  const {t} = useTranslation();
  const {flipIcon} = useRTL();

  // Modal visibility
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  /**
   * Filter & Sort state — changing these triggers a fresh API request
   * because they are included in the queryKey of useHotelSearch.
   */
  const [activeFilters, setActiveFilters] = useState<HotelFilters>({});
  const [activeSort, setActiveSort] = useState<HotelSortOption>('recommended');

  // ---------------------------------------------------------------------------
  // Infinite query — filters & sort are forwarded to the API
  // ---------------------------------------------------------------------------

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useHotelSearch(params, activeFilters, activeSort);

  /**
   * Flatten all pages into a single hotel list.
   * No client-side filtering or sorting — the API handles that.
   */
  const hotels = useMemo<Hotel[]>(
    () => data?.pages.flatMap(p => p.hotels) ?? [],
    [data],
  );

  const isFilterActive = hasActiveFilters(activeFilters);
  const isSortActive = activeSort !== 'recommended';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    navigation.navigate('HotelDetail', {hotelId: hotel.id});
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) { fetchNextPage(); }
  };

  const handleRefresh = () => { refetch(); };

  const handleApplyFilters = (filters: HotelFilters) => {
    setActiveFilters(filters);
    // queryKey changes → TanStack automatically fires a new API request
  };

  const handleApplySort = (sort: HotelSortOption) => {
    setActiveSort(sort);
    // queryKey changes → TanStack automatically fires a new API request
  };

  // ---------------------------------------------------------------------------
  // Date / guest subtitle
  // ---------------------------------------------------------------------------

  const formatShort = (d: string | null) =>
    d ? dayjs(d).format('D MMM').toUpperCase() : '---';

  const dateSubtitle =
    params.checkIn && params.checkOut
      ? `${formatShort(params.checkIn)} → ${formatShort(params.checkOut)}`
      : t('hotels.selectDates');

  const guestStr = `${params.guests}`;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

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
      backgroundColor: colors.background,
    },
    hotelCountText: {
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
    list: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    emptyIcon: {fontSize: 50, color: colors.textSecondary},
    emptyText: {
      ...typography.subtitle,
      color: colors.textSecondary,
      marginTop: spacing.lg,
    },
    footerLoader: {paddingVertical: spacing.xl, alignItems: 'center'},
    errorText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
    retryBtn: {
      marginTop: spacing.md,
      alignSelf: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
    },
    retryBtnText: {
      ...typography.caption,
      color: '#fff',
      fontWeight: '600',
    },
  });

  const subtitleNode = (
    <View style={styles.subtitleRow}>
      <Icon name="calendar-outline" style={styles.subtitleIcon} />
      <Text style={styles.subtitleText}>{dateSubtitle}</Text>
      <Text style={styles.subtitleSep}>{'|'}</Text>
      <Icon name="people-outline" style={styles.subtitleIcon} />
      <Text style={styles.subtitleText}>{guestStr}</Text>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={params.location || 'Hotels'} subtitleNode={subtitleNode} centered containerStyle={styles.header} />
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={params.location || 'Hotels'} subtitleNode={subtitleNode} centered containerStyle={styles.header} />
        <View style={styles.emptyContainer}>
          <Icon name="cloud-offline-outline" style={styles.emptyIcon} />
          <Text style={styles.errorText}>{t('common.error')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      <ScreenHeader
        title={params.location || 'Hotels'}
        subtitleNode={subtitleNode}
        centered
        containerStyle={styles.header}
      />

      {/* Hotel count + Filter / Sort */}
      <View style={styles.controlsRow}>
        <Text style={styles.hotelCountText}>
          {t('hotels.hotelList')} ({hotels.length})
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

      {/* List with infinite scroll */}
      <FlatList
        data={hotels}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <HotelCard hotel={item} onPress={() => handleSelectHotel(item)} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isLoading}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="business-outline" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>{t('hotels.noHotels')}</Text>
          </View>
        }
      />

      {/* Bottom sheet modals */}
      <HotelFilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={activeFilters}
        onApply={handleApplyFilters}
      />
      <HotelSortModal
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        activeSort={activeSort}
        onSelect={handleApplySort}
      />
    </SafeAreaView>
  );
};

export default HotelResultsScreen;
