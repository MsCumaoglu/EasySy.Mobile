import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {Hotel} from '../models/Hotel';
import Icon from 'react-native-vector-icons/Ionicons';
import {useCurrency} from '../../../core/hooks/useCurrency';
import {useTranslation} from 'react-i18next';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
  style?: ViewStyle;
}

const AMENITY_ICONS: Record<string, string> = {
  pool: 'water-outline',
  wifi: 'wifi-outline',
  restaurant: 'restaurant-outline',
  parking: 'car-outline',
  spa: 'leaf-outline',
  gym: 'barbell-outline',
  ac: 'snow-outline',
  breakfast: 'cafe-outline',
};

const HotelCard: React.FC<HotelCardProps> = ({hotel, onPress, style}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {formatPrice} = useCurrency();
  const {t} = useTranslation();
  const [liked, setLiked] = useState(false);

  const displayAmenities = hotel.amenities.slice(0, 3);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      marginBottom: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      overflow: 'hidden',
    },

    /* ── Image Section ── */
    imageWrapper: {
      width: '100%',
      height: 210,
      position: 'relative',
    },
    image: {
      width: '94%',
      height: '92%',
      alignSelf: 'center',
      marginTop: 8,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    topOverlay: {
      position: 'absolute',
      top: spacing.md + 2,
      left: spacing.md + 4,
      right: spacing.md + 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    iconBtn: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    iconBtnLiked: {
      fontSize: 18,
      color: '#E53E3E',
    },
    ratingBadge: {
      position: 'absolute',
      bottom: spacing.md + 4,
      right: spacing.md + 6,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    ratingText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    ratingStarIcon: {
      fontSize: 13,
      color: colors.textPrimary,
    },

    /* ── Content Section ── */
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    nameStarsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 8,
    },
    name: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
    categoryStars: {
      flexDirection: 'row',
      gap: 1,
    },
    catStar: {
      fontSize: 13,
      color: '#F5A623',
    },
    locationAmenityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    locationLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationIcon: {
      fontSize: 15,
      color: colors.primary,
      marginRight: 4,
    },
    locationText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    amenityRow: {
      flexDirection: 'row',
      gap: 6,
    },
    amenityIcon: {
      fontSize: 18,
      color: colors.primary,
    },

    /* ── Price Footer ── */
    priceFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.sm,
    },
    priceLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    priceValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    priceValue: {
      ...typography.title,
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 20,
    },
    priceUnit: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Image + Overlays */}
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: hotel.images[0]}}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Top: heart + share */}
        <View style={styles.topOverlay}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => setLiked(l => !l)}
            activeOpacity={0.8}>
            <Icon
              name={liked ? 'heart' : 'heart-outline'}
              style={liked ? styles.iconBtnLiked : styles.iconBtn}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8}>
            <Icon name="share-social-outline" style={styles.iconBtn} />
          </TouchableOpacity>
        </View>
        {/* Bottom-right: rating */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
          <Icon name="star" style={styles.ratingStarIcon} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Hotel Name + Category Stars */}
        <View style={styles.nameStarsRow}>
          <Text style={styles.name} numberOfLines={1}>{hotel.name}</Text>
          <View style={styles.categoryStars}>
            {Array.from({length: hotel.starRating || 0}).map((_, i) => (
              <Icon key={`s-${i}`} name="star" style={styles.catStar} />
            ))}
          </View>
        </View>

        {/* Location + Amenities */}
        <View style={styles.locationAmenityRow}>
          <View style={styles.locationLeft}>
            <Icon name="location" style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>{hotel.location}</Text>
          </View>
          <View style={styles.amenityRow}>
            {displayAmenities.map(a => (
              <Icon
                key={a}
                name={AMENITY_ICONS[a] || 'checkmark-circle-outline'}
                style={styles.amenityIcon}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Price Footer */}
      <View style={styles.priceFooter}>
        <Text style={styles.priceLabel}>{t('hotels.totalCheapestPrice')}</Text>
        <View style={styles.priceValueRow}>
          <Text style={styles.priceValue}>{formatPrice(hotel.priceMin)}</Text>
          <Text style={styles.priceUnit}>{t('hotels.perNight')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HotelCard;
