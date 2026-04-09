import React from 'react';
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
import {formatCurrency} from '../../../core/utils/format';
import Icon from 'react-native-vector-icons/Ionicons';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
  style?: ViewStyle;
}

const HotelCard: React.FC<HotelCardProps> = ({hotel, onPress, style}) => {
  const {colors, spacing, radius, typography} = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      marginBottom: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: {
      width: '100%',
      height: 190,
      backgroundColor: colors.surface,
    },
    ratingBadge: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      ...typography.caption,
      color: colors.white,
      fontWeight: '700',
    },
    ratingIcon: {fontSize: 10, color: colors.white},
    content: {padding: spacing.lg},
    name: {
      ...typography.subtitle,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    locationIcon: {fontSize: 13, marginRight: 4, color: colors.textSecondary},
    locationText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceContainer: {},
    priceLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    priceRange: {
      ...typography.subtitle,
      color: colors.primary,
      fontWeight: '700',
    },
    amenityRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    amenityIcon: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    amenityEmoji: {fontSize: 14, color: colors.primary},
    reviewCount: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: 2,
    },
  });

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

  const displayAmenities = hotel.amenities.slice(0, 4);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}>
      <View>
        <Image
          source={{uri: hotel.images[0]}}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Icon name="star" style={styles.ratingIcon} />
          <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{hotel.name}</Text>
        <View style={styles.locationRow}>
          <Icon name="location" style={styles.locationIcon} />
          <Text style={styles.locationText}>{hotel.location}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.reviewCount}>
              {hotel.reviewCount} reviews
            </Text>
            <Text style={styles.priceRange}>
              {formatCurrency(hotel.priceMin)} – {formatCurrency(hotel.priceMax)}
            </Text>
            <Text style={styles.priceLabel}>per night</Text>
          </View>
          <View style={styles.amenityRow}>
            {displayAmenities.map(a => (
              <View key={a} style={styles.amenityIcon}>
                <Icon name={AMENITY_ICONS[a] || 'checkmark-circle-outline'} style={styles.amenityEmoji} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HotelCard;
