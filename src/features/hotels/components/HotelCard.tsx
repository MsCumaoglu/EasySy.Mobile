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
  const [liked, setLiked] = useState(false);

  const displayAmenities = hotel.amenities.slice(0, 4);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      marginBottom: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
    },
    imageWrapper: {
      width: '100%',
      height: 200,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.surface,
    },
    topOverlay: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      right: spacing.md,
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
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
      bottom: spacing.md,
      right: spacing.md,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
    content: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    name: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
      flex: 1,
      marginRight: spacing.sm,
    },
    pricePill: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    priceText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    locationRow: {
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
      fontSize: 14,
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
      gap: spacing.sm,
    },
    amenityIconCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    amenityIcon: {
      fontSize: 15,
      color: colors.primary,
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
        {/* Name + Price */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>
              {hotel.priceMin}$ - {hotel.priceMax}$
            </Text>
          </View>
        </View>

        {/* Location + Amenities */}
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <Icon name="location" style={styles.locationIcon} />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>
          <View style={styles.amenityRow}>
            {displayAmenities.map(a => (
              <View key={a} style={styles.amenityIconCircle}>
                <Icon
                  name={AMENITY_ICONS[a] || 'checkmark-circle-outline'}
                  style={styles.amenityIcon}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HotelCard;
