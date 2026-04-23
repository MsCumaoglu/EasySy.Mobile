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
    return (
      <View style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={{flex: 1}}>
            <Text style={styles.roomName}>{t('hotels.option', {defaultValue: 'Option'})} {index + 1}</Text>
            <Text style={styles.roomPrice}>
              {formatPrice(item.totalPrice)} <Text style={styles.perNight}>{t('hotels.totalPrice', {defaultValue: 'Total'})}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.roomDetailScroll}>
          {item.rooms.map((room, rIdx) => (
            <View key={room.roomId + rIdx} style={{marginBottom: 12, paddingBottom: 12, borderBottomWidth: rIdx < item.rooms.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: colors.border}}>
              <Text style={{...typography.subtitle, fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6}}>
                {t(`common.${room.roomType.toLowerCase()}`, {defaultValue: room.roomType.replace('_', ' ')})} Room
              </Text>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Icon name="bed-outline" style={styles.detailIcon} />
                  <Text style={styles.detailText}>{t(`common.${room.bedType.toLowerCase()}`, {defaultValue: room.bedType.replace('_', ' ')})}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="eye-outline" style={styles.detailIcon} />
                  <Text style={styles.detailText}>{t(`common.${room.viewType.toLowerCase()}`, {defaultValue: room.viewType.replace('_', ' ')})}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="people-outline" style={styles.detailIcon} />
                  <Text style={styles.detailText}>{room.assignedAdults} {t('common.adults', {defaultValue: 'Adults'})} {room.assignedChildren > 0 ? `& ${room.assignedChildren} ${t('common.children', {defaultValue: 'Children'})}` : ''}</Text>
                </View>
              </View>
              
              <View style={styles.roomFeatures}>
                {room.hasPrivateBathroom && (
                  <View style={styles.featureTag}>
                    <Icon name="water-outline" size={14} color={colors.primary} />
                    <Text style={styles.featureText}>Private Bath</Text>
                  </View>
                )}
                {room.hasAirConditioning && (
                  <View style={styles.featureTag}>
                    <Icon name="snow-outline" size={14} color={colors.primary} />
                    <Text style={styles.featureText}>AC</Text>
                  </View>
                )}
                {room.hasBalcony && (
                  <View style={styles.featureTag}>
                    <Icon name="storefront-outline" size={14} color={colors.primary} />
                    <Text style={styles.featureText}>Balcony</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bookNowContainer}>
          <PrimaryButton
            label={t('common.bookNow') || 'Book Now'}
            onPress={() => {}} // Booking flow will be added later
            style={styles.bookNowBtn}
          />
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
