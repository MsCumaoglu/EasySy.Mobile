import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {appThemeAtom} from '../../../state/appAtoms';
import {userAtom, isGuestAtom} from '../../../core/auth/authAtoms';
import {authService} from '../../../core/auth/authService';
import {useProfile} from '../hooks/useProfile';
import {useRTL} from '../../../core/hooks/useRTL';
import HomeButtonCard from '../components/HomeButtonCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { Modal, TouchableWithoutFeedback, SafeAreaView as RNSafeAreaView } from 'react-native';

const hotelImage = require('../../../assets/images/home/hotel.png');
const busImage   = require('../../../assets/images/home/bus.png');
const toursImage = require('../../../assets/images/home/history.png');
const logoImage  = require('../../../assets/images/home/logo.png');
const adminImage = require('../../../assets/images/home/admin.png');

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const [user, setUser] = useAtom(userAtom);
  const [, setGuest] = useAtom(isGuestAtom);
  const {data: profile} = useProfile();
  const {isRTL, flipIcon} = useRTL();
  const handleLoginNav = () => {
    setGuest(false);
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      marginBottom: spacing.xxl,
    },
    iconButton: {
      width: 40, height: 40,
      alignItems: 'center', justifyContent: 'center',
    },
    iconText: {fontSize: 24, color: colors.textPrimary},
    logoContainer: {
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.xxl,
    },
    logoImage: {
      width: 200, height: 80,
      resizeMode: 'contain', marginBottom: spacing.lg,
    },
    sloganContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sloganText: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '800', fontSize: 18,
    },
    sloganHighlight: {
      ...typography.subtitle,
      color: colors.primary,
      fontWeight: '800', fontSize: 18,
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
    },
    categoriesSection: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    gridContainer: {
      flex: 1.4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    gridItem: {flex: 1},
    gridSpacer: {width: spacing.lg},
    

  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header Top Row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={[styles.iconButton, {alignItems: 'flex-start'}]} onPress={() => {
            if (user) {
              navigation.navigate('ProfileMenu' as any);
            } else {
              handleLoginNav();
            }
          }}>
            {user ? (
              <Image 
                source={{uri: user.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}} 
                style={{width: 36, height: 36, borderRadius: 18}} 
              />
            ) : (
              <Icon name="person-circle" style={{fontSize: 36, color: colors.primary}} />
            )}
          </TouchableOpacity>
          <View style={{flex: 1}} />
          <TouchableOpacity style={[styles.iconButton, {alignItems: 'flex-end'}]} onPress={() => {
            // TODO: Navigate to Notifications
          }}>
            <Icon name="notifications-outline" style={styles.iconText} />
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logoImage} />
          <View style={styles.sloganContainer}>
            <Text style={styles.sloganText}>{t('home.slogan')}</Text><Text style={styles.sloganHighlight}>{t('home.sloganHighlight')}</Text>
          </View>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesSection}>
          <View style={styles.gridContainer}>
            <HomeButtonCard
              variant="vertical"
              image={hotelImage}
              title={t('home.hotels')}
              description={t('home.hotelsDesc')}
              onPress={() => navigation.navigate('HotelStack', {screen: 'SearchHotels'})}
              style={styles.gridItem}
            />
            <View style={styles.gridSpacer} />
            <HomeButtonCard
              variant="vertical"
              image={busImage}
              title={t('home.buses')}
              description={t('home.busesDesc')}
              onPress={() => navigation.navigate('BusStack', {screen: 'SearchBus'})}
              style={styles.gridItem}
            />
          </View>

          <HomeButtonCard
            variant="horizontal"
            image={toursImage}
            title={t('home.tours')}
            description={t('home.toursDesc')}
            onPress={() => {}}
          />

          {!!user && !!profile?.role && profile.role !== 'CONSUMER' ? (
            <View style={{ marginTop: spacing.lg, flex: 1 }}>
              <HomeButtonCard
                variant="horizontal"
                image={adminImage}
                title={t('home.management', {defaultValue: 'Yönetim'})}
                description={
                  profile.role === 'SUPER_ADMIN'
                    ? t('home.adminSuperDesc', {defaultValue: 'Herşeyi yönet'})
                    : t('home.adminOwnerDesc', {defaultValue: 'Organizasyonunu yönet'})
                }
                onPress={() => navigation.navigate('Management')}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
