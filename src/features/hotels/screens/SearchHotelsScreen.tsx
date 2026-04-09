import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';
import {formatDate} from '../../../core/utils/format';
import SelectCityModal from '../components/SelectCityModal';
import GuestSelectionModal from '../components/GuestSelectionModal';
import SelectDatesModal from '../components/SelectDatesModal';

const illustrationImage = require('../../../assets/images/illustration/image.png');
const hotelImg1 = require('../../../assets/images/hotels/252651206.jpg');
const hotelImg2 = require('../../../assets/images/hotels/highlight-main.jpg');

type SearchHotelsNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'SearchHotels'
>;

const POPULAR_HOTELS = [
  { id: '1', name: 'Lattakia Coast', location: 'Halep - Merkez', image: hotelImg1, priceRange: '50$ - 150$', rating: 4.5 },
  { id: '2', name: 'Lattakia Coast', location: 'Halep - Merkez', image: hotelImg2, priceRange: '50$ - 150$', rating: 4.5 },
];

const SearchHotelsScreen: React.FC = () => {
  const navigation = useNavigation<SearchHotelsNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [params, setParams] = useAtom(hotelSearchParamsAtom);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isGuestModalVisible, setIsGuestModalVisible] = useState(false);
  const [isDatesModalVisible, setIsDatesModalVisible] = useState(false);

  const handleSearch = () => {
    navigation.navigate('HotelResults');
  };

  const renderPopularHotel = ({item}: {item: typeof POPULAR_HOTELS[0]}) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.hotelCardContainer}>
      <View style={styles.hotelImageWrapper}>
        <Image source={item.image} style={styles.hotelImage} />
        <View style={styles.pricePill}>
          <Text style={styles.pricePillText}>{item.priceRange}</Text>
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingPillText}>{item.rating.toFixed(1)} <Icon name="star" style={styles.starIcon} /></Text>
        </View>
      </View>
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <View style={styles.hotelLocationRow}>
          <Icon name="location" style={styles.hotelPin} />
          <Text style={styles.hotelLocationText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    backBtn: {
      width: 32,
      height: 32,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    backIcon: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: '600',
    },
    headerTitle: {
      ...typography.title,
      color: colors.textPrimary,
      marginLeft: spacing.sm,
      fontSize: 22,
      fontWeight: '800',
    },
    illustrationContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    illustration: {
      width: '100%',
      height: 220,
      resizeMode: 'contain',
    },
    searchCard: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.xl,
      borderRadius: radius.xl,
      padding: spacing.xl,
      shadowColor: '#000',
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
      fontSize: 20,
      marginRight: spacing.md,
    },
    fieldText: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
      fontSize: 16,
    },
    valueText: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    searchBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      marginTop: spacing.xl,
    },
    searchBtnIcon: {
      fontSize: 20,
      color: colors.white,
      marginRight: spacing.sm,
    },
    searchBtnText: {
      ...typography.subtitle,
      color: colors.white,
      fontWeight: '700',
    },
    popularSection: {
      marginTop: spacing.xxl,
      paddingBottom: spacing.xxl,
    },
    popularTitle: {
      ...typography.title,
      fontSize: 20,
      color: colors.textPrimary,
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      fontWeight: '800',
    },
    hotelsList: {
      paddingHorizontal: spacing.xl,
      gap: spacing.lg,
    },
    hotelCardContainer: {
      width: 160,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 3,
    },
    hotelImageWrapper: {
      width: '100%',
      height: 120,
      position: 'relative',
    },
    hotelImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    pricePill: {
      position: 'absolute',
      bottom: spacing.sm,
      left: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    pricePillText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    ratingPill: {
      position: 'absolute',
      bottom: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.white,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingPillText: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: '700',
    },
    starIcon: {
      color: colors.textPrimary,
      fontSize: 10,
    },
    hotelInfo: {
      padding: spacing.md,
    },
    hotelName: {
      ...typography.subtitle,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: 4,
    },
    hotelLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    hotelPin: {
      fontSize: 12,
      marginRight: 4,
      color: colors.textSecondary,
    },
    hotelLocationText: {
      ...typography.caption,
      color: '#999',
      fontSize: 11,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('hotels.searchTitle')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image source={illustrationImage} style={styles.illustration} />
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          {/* Location */}
          <TouchableOpacity 
            style={styles.fieldRow} 
            onPress={() => setIsCityModalVisible(true)}
          >
            <Icon name="search-outline" style={styles.fieldIcon} color={colors.textSecondary} />
            {params.location ? (
              <Text style={styles.valueText}>{params.location}</Text>
            ) : (
              <Text style={styles.fieldText}>Select city or region</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Dates */}
          <TouchableOpacity 
            style={styles.fieldRow}
            onPress={() => setIsDatesModalVisible(true)}
          >
            <Icon name="calendar-outline" style={styles.fieldIcon} color={colors.textSecondary} />
            {params.checkIn && params.checkOut ? (
              <Text style={styles.valueText}>
                {formatDate(params.checkIn, 'MMM DD')} - {formatDate(params.checkOut, 'MMM DD')}
              </Text>
            ) : (
              <Text style={styles.fieldText}>Check-in - Check-out</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Guests */}
          <TouchableOpacity 
            style={styles.fieldRow}
            onPress={() => setIsGuestModalVisible(true)}
          >
            <Icon name="person-outline" style={styles.fieldIcon} color={colors.textSecondary} />
            <Text style={styles.valueText}>
              {params.guests} {params.guests === 1 ? 'Adult' : 'Adults'}
              {params.children > 0 ? `, ${params.children} Children` : ''}
              {`, ${params.rooms} ${params.rooms === 1 ? 'Room' : 'Rooms'}`}
            </Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity 
            style={styles.searchBtn}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Icon name="search" style={styles.searchBtnIcon} />
            <Text style={styles.searchBtnText}>{t('hotels.searchHotels')}</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Hotels Section */}
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Hotels</Text>
          <FlatList
            data={POPULAR_HOTELS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={renderPopularHotel}
            contentContainerStyle={styles.hotelsList}
          />
        </View>
      </ScrollView>

      <SelectCityModal
        isVisible={isCityModalVisible}
        onClose={() => setIsCityModalVisible(false)}
        onSelect={(cityName) => {
          setParams(p => ({...p, location: cityName}));
          setIsCityModalVisible(false);
        }}
        initialValue={params.location}
      />

      <GuestSelectionModal
        isVisible={isGuestModalVisible}
        onClose={() => setIsGuestModalVisible(false)}
        onApply={(adults, children, rooms) => {
          setParams(p => ({
            ...p,
            guests: adults,
            children: children,
            rooms: rooms,
          }));
          setIsGuestModalVisible(false);
        }}
        initialAdults={params.guests}
        initialChildren={params.children}
        initialRooms={params.rooms}
      />

      <SelectDatesModal
        isVisible={isDatesModalVisible}
        onClose={() => setIsDatesModalVisible(false)}
        onConfirm={(start, end) => {
          setParams(p => ({...p, checkIn: start, checkOut: end}));
          setIsDatesModalVisible(false);
        }}
        initialStart={params.checkIn}
        initialEnd={params.checkOut}
      />
    </SafeAreaView>
  );
};

export default SearchHotelsScreen;
