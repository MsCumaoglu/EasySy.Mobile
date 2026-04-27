import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtomValue} from 'jotai';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {selectedHotelAtom} from '../state/hotelAtoms';
import {useHotelDetail} from '../hooks/useHotelDetail';
import {useFavorites} from '../hooks/useFavorites';
import {useHotelReviews} from '../hooks/useHotelReviews';
import {HotelTab} from '../types/hotelTypes';
import {formatCurrency} from '../../../core/utils/format';
import {useRTL} from '../../../core/hooks/useRTL';
import {useCurrency} from '../../../core/hooks/useCurrency';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';

// width constants moved inside component for dynamic orientation support

type HotelDetailNavProp = NativeStackNavigationProp<HotelStackParamList, 'HotelDetail'>;
type HotelDetailRouteProp = RouteProp<HotelStackParamList, 'HotelDetail'>;

const AMENITY_ICON_MAP: Record<string, string> = {
  pool: 'water-outline',
  wifi: 'wifi-outline',
  restaurant: 'restaurant-outline',
  parking: 'car-outline',
  spa: 'leaf-outline',
  gym: 'barbell-outline',
  ac: 'snow-outline',
  breakfast: 'cafe-outline',
};

const HotelDetailScreen: React.FC = () => {
  const navigation = useNavigation<HotelDetailNavProp>();
  const route = useRoute<HotelDetailRouteProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const {isRTL, flipIcon} = useRTL();
  const {width: screenWidth} = useWindowDimensions();
  const thumbSize = (screenWidth - 40 - 5) / 3;

  // Jotai atom provides instant initial data (no loading flash when navigating from list)
  const selectedHotel = useAtomValue(selectedHotelAtom);
  const hotelId = route.params.hotelId;

  // Cache-first hotel detail (SQLite → API fallback)
  const {data: hotel, isLoading: hotelLoading} = useHotelDetail(
    hotelId,
    selectedHotel,
  );

  const {formatPrice} = useCurrency();
  const [activeTab, setActiveTab] = useState<HotelTab>('detail');

  // Paginated reviews from the real API — fetch ONLY when reviews tab is active
  const {
    data: reviewsData,
    fetchNextPage: fetchNextReviews,
    hasNextPage: hasMoreReviews,
    isFetchingNextPage: isFetchingReviews,
    isLoading: isReviewsLoading,
  } = useHotelReviews(hotelId, activeTab === 'reviews');

  const reviews = reviewsData?.pages.flatMap(p => p.reviews) ?? [];

  // Offline-persistent favorites via SQLite
  const {isFavorite, toggle: toggleFavorite} = useFavorites(hotelId);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<FlatList>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const handleWhatsApp = () => {
    const phoneNumber = '+905000000000'; // Placeholder, ideally from hotel data if available
    const message = `Hello, I'm interested in booking ${hotel?.name}.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on your device');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},

    /* ── Top Header Bar ── */
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    },
    headerRightGroup: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerIcon: {fontSize: 22, color: colors.textPrimary},
    headerIconLiked: {fontSize: 22, color: '#E53E3E'},

    /* ── Info Card ── */
    infoCard: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: colors.background,
    },
    nameRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    hotelNameTop: {
      ...typography.title,
      color: colors.textPrimary,
      fontWeight: '700',
      flex: 1,
      marginRight: spacing.md,
    },
    ratingGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingValueText: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    ratingStarTop: {fontSize: 18, color: '#F5A623'},
    locationPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    locationLeftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationPinIcon: {fontSize: 16, color: colors.primary, marginRight: 4},
    locationTopText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 13,
    },
    priceBadge: {
      backgroundColor: '#FF8C00',
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    priceBadgeText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },

    /* ── Hero Image ── */
    heroWrapper: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      borderTopRightRadius: radius.xl,
      borderTopLeftRadius: radius.xl,
      overflow: 'hidden',
      height: 210,
    },
    heroImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.surface,
    },

    /* ── Thumbnail Grid ── */
    thumbGrid: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginTop: 5,
      gap: 6,
    },
    thumbWrapper: {
      width: thumbSize,
      height: thumbSize * 0.75,
      overflow: 'hidden',
    },
    thumbWrapperLast: {
      width: thumbSize,
      height: thumbSize * 0.75,
      borderBottomRightRadius: radius.xl,
      overflow: 'hidden',
    },
    thumbWrapperFirst: {
      width: thumbSize,
      height: thumbSize * 0.75,
      borderBottomLeftRadius: radius.xl,
      overflow: 'hidden',
    },

    thumbImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.surface,
    },
    thumbOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    thumbOverlayText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 18,
    },
    content: {paddingHorizontal: spacing.xl, paddingTop: spacing.lg},

    /* ── Lightbox Modal ── */
    lightboxModal: {
      flex: 1,
      backgroundColor: '#000',
    },
    lightboxImage: {
      width: screenWidth,
      height: '100%',
    },
    lightboxHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 52,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      zIndex: 10,
    },
    lightboxCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    lightboxCloseIcon: {fontSize: 24, color: '#fff'},
    lightboxCounter: {
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    lightboxCounterText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
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
    mapImage: {
      width: '100%',
      height: '100%',
      borderRadius: radius.xl,
    },
    mapOverlay: {
      position: 'absolute',
      bottom: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      elevation: 2,
    },
    mapExpandIcon: {
      fontSize: 14,
      color: colors.primary,
    },
    mapExpandText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '600',
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
    bookBtn: {flex: 1},
    whatsappBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#25D366',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.md,
    },
    whatsappIcon: {
      fontSize: 28,
      color: '#fff',
    },
    policyContainer: {
      marginTop: spacing.xl,
    },
    policyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    policyIcon: {
      fontSize: 18,
      color: colors.primary,
    },
    policyText: {
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 14,
    },
    policyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.md,
      gap: spacing.md,
    },
    policyGridItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      gap: 6,
    },
    policyGridIcon: {
      fontSize: 16,
      color: colors.primary,
    },
    policyDisabledIcon: {
      color: colors.border,
    },
    policyGridText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    cancellationBox: {
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: '#FFF5F5',
      borderRadius: radius.md,
      flexDirection: 'row',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: '#FED7D7',
    },
    cancellationIcon: {
      fontSize: 18,
      color: '#E53E3E',
    },
    cancellationText: {
      ...typography.caption,
      color: '#C53030',
      flex: 1,
      lineHeight: 18,
    },
  });

  if (hotelLoading || !hotel) {
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
                  <Icon name={AMENITY_ICON_MAP[a] || 'checkmark-circle-outline'} style={styles.amenityEmoji} />
                  <Text style={styles.amenityLabel}>{t(`hotels.${a}`)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>{t('hotels.mapPreview')}</Text>
            <TouchableOpacity 
              style={styles.mapContainer} 
              activeOpacity={0.9}
              onPress={() => {
                const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                const latLng = `${hotel.coordinates.latitude},${hotel.coordinates.longitude}`;
                const label = hotel.name;
                const url = Platform.select({
                  ios: `${scheme}${label}@${latLng}`,
                  android: `${scheme}${latLng}(${label})`
                });
                
                if (url) {
                  Linking.openURL(url);
                }
              }}
            >
              {hotel.coordinates.latitude !== 0 ? (
                <Image 
                  source={{ 
                    uri: `https://static-maps.yandex.ru/1.x/?ll=${hotel.coordinates.longitude},${hotel.coordinates.latitude}&z=14&l=map&size=600,300&pt=${hotel.coordinates.longitude},${hotel.coordinates.latitude},pm2rdl` 
                  }}
                  style={styles.mapImage}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Icon name="map-outline" style={styles.mapEmoji} />
                  <Text style={styles.mapLabel}>{hotel.location}</Text>
                </>
              )}
              <View style={styles.mapOverlay}>
                <Icon name="expand-outline" style={styles.mapExpandIcon} />
                <Text style={styles.mapExpandText}>{t('hotels.openInMaps')}</Text>
              </View>
            </TouchableOpacity>
          </>
        );
      case 'overview':
        return (
          <>
            <Text style={styles.sectionTitle}>{t('hotels.description')}</Text>
            <Text style={styles.descriptionText}>{hotel.description}</Text>

            {hotel.policy && (
              <View style={styles.policyContainer}>
                <Text style={styles.sectionTitle}>{t('hotels.policies')}</Text>
                
                <View style={[styles.policyRow, isRTL && {flexDirection: 'row-reverse'}]}>
                  <Icon name="time-outline" style={styles.policyIcon} />
                  <Text style={styles.policyText}>
                    {t('hotels.checkIn')}: {hotel.policy.checkInFrom} - {hotel.policy.checkInUntil}
                  </Text>
                </View>
                <View style={[styles.policyRow, isRTL && {flexDirection: 'row-reverse'}]}>
                  <Icon name="log-out-outline" style={styles.policyIcon} />
                  <Text style={styles.policyText}>
                    {t('hotels.checkOut')}: {hotel.policy.checkInUntil || hotel.policy.checkOutUntil}
                  </Text>
                </View>
                
                <View style={styles.policyGrid}>
                   <View style={styles.policyGridItem}>
                      <Icon name={hotel.policy.childrenAllowed ? 'happy-outline' : 'close-circle-outline'} 
                            style={[styles.policyGridIcon, !hotel.policy.childrenAllowed && styles.policyDisabledIcon]} />
                      <Text style={styles.policyGridText}>
                        {t('hotels.children')} {hotel.policy.childrenAllowed ? t('common.allowed') : t('common.notAllowed')}
                      </Text>
                   </View>
                   <View style={styles.policyGridItem}>
                      <Icon name={hotel.policy.petsAllowed ? 'paw-outline' : 'close-circle-outline'} 
                            style={[styles.policyGridIcon, !hotel.policy.petsAllowed && styles.policyDisabledIcon]} />
                      <Text style={styles.policyGridText}>
                        {t('hotels.pets')} {hotel.policy.petsAllowed ? t('common.allowed') : t('common.notAllowed')}
                      </Text>
                   </View>
                   <View style={styles.policyGridItem}>
                      <Icon name={hotel.policy.smokingAllowed ? 'smoking-outline' : 'close-circle-outline'} 
                            style={[styles.policyGridIcon, !hotel.policy.smokingAllowed && styles.policyDisabledIcon]} />
                      <Text style={styles.policyGridText}>
                        {t('hotels.smoking')} {hotel.policy.smokingAllowed ? t('common.allowed') : t('common.notAllowed')}
                      </Text>
                   </View>
                </View>
                
                {hotel.policy.cancellationPolicy && (
                   <View style={styles.cancellationBox}>
                      <Icon name="information-circle-outline" style={styles.cancellationIcon} />
                      <Text style={styles.cancellationText}>{hotel.policy.cancellationPolicy}</Text>
                   </View>
                )}
              </View>
            )}
          </>
        );
      case 'reviews':
        return (
          <>
            <Text style={styles.sectionTitle}>
              {t('hotels.reviews')} {reviews.length > 0 && `(${reviews.length})`}
            </Text>
            {isReviewsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : reviews.length === 0 ? (
              <Text style={styles.descriptionText}>{t('hotels.noReviews')}</Text>
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <View style={styles.reviewRating}>
                    <Icon name="star" style={styles.reviewRatingIcon} />
                    <Text style={styles.reviewRatingText}>
                      {review.overallRating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.content}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              ))
            )}
            {/* Load more reviews */}
            {hasMoreReviews && (
              <TouchableOpacity
                onPress={() => fetchNextReviews()}
                disabled={isFetchingReviews}
                style={{
                  alignItems: 'center',
                  paddingVertical: spacing.lg,
                }}>
                {isFetchingReviews
                  ? <ActivityIndicator color={colors.primary} />
                  : <Text style={{...typography.body, color: colors.primary, fontWeight: '600'}}>
                      {t('common.loadMore')}
                    </Text>
                }
              </TouchableOpacity>
            )}
          </>
        );
    }
  };

  /* ── Thumbnail helpers ── */
  const thumbImages = hotel.images.slice(0, 3);
  const extraCount = hotel.images.length - 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header Bar ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Icon name={flipIcon('chevron-back')} style={styles.headerIcon} />
        </TouchableOpacity>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => toggleFavorite(hotelId)}>
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              style={isFavorite ? styles.headerIconLiked : styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="share-social-outline" style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hotel Name + Rating ── */}
        <View style={styles.infoCard}>
          <View style={styles.nameRatingRow}>
            <Text style={styles.hotelNameTop} numberOfLines={1}>{hotel.name}</Text>
            <View style={styles.ratingGroup}>
              <Text style={styles.ratingValueText}>{hotel.rating.toFixed(1)}</Text>
              <Icon name="star" style={styles.ratingStarTop} />
            </View>
          </View>
          <View style={styles.locationPriceRow}>
            <View style={styles.locationLeftGroup}>
              <Icon name="location" style={styles.locationPinIcon} />
              <Text style={styles.locationTopText}>{hotel.location}</Text>
            </View>
            {hotel.priceMin > 0 && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {formatPrice(hotel.priceMin)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Hero Image ── */}
        <TouchableOpacity
          style={styles.heroWrapper}
          activeOpacity={0.92}
          onPress={() => openLightbox(activeImageIndex)}>
          <Image
            source={{uri: hotel.images[activeImageIndex]}}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ── Thumbnail Grid (3 columns) ── */}
        {hotel.images.length > 1 && (
          <View style={styles.thumbGrid}>
            {thumbImages.map((img, i) => {
              const isLast = i === 2 && extraCount > 0;
              return (
                <TouchableOpacity
                  key={i}
                  style={i === 0 ? styles.thumbWrapperFirst : i === 2 ? styles.thumbWrapperLast : styles.thumbWrapper}
                  activeOpacity={0.85}
                  onPress={() => {
                    setActiveImageIndex(i);
                    openLightbox(i);
                  }}>
                  <Image source={{uri: img}} style={styles.thumbImage} resizeMode="cover" />
                  {isLast && (
                    <View style={styles.thumbOverlay}>
                      <Text style={styles.thumbOverlayText}>+{extraCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.content}>
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

      {/* ── Lightbox Modal ── */}
      <Modal
        visible={lightboxVisible}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLightboxVisible(false)}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.lightboxModal}>
          {/* Header */}
          <View style={styles.lightboxHeader}>
            <TouchableOpacity
              style={styles.lightboxCloseBtn}
              onPress={() => setLightboxVisible(false)}>
              <Icon name="close" style={styles.lightboxCloseIcon} />
            </TouchableOpacity>
            <View style={styles.lightboxCounter}>
              <Text style={styles.lightboxCounterText}>
                {lightboxIndex + 1} / {hotel.images.length}
              </Text>
            </View>
          </View>

          {/* Swipeable images */}
          <FlatList
            ref={lightboxRef}
            data={hotel.images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={lightboxIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={e => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / screenWidth,
              );
              setLightboxIndex(idx);
            }}
            renderItem={({item}) => (
              <View style={{width: screenWidth, height: '100%', justifyContent: 'center'}}>
                <Image
                  source={{uri: item}}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label={t('common.rooms')}
          onPress={() => navigation.navigate('HotelRooms', {hotelId: hotel.id, hotelName: hotel.name})}
          style={styles.bookBtn}
          variant="filled"
        />
        <TouchableOpacity 
          style={styles.whatsappBtn} 
          onPress={handleWhatsApp}
          activeOpacity={0.8}
        >
          <Icon name="logo-whatsapp" style={styles.whatsappIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HotelDetailScreen;
