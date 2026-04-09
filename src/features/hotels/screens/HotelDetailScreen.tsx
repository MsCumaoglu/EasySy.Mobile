import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtomValue} from 'jotai';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {selectedHotelAtom} from '../state/hotelAtoms';
import {hotelMockService} from '../services/hotelMockService';
import {HotelReview} from '../models/Hotel';
import {HotelTab} from '../types/hotelTypes';
import {formatCurrency} from '../../../core/utils/format';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';

type HotelDetailNavProp = NativeStackNavigationProp<HotelStackParamList, 'HotelDetail'>;
type HotelDetailRouteProp = RouteProp<HotelStackParamList, 'HotelDetail'>;

const AMENITY_MAP: Record<string, {icon: string; label: string}> = {
  pool: {icon: 'water-outline', label: 'Pool'},
  wifi: {icon: 'wifi-outline', label: 'Free WiFi'},
  restaurant: {icon: 'restaurant-outline', label: 'Restaurant'},
  parking: {icon: 'car-outline', label: 'Parking'},
  spa: {icon: 'leaf-outline', label: 'Spa'},
  gym: {icon: 'barbell-outline', label: 'Gym'},
  ac: {icon: 'snow-outline', label: 'AC'},
  breakfast: {icon: 'cafe-outline', label: 'Breakfast'},
};

const HotelDetailScreen: React.FC = () => {
  const navigation = useNavigation<HotelDetailNavProp>();
  const route = useRoute<HotelDetailRouteProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const selectedHotel = useAtomValue(selectedHotelAtom);
  const [activeTab, setActiveTab] = useState<HotelTab>('detail');
  const [reviews, setReviews] = useState<HotelReview[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hotel = selectedHotel;

  useEffect(() => {
    if (hotel) {
      hotelMockService.getHotelReviews(hotel.id).then(setReviews);
    }
  }, [hotel]);

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    imageContainer: {position: 'relative', height: 280},
    heroImage: {width: '100%', height: 280, backgroundColor: colors.surface},
    backBtnOverlay: {
      position: 'absolute',
      top: spacing.xl,
      left: spacing.xl,
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {fontSize: 22, color: 'white'},
    imageDots: {
      position: 'absolute',
      bottom: spacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
      backgroundColor: colors.white,
      width: 18,
    },
    thumbnailRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    thumbnail: {
      width: 60,
      height: 50,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    activeThumbnail: {
      borderColor: colors.primary,
    },
    content: {paddingHorizontal: spacing.xl, paddingTop: spacing.lg},
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    hotelName: {
      ...typography.title,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.md,
    },
    ratingBadge: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingIcon: {fontSize: 12, color: colors.white},
    ratingText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '700',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    locationIcon: {fontSize: 14, marginRight: 4, color: colors.textSecondary},
    locationText: {...typography.body, color: colors.textSecondary},
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: 4,
      marginBottom: spacing.xl,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: radius.md,
    },
    activeTab: {
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: '700',
    },
    sectionTitle: {
      ...typography.subtitle,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    descriptionText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    amenitiesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    amenityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    amenityEmoji: {fontSize: 18, color: colors.primary},
    amenityLabel: {...typography.body, color: colors.textPrimary},
    mapContainer: {
      height: 160,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapEmoji: {fontSize: 40, color: colors.textSecondary},
    mapLabel: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    mapCoords: {
      ...typography.caption,
      color: colors.primary,
      marginTop: 4,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    reviewAuthor: {...typography.body, color: colors.textPrimary, fontWeight: '600'},
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    reviewRatingIcon: {fontSize: 10, color: colors.primary},
    reviewRatingText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '700',
    },
    reviewComment: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    reviewDate: {
      ...typography.caption,
      color: colors.border,
      marginTop: spacing.sm,
    },
    footer: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerPrice: {},
    footerPriceLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    footerPriceValue: {
      ...typography.title,
      color: colors.primary,
    },
    bookBtn: {flex: 1, marginLeft: spacing.lg},
  });

  if (!hotel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader />
      </SafeAreaView>
    );
  }

  const TABS: {key: HotelTab; label: string}[] = [
    {key: 'detail', label: t('hotels.tabs.detail')},
    {key: 'overview', label: t('hotels.tabs.overview')},
    {key: 'reviews', label: t('hotels.tabs.reviews')},
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'detail':
        return (
          <>
            <Text style={styles.sectionTitle}>{t('hotels.amenities')}</Text>
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map(a => (
                <View key={a} style={styles.amenityItem}>
                  <Icon name={AMENITY_MAP[a]?.icon || 'checkmark-circle-outline'} style={styles.amenityEmoji} />
                  <Text style={styles.amenityLabel}>{AMENITY_MAP[a]?.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>{t('hotels.mapPreview')}</Text>
            <View style={styles.mapContainer}>
              <Icon name="map-outline" style={styles.mapEmoji} />
              <Text style={styles.mapLabel}>{hotel.location}</Text>
              <Text style={styles.mapCoords}>
                {hotel.coordinates.latitude.toFixed(4)}°N,{' '}
                {hotel.coordinates.longitude.toFixed(4)}°E
              </Text>
            </View>
          </>
        );
      case 'overview':
        return (
          <>
            <Text style={styles.sectionTitle}>{t('hotels.description')}</Text>
            <Text style={styles.descriptionText}>{hotel.description}</Text>
          </>
        );
      case 'reviews':
        return (
          <>
            <Text style={styles.sectionTitle}>
              {t('hotels.reviews')} ({reviews.length})
            </Text>
            {reviews.length === 0 && (
              <Text style={styles.descriptionText}>No reviews yet.</Text>
            )}
            {reviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <View style={styles.reviewRating}>
                    <Icon name="star" style={styles.reviewRatingIcon} />
                    <Text style={styles.reviewRatingText}>
                      {review.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            ))}
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: hotel.images[activeImageIndex]}}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backBtnOverlay}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" style={styles.backIcon} />
          </TouchableOpacity>
          {hotel.images.length > 1 && (
            <View style={styles.imageDots}>
              {hotel.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImageIndex && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnails */}
        {hotel.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}>
            {hotel.images.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImageIndex(i)}>
                <Image
                  source={{uri: img}}
                  style={[
                    styles.thumbnail,
                    i === activeImageIndex && styles.activeThumbnail,
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Hotel Name + Rating */}
          <View style={styles.nameRow}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.ratingBadge}>
              <Icon name="star" style={styles.ratingIcon} />
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon name="location" style={styles.locationIcon} />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.activeTabText,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>per night</Text>
          <Text style={styles.footerPriceValue}>
            {formatCurrency(hotel.priceMin)}
          </Text>
        </View>
        <PrimaryButton
          label={t('common.bookNow')}
          onPress={() => {}}
          style={styles.bookBtn}
        />
      </View>
    </SafeAreaView>
  );
};

export default HotelDetailScreen;
