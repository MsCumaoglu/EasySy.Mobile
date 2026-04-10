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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAtom, useAtomValue} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {hotelSearchParamsAtom, hotelResultsAtom, selectedHotelAtom} from '../state/hotelAtoms';
import {hotelMockService} from '../services/hotelMockService';
import {Hotel} from '../models/Hotel';
import HotelCard from '../components/HotelCard';
import Loader from '../../../shared/components/Loader';

type HotelResultsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'HotelResults'
>;

const HotelResultsScreen: React.FC = () => {
  const navigation = useNavigation<HotelResultsNavProp>();
  const {colors, spacing, radius, typography} = useTheme();
  const params = useAtomValue(hotelSearchParamsAtom);
  const [results, setResults] = useAtom(hotelResultsAtom);
  const [, setSelectedHotel] = useAtom(selectedHotelAtom);
  const [loading, setLoading] = useState(true);

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
      : 'Select dates';

  const guestStr = `${params.guests}`;

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: '#F5F5F7'},
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flex: 1,
    },
    cityName: {
      ...typography.title,
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnIcon: {
      fontSize: 26,
      color: colors.primary,
    },
    // Filter/Sort row
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
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
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.cityName}>{params.location || 'Hotels'}</Text>
              <View style={styles.subtitleRow}>
                <Icon name="calendar-outline" style={styles.subtitleIcon} />
                <Text style={styles.subtitleText}>{dateSubtitle}</Text>
                <Text style={styles.subtitleSep}> | </Text>
                <Icon name="people-outline" style={styles.subtitleIcon} />
                <Text style={styles.subtitleText}>{guestStr}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="close" style={styles.closeBtnIcon} />
            </TouchableOpacity>
          </View>
        </View>
        <Loader message="Searching hotels..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#FAFAFA' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.cityName}>{params.location || 'Hotels'}</Text>
            <View style={styles.subtitleRow}>
              <Icon name="calendar-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{dateSubtitle}</Text>
              <Text style={styles.subtitleSep}> | </Text>
              <Icon name="people-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{guestStr}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="close" style={styles.closeBtnIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hotel count + Filter / Sort */}
      <View style={styles.controlsRow}>
        <Text style={styles.hotelCountText}>
          Hotel List ({results.length})
        </Text>
        <View style={styles.controlsRight}>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>Filter</Text>
            <Icon name="funnel-outline" style={styles.controlBtnIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>Sort</Text>
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
            <Text style={styles.emptyText}>No hotels found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default HotelResultsScreen;
