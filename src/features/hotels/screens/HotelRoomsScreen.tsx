import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useHotelRooms} from '../hooks/useHotelRooms';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';
import Loader from '../../../shared/components/Loader';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import {Room} from '../models/Room';
import SelectDatesModal from '../components/SelectDatesModal';
import GuestSelectionModal from '../components/GuestSelectionModal';
import {formatCurrency} from '../../../core/utils/format';

type HotelRoomsNavProp = NativeStackNavigationProp<HotelStackParamList, 'HotelRooms'>;
type HotelRoomsRouteProp = RouteProp<HotelStackParamList, 'HotelRooms'>;

export default function HotelRoomsScreen() {
  const navigation = useNavigation<HotelRoomsNavProp>();
  const route = useRoute<HotelRoomsRouteProp>();
  const {hotelId, hotelName} = route.params;
  const {t, i18n} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();

  const [searchParams, setSearchParams] = useAtom(hotelSearchParamsAtom);
  const {data: rooms, isLoading, isFetching} = useHotelRooms(hotelId);

  const [isDatesModalVisible, setDatesModalVisible] = useState(false);
  const [isGuestsModalVisible, setGuestsModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse dates for display
  const checkInDisplay = searchParams.checkIn ? searchParams.checkIn : t('hotels.checkIn');
  const checkOutDisplay = searchParams.checkOut ? searchParams.checkOut : t('hotels.checkOut');
  
  const handleUpdateFilter = () => {
    // Simulate updating filter locally
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 400);
  };

  const renderRoom = ({item}: {item: Room}) => {
    // Calculate required capacity per room
    const requiredRooms = searchParams.rooms || 1;
    const requiredAdultsPerRoom = Math.ceil((searchParams.guests || 1) / requiredRooms);
    const requiredChildrenPerRoom = Math.ceil((searchParams.children || 0) / requiredRooms);

    const isAvailable = 
      item.quantity >= requiredRooms &&
      item.maxAdults >= requiredAdultsPerRoom &&
      item.maxChildren >= requiredChildrenPerRoom;

    return (
      <View style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomPrice}>
              {formatCurrency(item.basePriceSyp)} <Text style={styles.perNight}>{t('common.perNight')}</Text>
            </Text>
          </View>
          <View style={[styles.availabilityBadge, {backgroundColor: isAvailable ? '#C6F6D5' : '#FED7D7'}]}>
            <Text style={[styles.availabilityText, {color: isAvailable ? '#22543D' : '#822727'}]}>
              {isAvailable ? t('common.available') || 'Available' : t('common.notAvailable') || 'Not Available'}
            </Text>
          </View>
        </View>

        <View style={styles.roomDetailScroll}>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Icon name="resize-outline" style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.roomSizeSqm} m²</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="bed-outline" style={styles.detailIcon} />
              <Text style={styles.detailText}>{t(`common.${item.bedType.toLowerCase()}`) || item.bedType.replace('_', ' ')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="eye-outline" style={styles.detailIcon} />
              <Text style={styles.detailText}>{t(`common.${item.viewType.toLowerCase()}`) || item.viewType.replace('_', ' ')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="people-outline" style={styles.detailIcon} />
              <Text style={styles.detailText}>{item.maxAdults} {t('common.adults')} & {item.maxChildren} {t('common.children')}</Text>
            </View>
          </View>
          
          <View style={styles.roomFeatures}>
             {item.hasPrivateBathroom && (
               <View style={styles.featureTag}>
                 <Icon name="water-outline" size={14} color={colors.primary} />
                 <Text style={styles.featureText}>Private Bath</Text>
               </View>
             )}
             {item.hasAirConditioning && (
               <View style={styles.featureTag}>
                 <Icon name="snow-outline" size={14} color={colors.primary} />
                 <Text style={styles.featureText}>AC</Text>
               </View>
             )}
             {item.hasBalcony && (
               <View style={styles.featureTag}>
                 <Icon name=" storefront-outline" size={14} color={colors.primary} />
                 <Text style={styles.featureText}>Balcony</Text>
               </View>
             )}
          </View>
        </View>

        {isAvailable && (
          <View style={styles.bookNowContainer}>
            <PrimaryButton
              label={t('common.bookNow') || 'Book Now'}
              onPress={() => {}} // Booking flow will be added later
              style={styles.bookNowBtn}
            />
          </View>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    headerIcon: {fontSize: 22, color: colors.textPrimary},
    headerTitle: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
      flex: 1,
    },
    filterCompactCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterCompactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    filterDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    filterCompactIcon: {
      fontSize: 20,
      color: colors.primary,
      width: 32,
    },
    filterCompactText: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
    },
    updateCompactBtn: {
      marginTop: spacing.md,
    },
    sectionTitle: {
      ...typography.title,
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '700',
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    roomCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    roomName: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
      flex: 1,
      marginRight: spacing.sm,
    },
    roomPrice: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '700',
      marginTop: 2,
    },
    perNight: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    availabilityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    availabilityText: {
      ...typography.caption,
      fontWeight: '600',
    },
    roomDetailScroll: {
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    detailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '45%',
      gap: 6,
    },
    detailIcon: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    detailText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontSize: 12,
    },
    roomFeatures: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    featureTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    featureText: {
      ...typography.caption,
      fontSize: 10,
      color: colors.textSecondary,
    },
    bookNowContainer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    bookNowBtn: {
      width: '100%',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Icon name={i18n.dir() === 'rtl' ? 'chevron-forward' : 'chevron-back'} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {hotelName} - {t('common.rooms') || 'Rooms'}
        </Text>
      </View>

      {/* Compact Filter Card */}
      <View style={styles.filterCompactCard}>
        <TouchableOpacity style={styles.filterCompactRow} onPress={() => setDatesModalVisible(true)}>
          <Icon name="calendar-outline" style={styles.filterCompactIcon} />
          <Text style={styles.filterCompactText}>{checkInDisplay} - {checkOutDisplay}</Text>
        </TouchableOpacity>
        <View style={styles.filterDivider} />
        <TouchableOpacity style={styles.filterCompactRow} onPress={() => setGuestsModalVisible(true)}>
          <Icon name="person-outline" style={styles.filterCompactIcon} />
          <Text style={styles.filterCompactText}>{searchParams.guests} {t('common.adults') || 'Adults'} & {searchParams.children} {t('common.children') || 'Children'}</Text>
        </TouchableOpacity>
        
        <PrimaryButton 
          label={t('hotels.updateFilter') || 'Update Filter'} 
          onPress={handleUpdateFilter} 
          style={styles.updateCompactBtn}
          variant="filled"
        />
      </View>

      <Text style={styles.sectionTitle}>{t('hotels.roomsList') || 'Available Rooms'}</Text>

      {/* Room List */}
      {isLoading || isFetching || isUpdating ? (
        <Loader />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <SelectDatesModal 
        isVisible={isDatesModalVisible} 
        onClose={() => setDatesModalVisible(false)} 
        onConfirm={(start, end) => {
          setSearchParams(prev => ({...prev, checkIn: start, checkOut: end}));
          setDatesModalVisible(false);
        }}
        initialStart={searchParams.checkIn}
        initialEnd={searchParams.checkOut}
      />
      <GuestSelectionModal 
        isVisible={isGuestsModalVisible} 
        onClose={() => setGuestsModalVisible(false)} 
        onApply={(adults, children, rooms) => {
          setSearchParams(prev => ({...prev, guests: adults, children, rooms}));
          setGuestsModalVisible(false);
        }}
        initialAdults={searchParams.guests}
        initialChildren={searchParams.children}
        initialRooms={searchParams.rooms}
      />
    </SafeAreaView>
  );
}
