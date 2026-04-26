import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
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

  const CombinationCard = ({item, index}: {item: RoomCombinationItem; index: number}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const groupedRooms = Object.values(
      item.rooms.reduce((acc: Record<string, any>, room) => {
        if (!acc[room.roomType]) {
          acc[room.roomType] = { ...room, count: 1 };
        } else {
          acc[room.roomType].count += 1;
        }
        return acc;
      }, {})
    );

    const isSingleType = groupedRooms.length === 1;

    const onScroll = (event: any) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const offset = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offset / slideSize);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    const renderRoomItem = (room: any, rIdx: number) => {
      const roomTitle = t(`common.${room.roomType.toLowerCase()}`, {defaultValue: room.roomType.replace(/_/g, ' ')});
      const displayTitle = room.count > 1 ? `${roomTitle} × ${room.count}` : roomTitle;
      const displayPrice = room.pricePerNight * room.count;

      return (
        <View key={room.roomId + rIdx} style={[styles.innerRoomCard, !isSingleType && {width: SCREEN_WIDTH - spacing.lg * 2}]}>
          {/* Room Header */}
          <View style={styles.innerRoomHeader}>
            <Text style={styles.innerRoomName}>{displayTitle}</Text>
            <View style={styles.innerPricePill}>
              <Text style={styles.innerPricePillText}>{formatPrice(displayPrice)}</Text>
            </View>
          </View>
          
          <View style={styles.innerDivider} />

          {/* Row 1: Max Adults & Children */}
          <View style={styles.detailRow}>
            <View style={styles.detailItemRow}>
              <Icon name="person" style={styles.iconOrange} />
              <Text style={styles.detailTextBlack}>Max Adult {room.maxAdults}</Text>
            </View>
            <View style={styles.detailItemRow}>
              <Icon name="happy" style={styles.iconOrange} />
              <Text style={styles.detailTextBlack}>Max Children {room.maxChildren}</Text>
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
      );
    };

    return (
      <View style={styles.combinationCard}>
        {/* Header */}
        <View style={styles.combinationHeader}>
          <Text style={styles.combinationName}>Öneri {index + 1} ({item.rooms.length} oda)</Text>
          <View style={styles.combinationPricePill}>
            <Text style={styles.combinationPricePillText}>{formatPrice(item.totalPrice)} {t('hotels.total', {defaultValue: 'Total'})}</Text>
          </View>
        </View>

        {/* Room Details */}
        <View style={styles.combinationBody}>
          {isSingleType ? (
            renderRoomItem(groupedRooms[0], 0)
          ) : (
            <>
              <FlatList
                data={groupedRooms}
                keyExtractor={(_, idx) => idx.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                renderItem={({item: room, index: rIdx}) => renderRoomItem(room, rIdx)}
              />
              <View style={styles.sliderDots}>
                {groupedRooms.map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.combinationDivider} />

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
    combinationCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      overflow: 'hidden',
    },
    combinationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    combinationName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#000000',
      flex: 1,
    },
    combinationPricePill: {
      backgroundColor: '#E5E7EB',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    combinationPricePillText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#374151',
    },
    combinationBody: {
      backgroundColor: '#FFFFFF',
      paddingBottom: spacing.md,
    },
    combinationDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginHorizontal: spacing.lg,
    },
    innerRoomCard: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      width: '100%',
    },
    innerRoomCardSlider: {
      width: 340, // Adjusted for typical phone width
    },
    innerRoomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    innerRoomName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#000000',
      flex: 1,
    },
    innerPricePill: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
    },
    innerPricePillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#374151',
    },
    innerDivider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    detailItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '48%',
      gap: 6,
    },
    iconOrange: {
      fontSize: 16,
      color: colors.primary,
    },
    iconBlack: {
      fontSize: 16,
      color: '#000000',
    },
    detailTextBlack: {
      fontSize: 11,
      fontWeight: '600',
      color: '#374151',
    },
    amenitiesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    amenityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 4,
    },
    amenityIconOrange: {
      fontSize: 14,
      color: colors.primary,
    },
    amenityText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#374151',
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      gap: 16,
    },
    bookBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    bookBtnText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    whatsappBtn: {
      width: 56,
      height: 56,
      backgroundColor: '#25D366',
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },
    whatsappIcon: {
      fontSize: 32,
      color: '#FFFFFF',
    },
    sliderDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#E5E7EB',
    },
    dotActive: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.primary,
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
          renderItem={({item, index}) => <CombinationCard item={item} index={index} />}
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
