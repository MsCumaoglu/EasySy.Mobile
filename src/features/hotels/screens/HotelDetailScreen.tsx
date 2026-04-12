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
import {hotelRepository} from '../services/hotelRepository';
import {HotelReview} from '../models/Hotel';
import {HotelTab} from '../types/hotelTypes';
import {formatCurrency} from '../../../core/utils/format';
import {useRTL} from '../../../core/hooks/useRTL';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_WIDTH - 40 - 5) / 3; // 16px side padding x2 + 2 gaps x4

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

  // Jotai atom provides instant initial data (no loading flash when navigating from list)
  const selectedHotel = useAtomValue(selectedHotelAtom);
  const hotelId = route.params.hotelId;

  // Cache-first hotel detail (SQLite → API fallback)
  const {data: hotel, isLoading: hotelLoading} = useHotelDetail(
    hotelId,
    selectedHotel,
  );

  // Cache-first reviews
  const {data: reviews = []} = useQuery<HotelReview[]>({
    queryKey: ['hotels', 'reviews', hotelId],
    queryFn: () => hotelRepository.getHotelReviews(hotelId),
    staleTime: 30 * 60 * 1000,
    enabled: !!hotelId,
  });

  // Offline-persistent favorites via SQLite
  const {isFavorite, toggle: toggleFavorite} = useFavorites(hotelId);

  const [activeTab, setActiveTab] = useState<HotelTab>('detail');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<FlatList>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
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
      width: THUMB_SIZE,
      height: THUMB_SIZE * 0.75,
      overflow: 'hidden',
    },
    thumbWrapperLast: {
      width: THUMB_SIZE,
      height: THUMB_SIZE * 0.75,
      borderBottomRightRadius: radius.xl,
      overflow: 'hidden',
    },
    thumbWrapperFirst: {
      width: THUMB_SIZE,
      height: THUMB_SIZE * 0.75,
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
      width: SCREEN_WIDTH,
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
              <Text style={styles.descriptionText}>{t('hotels.noReviews')}</Text>
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
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {hotel.priceMin}$ - {hotel.priceMax}$
              </Text>
            </View>
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
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={e => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setLightboxIndex(idx);
            }}
            renderItem={({item}) => (
              <View style={{width: SCREEN_WIDTH, height: '100%', justifyContent: 'center'}}>
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
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>{t('common.perNight')}</Text>
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
