import React, {useState} from 'react';
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
import {useAtom} from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';
import SearchInput from '../../../shared/components/SearchInput';
import {hotelMockService} from '../services/hotelMockService';

type WhereToGoNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'WhereToGo'
>;

const POPULAR_DESTINATIONS = [
  {id: 'tartus', name: 'Tartus', country: 'Syria', icon: 'umbrella-outline'},
  {id: 'lattakia', name: 'Lattakia', country: 'Syria', icon: 'water-outline'},
  {id: 'damascus', name: 'Damascus', country: 'Syria', icon: 'location-outline'},
  {id: 'aleppo', name: 'Aleppo', country: 'Syria', icon: 'trail-sign-outline'},
  {id: 'jableh', name: 'Jableh', country: 'Syria', icon: 'boat-outline'},
];

const WhereToGoScreen: React.FC = () => {
  const navigation = useNavigation<WhereToGoNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [params, setParams] = useAtom(hotelSearchParamsAtom);
  const [query, setQuery] = useState(params.location);
  const recentSearches = hotelMockService.getRecentSearches();

  const selectLocation = (location: string) => {
    setParams(p => ({...p, location}));
    navigation.goBack();
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
      marginBottom: spacing.lg,
    },
    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    closeBtnText: {fontSize: 20, color: colors.textPrimary},
    headerTitle: {...typography.title, color: colors.textPrimary},
    content: {padding: spacing.xl},
    sectionLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    currentLocationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary + '30',
      marginBottom: spacing.sm,
    },
    currentLocIcon: {
      fontSize: 20,
      marginRight: spacing.md,
      color: colors.primary,
    },
    currentLocText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    recentIcon: {fontSize: 18, marginRight: spacing.md, color: colors.textSecondary},
    recentText: {...typography.body, color: colors.textPrimary},
    popularGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    popularItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    popularEmoji: {fontSize: 30, marginBottom: spacing.sm, color: colors.primary},
    popularName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
    },
    popularCountry: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="close" style={styles.closeBtnText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('hotels.whereToGo')}</Text>
        </View>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('hotels.whereToGoPlaceholder')}
          leftIconName="search-outline"
        />
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Current Location */}
            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={() => selectLocation('Current Location')}
              activeOpacity={0.7}>
              <Icon name="location-outline" style={styles.currentLocIcon} />
              <Text style={styles.currentLocText}>
                {t('hotels.currentLocation')}
              </Text>
            </TouchableOpacity>

            {/* Recent Searches */}
            <Text style={styles.sectionLabel}>{t('hotels.recentSearches')}</Text>
            {recentSearches.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.recentItem}
                onPress={() => selectLocation(item)}
                activeOpacity={0.7}>
                <Icon name="time-outline" style={styles.recentIcon} />
                <Text style={styles.recentText}>{item}</Text>
              </TouchableOpacity>
            ))}

            {/* Popular Destinations */}
            <Text style={styles.sectionLabel}>Popular Destinations</Text>
            <View style={styles.popularGrid}>
              {POPULAR_DESTINATIONS.map(dest => (
                <TouchableOpacity
                  key={dest.id}
                  style={styles.popularItem}
                  onPress={() => selectLocation(dest.name)}
                  activeOpacity={0.7}>
                  <Icon name={dest.icon} style={styles.popularEmoji} />
                  <Text style={styles.popularName}>{dest.name}</Text>
                  <Text style={styles.popularCountry}>{dest.country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={() => null}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default WhereToGoScreen;
