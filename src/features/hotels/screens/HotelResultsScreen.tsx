import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom, useAtomValue} from 'jotai';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {hotelSearchParamsAtom, hotelResultsAtom, selectedHotelAtom} from '../state/hotelAtoms';
import {hotelMockService} from '../services/hotelMockService';
import {Hotel} from '../models/Hotel';
import HotelCard from '../components/HotelCard';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';

type HotelResultsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'HotelResults'
>;

const HotelResultsScreen: React.FC = () => {
  const navigation = useNavigation<HotelResultsNavProp>();
  const {t} = useTranslation();
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
      marginBottom: spacing.sm,
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
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: 38 + spacing.md,
    },
    list: {padding: spacing.xl},
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    emptyEmoji: {fontSize: 50, marginBottom: spacing.lg, color: colors.textSecondary},
    emptyText: {...typography.subtitle, color: colors.textSecondary},
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('hotels.results')}</Text>
          </View>
        </View>
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('hotels.results')}</Text>
        </View>
        <Text style={styles.subtitle}>
          {results.length} hotels found
          {params.location ? ` in ${params.location}` : ''}
        </Text>
      </View>

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
            <Icon name="business-outline" style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>{t('common.noResults')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default HotelResultsScreen;
