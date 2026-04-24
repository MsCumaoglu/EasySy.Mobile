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
import {useHotelRoomCombinations} from '../hooks/useHotelRooms';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';
import Loader from '../../../shared/components/Loader';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import {RoomCombinationItem} from '../../../core/api/services/hotelService';
import SelectDatesModal from '../components/SelectDatesModal';
import GuestSelectionModal from '../components/GuestSelectionModal';
import {useCurrency} from '../../../core/hooks/useCurrency';

type HotelRoomsNavProp = NativeStackNavigationProp<HotelStackParamList, 'HotelRooms'>;
type HotelRoomsRouteProp = RouteProp<HotelStackParamList, 'HotelRooms'>;

export default function HotelRoomsScreen() {
  const navigation = useNavigation<HotelRoomsNavProp>();
  const route = useRoute<HotelRoomsRouteProp>();
  const {hotelId, hotelName} = route.params;
  const {t, i18n} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();

  const [searchParams, setSearchParams] = useAtom(hotelSearchParamsAtom);
  const {data: combinations, isLoading, isFetching} = useHotelRoomCombinations(hotelId);
  const {formatPrice} = useCurrency();

  const totalAdults = searchParams.roomsConfig.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = searchParams.roomsConfig.reduce((sum, r) => sum + r.children, 0);
  const totalRooms = searchParams.roomsConfig.length;

  const [isDatesModalVisible, setDatesModalVisible] = useState(false);
  const [isGuestsModalVisible, setGuestsModalVisible] = useState(false);
  // Parse dates for display
  const checkInDisplay = searchParams.checkIn ? searchParams.checkIn : t('hotels.checkIn');
  const checkOutDisplay = searchParams.checkOut ? searchParams.checkOut : t('hotels.checkOut');

  const renderCombination = ({item, index}: {item: RoomCombinationItem; index: number}) => {
    // Generate a combination title, e.g. "Suit + Standard"
    const combinationTitle = item.rooms
      .map(r => t(`common.${r.roomType.toLowerCase()}`, {defaultValue: r.roomType.replace(/_/g, ' ')}))
      .join(' + ');

    return (
      <View style={styles.roomCard}>
        {/* Header */}
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{combinationTitle} Room</Text>
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>{formatPrice(item.totalPrice)} {t('hotels.total', {defaultValue: 'Total'})}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Room Details */}
        <View style={styles.roomDetailScroll}>
          {item.rooms.map((room, rIdx) => (
            <View key={room.roomId + rIdx} style={{marginBottom: rIdx < item.rooms.length - 1 ? 16 : 0}}>
              {/* Row 1: Max Adults & Children */}
              <View style={styles.detailRow}>
                <View style={styles.detailItemRow}>
                  <Icon name="person" style={styles.iconOrange} />
                  <Text style={styles.detailTextBlack}>Max Adult Capacity {room.maxAdults}</Text>
                </View>
                <View style={styles.detailItemRow}>
                  <Icon name="happy" style={styles.iconOrange} />
                  <Text style={styles.detailTextBlack}>Max Children Capacity {room.maxChildren}</Text>
                </View>
              </View>

              {/* Row 2: Bed & View */}
              <View style={styles.detailRow}>
                <View style={styles.detailItemRow}>
                  <Icon name="bed" style={styles.iconBlack} />
                  <Text style={styles.detailTextBlack}>
                    {t(`common.${room.bedType.toLowerCase()}`, {defaultValue: room.bedType.replace(/_/g, ' ')})}
                  </Text>
                </View>
                <View style={styles.detailItemRow}>
                  <Icon name="eye" style={styles.iconBlack} />
                  <Text style={styles.detailTextBlack}>
                    {t(`common.${room.viewType.toLowerCase()}`, {defaultValue: room.viewType.replace(/_/g, ' ')})}
                  </Text>
                </View>
              </View>

              {/* Row 3: Amenities */}
              <View style={styles.amenitiesRow}>
                {room.hasPrivateBathroom && (
                  <View style={styles.amenityPill}>
                    <Icon name="water-outline" style={styles.amenityIconOrange} />
                    <Text style={styles.amenityText}>Private Bath</Text>
                  </View>
                )}
                {room.hasAirConditioning && (
                  <View style={styles.amenityPill}>
                    <Icon name="snow-outline" style={styles.amenityIconOrange} />
                    <Text style={styles.amenityText}>AC</Text>
                  </View>
                )}
                {room.hasBalcony && (
                  <View style={styles.amenityPill}>
                    <Icon name="storefront-outline" style={styles.amenityIconOrange} />
                    <Text style={styles.amenityText}>Balcony</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Footer Actions */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => {}}>
            <Text style={styles.bookBtnText}>{t('common.bookNow', {defaultValue: 'Book Now'})}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.whatsappBtn} onPress={() => {}}>
            <Icon name="logo-whatsapp" style={styles.whatsappIcon} />
          </TouchableOpacity>
        </View>
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
    pillCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      paddingVertical: 6,
      paddingHorizontal: 6,
      backgroundColor: colors.surface,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 6,
      paddingHorizontal: 6,
    },
    pillIcon: {
      fontSize: 22,
      color: colors.primary,
    },
    pillText: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      flexShrink: 1,
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
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    roomName: {
      ...typography.subtitle,
      color: '#000000',
      fontWeight: '800',
      fontSize: 18,
      flex: 1,
      marginRight: spacing.sm,
    },
    pricePill: {
      backgroundColor: '#E5E7EB',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    pricePillText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
    },
    divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 16,
    },
    roomDetailScroll: {
      paddingVertical: 4,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    detailItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '48%',
      gap: 8,
    },
    iconOrange: {
      fontSize: 20,
      color: colors.primary, // Orange from theme
    },
    iconBlack: {
      fontSize: 20,
      color: '#000000',
    },
    detailTextBlack: {
      ...typography.body,
      color: '#000000',
      fontSize: 14,
      fontWeight: '500',
    },
    amenitiesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    amenityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    amenityIconOrange: {
      fontSize: 18,
      color: colors.primary,
    },
    amenityText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#1F2937',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bookBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    whatsappBtn: {
      width: 52,
      height: 52,
      backgroundColor: '#25D366',
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whatsappIcon: {
      fontSize: 28,
      color: '#FFFFFF',
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

      {/* Pill Filter Card */}
      <View style={styles.pillCard}>
        <TouchableOpacity style={styles.pillItem} onPress={() => setDatesModalVisible(true)}>
          <Icon name="calendar-outline" style={styles.pillIcon} />
          <Text style={styles.pillText} numberOfLines={1}>{checkInDisplay} - {checkOutDisplay}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pillItem} onPress={() => setGuestsModalVisible(true)}>
          <Icon name="person-outline" style={styles.pillIcon} />
          <Text style={styles.pillText} numberOfLines={1}>{totalAdults} {t('common.adults') || 'Adults'} & {totalChildren} {t('common.children') || 'Children'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('hotels.roomsList') || 'Available Rooms'}</Text>

      {/* Room List */}
      {isLoading || isFetching ? (
        <Loader />
      ) : (
        <FlatList
          data={combinations}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderCombination}
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
        onApply={(roomsConfig) => {
          setSearchParams(prev => ({...prev, roomsConfig}));
          setGuestsModalVisible(false);
        }}
        initialRoomsConfig={searchParams.roomsConfig}
      />
    </SafeAreaView>
  );
}
