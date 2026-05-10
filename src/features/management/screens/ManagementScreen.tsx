import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtomValue} from 'jotai';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {userAtom} from '../../../core/auth/authAtoms';
import {useProfile} from '../../home/hooks/useProfile';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {RootStackParamList} from '../../../app/navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Management'>;

// Management images
const imgDashboard     = require('../../../assets/images/Managment/dashboard.png');
const imgHotelDash     = require('../../../assets/images/Managment/hotel_dashboard.png');
const imgHotelInfo     = require('../../../assets/images/Managment/hotel_managment.png');
const imgHotelReviews  = require('../../../assets/images/Managment/hotel_reviews.png');
const imgHotelBookings = require('../../../assets/images/Managment/hotel_bokkings.png');
const imgHotelEmployers= require('../../../assets/images/Managment/hotel_employers.png');
const imgBusManagement = require('../../../assets/images/home/bus.png');
const imgBusDashboard  = require('../../../assets/images/Managment/bus_dashboard.png');
const imgBusReviews    = require('../../../assets/images/Managment/bus_reviews.png');
const imgUsers         = require('../../../assets/images/Managment/users.png');
const imgSettings      = require('../../../assets/images/Managment/settings.png');
const imgHotel         = require('../../../assets/images/Managment/hotel.png');

interface ManagementItem {
  key: string;
  titleKey: string;
  descKey: string;
  image: ImageSourcePropType;
  onPress: () => void;
}

const ManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const {data: profile} = useProfile();

  const role = profile?.role;

  // ── Item sets per role ──────────────────────────────────────────
  const superAdminItems: ManagementItem[] = [
    {
      key: 'dashboard',
      titleKey: 'management.dashboard',
      descKey: 'management.dashboardDesc',
      image: imgDashboard,
      onPress: () => {},
    },
    {
      key: 'hotels',
      titleKey: 'management.hotels',
      descKey: 'management.hotelsDesc',
      image: imgHotel,
      onPress: () => {},
    },
    {
      key: 'buses',
      titleKey: 'management.buses',
      descKey: 'management.busesDesc',
      image: imgBusManagement,
      onPress: () => {},
    },
    {
      key: 'users',
      titleKey: 'management.users',
      descKey: 'management.usersDesc',
      image: imgUsers,
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      key: 'settings',
      titleKey: 'management.settings',
      descKey: 'management.settingsDesc',
      image: imgSettings,
      onPress: () => {},
    },
  ];

  const hotelOwnerItems: ManagementItem[] = [
    {
      key: 'dashboard',
      titleKey: 'management.dashboard',
      descKey: 'management.hotelDashDesc',
      image: imgHotelDash,
      onPress: () => {},
    },
    {
      key: 'hotelInfo',
      titleKey: 'management.hotelInfo',
      descKey: 'management.hotelInfoDesc',
      image: imgHotelInfo,
      onPress: () => {},
    },
    {
      key: 'reviews',
      titleKey: 'management.reviews',
      descKey: 'management.reviewsDesc',
      image: imgHotelReviews,
      onPress: () => {},
    },
    {
      key: 'bookings',
      titleKey: 'management.bookings',
      descKey: 'management.bookingsDesc',
      image: imgHotelBookings,
      onPress: () => {},
    },
    {
      key: 'employers',
      titleKey: 'management.employers',
      descKey: 'management.employersDesc',
      image: imgHotelEmployers,
      onPress: () => {},
    },
  ];

  const busOwnerItems: ManagementItem[] = [
    {
      key: 'dashboard',
      titleKey: 'management.dashboard',
      descKey: 'management.busDashDesc',
      image: imgBusDashboard,
      onPress: () => {},
    },
    {
      key: 'busManagement',
      titleKey: 'management.busManagement',
      descKey: 'management.busManagementDesc',
      image: imgBusManagement,
      onPress: () => {},
    },
    {
      key: 'reviews',
      titleKey: 'management.reviews',
      descKey: 'management.busReviewsDesc',
      image: imgBusReviews,
      onPress: () => {},
    },
  ];

  const getItems = (): ManagementItem[] => {
    switch (role) {
      case 'SUPER_ADMIN': return superAdminItems;
      case 'HOTEL_OWNER': return hotelOwnerItems;
      case 'BUS_OWNER':   return busOwnerItems;
      default:            return hotelOwnerItems;
    }
  };

  const getTitleKey = (): string => {
    switch (role) {
      case 'SUPER_ADMIN': return 'management.superAdminTitle';
      case 'BUS_OWNER':   return 'management.busOwnerTitle';
      default:            return 'management.hotelOwnerTitle';
    }
  };

  const items = getItems();

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    content: {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md},
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      width: '47%',
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardImage: {
      width: 90,
      height: 90,
      resizeMode: 'contain',
      marginBottom: spacing.sm,
    },
    cardTitle: {
      ...typography.body,
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 4,
    },
    cardDesc: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScreenHeader title={t(getTitleKey())} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {items.map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.card}
              onPress={item.onPress}
              activeOpacity={0.85}>
              <Image source={item.image} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.cardDesc}>{t(item.descKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagementScreen;
