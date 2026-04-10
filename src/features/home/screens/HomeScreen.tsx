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
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import {RootStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {appThemeAtom} from '../../../state/appAtoms';
import HomeButtonCard from '../components/HomeButtonCard';
import Icon from 'react-native-vector-icons/Ionicons';

const hotelImage = require('../../../assets/images/home/hotel.png');
const busImage = require('../../../assets/images/home/bus.png');
const toursImage = require('../../../assets/images/home/history.png');
const logoImage = require('../../../assets/images/home/logo.png');

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const [theme, setTheme] = useAtom(appThemeAtom);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      marginBottom: spacing.xxl,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 24,
      color: colors.textPrimary,
    },
    logoContainer: {
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.xxl,
    },
    logoImage: {
      width: 200,
      height: 80,
      resizeMode: 'contain',
      marginBottom: spacing.lg,
    },
    sloganContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sloganText: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 18,
    },
    sloganHighlight: {
      ...typography.subtitle,
      color: colors.primary,
      fontWeight: '800',
      fontSize: 18,
      marginLeft: 4,
    },
    categoriesSection: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
    },
    gridContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    gridItem: {
      flex: 1,
    },
    gridSpacer: {
      width: spacing.lg,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Top Row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="settings-outline" style={styles.iconText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} style={styles.iconText} />
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logoImage} />
          <View style={styles.sloganContainer}>
            <Text style={styles.sloganText}>Travel And Explore</Text>
            <Text style={styles.sloganHighlight}>SYRIA</Text>
          </View>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesSection}>
          <View style={styles.gridContainer}>
            <HomeButtonCard
              variant="vertical"
              image={hotelImage}
              title={t('home.hotels')}
              description="Boutique riads & modern stays"
              onPress={() => navigation.navigate('HotelStack', {screen: 'SearchHotels'})}
              style={styles.gridItem}
            />
            <View style={styles.gridSpacer} />
            <HomeButtonCard
              variant="vertical"
              image={busImage}
              title={t('home.buses')}
              description="Reliable inter-city Levant travel"
              onPress={() => navigation.navigate('BusStack', {screen: 'SearchBus'})}
              style={styles.gridItem}
            />
          </View>

          <HomeButtonCard
            variant="horizontal"
            image={toursImage}
            title={t('home.tours')}
            description="Curated itineraries for the modern nomadic soul."
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
