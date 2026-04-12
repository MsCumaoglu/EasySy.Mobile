import React from 'react';
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

type HotelResultsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'HotelResults'
>;

const HotelResultsScreen: React.FC = () => {
  const navigation = useNavigation<HotelResultsNavProp>();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const params = useAtomValue(hotelSearchParamsAtom);
  const [, setSelectedHotel] = useAtom(selectedHotelAtom);
  const {t} = useTranslation();
  const {flipIcon} = useRTL();

  // ---------------------------------------------------------------------------
  // Infinite query — replaces useEffect + useState
  // ---------------------------------------------------------------------------

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useHotelSearch(params);

  /**
   * Flatten all pages into a single array for FlatList.
   * TanStack Query handles page merging automatically.
   */
  const hotels = data?.pages.flat() ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSelectHotel = (hotel: Hotel) => {
    // Store in Jotai so HotelDetailScreen can render instantly (initialData)
    setSelectedHotel(hotel);
    navigation.navigate('HotelDetail', {hotelId: hotel.id});
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
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
    controlsRight: {
      flexDirection: 'row',
      gap: spacing.md,
    },
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
    controlBtnText: {
      ...typography.caption,
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    controlBtnIcon: {fontSize: 14, color: colors.textPrimary},
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
    footerLoader: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
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
  // Loading state (first load only)
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={params.location || 'Hotels'}
          subtitleNode={subtitleNode}
          centered
          containerStyle={styles.header}
        />
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={params.location || 'Hotels'}
          subtitleNode={subtitleNode}
          centered
          containerStyle={styles.header}
        />
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

      {/* Header */}
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
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>{t('common.filter')}</Text>
            <Icon name="funnel-outline" style={styles.controlBtnIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>{t('common.sort')}</Text>
            <Icon name="swap-vertical-outline" style={styles.controlBtnIcon} />
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
        // Lazy loading: load next page when user is 50% from the bottom
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        // Pull-to-refresh: invalidates SQLite cache and re-fetches from API
        onRefresh={handleRefresh}
        refreshing={isLoading}
        // Footer: show spinner while next page is loading
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
    </SafeAreaView>
  );
};

export default HotelResultsScreen;
