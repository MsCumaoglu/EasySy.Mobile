import React, {useEffect, useState} from 'react';
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
import {useAtom, useAtomValue} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useRTL} from '../../../core/hooks/useRTL';
import {hotelSearchParamsAtom, hotelResultsAtom, selectedHotelAtom} from '../state/hotelAtoms';
import {hotelMockService} from '../services/hotelMockService';
import {Hotel} from '../models/Hotel';
import HotelCard from '../components/HotelCard';
import Loader from '../../../shared/components/Loader';
import { useTranslation } from 'react-i18next';

type HotelResultsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'HotelResults'
>;

const HotelResultsScreen: React.FC = () => {
  const navigation = useNavigation<HotelResultsNavProp>();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const params = useAtomValue(hotelSearchParamsAtom);
  const [results, setResults] = useAtom(hotelResultsAtom);
  const [, setSelectedHotel] = useAtom(selectedHotelAtom);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  const {flipIcon} = useRTL();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await hotelMockService.searchHotels(params);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params, setResults]);

  const handleSelectHotel = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    navigation.navigate('HotelDetail', {hotelId: hotel.id});
  };

  // Format the date subtitle
  const formatShort = (d: string | null) =>
    d ? dayjs(d).format('D MMM').toUpperCase() : '---';

  const dateSubtitle =
    params.checkIn && params.checkOut
      ? `${formatShort(params.checkIn)} → ${formatShort(params.checkOut)}`
      : t('hotels.selectDates');

  const guestStr = `${params.guests}`;

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
    subtitleIcon: {
      fontSize: 13,
      color: colors.textSecondary,
    },
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

    // Filter/Sort row
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
    controlBtnIcon: {
      fontSize: 14,
      color: colors.textPrimary,
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
    emptyText: {...typography.subtitle, color: colors.textSecondary, marginTop: spacing.lg},
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title={params.location || 'Hotels'}
          subtitleNode={
            <View style={styles.subtitleRow}>
              <Icon name="calendar-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{dateSubtitle}</Text>
              <Text style={styles.subtitleSep}> | </Text>
              <Icon name="people-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{guestStr}</Text>
            </View>
          }
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

      {/* Header */}
      <ScreenHeader
        title={params.location || 'Hotels'}
        subtitleNode={
          <View style={styles.subtitleRow}>
            <Icon name="calendar-outline" style={styles.subtitleIcon} />
            <Text style={styles.subtitleText}>{dateSubtitle}</Text>
            <Text style={styles.subtitleSep}> | </Text>
            <Icon name="people-outline" style={styles.subtitleIcon} />
            <Text style={styles.subtitleText}>{guestStr}</Text>
          </View>
        }
        centered
        containerStyle={styles.header}
      />

      {/* Hotel count + Filter / Sort */}
      <View style={styles.controlsRow}>
        <Text style={styles.hotelCountText}>
          {t('hotels.hotelList')} ({results.length})
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

      {/* List */}
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <HotelCard
            hotel={item}
            onPress={() => handleSelectHotel(item)}
          />
        )}
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
