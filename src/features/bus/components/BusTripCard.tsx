import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useTranslation} from 'react-i18next';
import {BusTrip} from '../models/BusTrip';
import {formatCurrency, formatDuration} from '../../../core/utils/format';
import Icon from 'react-native-vector-icons/Ionicons';

interface BusTripCardProps {
  trip: BusTrip;
  onPress: () => void;
  style?: ViewStyle;
}

const BUS_TYPE_BADGE: Record<string, {label: string; color: string}> = {
  vip: {label: 'VIP', color: '#9B59B6'},
  express: {label: 'EXPRESS', color: '#27AE60'},
  standard: {label: 'STANDARD', color: '#3498DB'},
};

const BusTripCard: React.FC<BusTripCardProps> = ({trip, onPress, style}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();
  const badge = BUS_TYPE_BADGE[trip.busType];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      marginBottom: spacing.lg,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTop: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    companyRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
    busIcon: {fontSize: 18, color: colors.primary},
    companyName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    typeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    typeBadgeText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    seatsText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    cardBody: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    timeBlock: {alignItems: 'center', flex: 1},
    timeText: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    cityText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    durationBlock: {
      flex: 1,
      alignItems: 'center',
    },
    durationLine: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 4,
    },
    dashedLine: {
      flex: 1,
      height: 1,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.border,
    },
    busEmoji: {fontSize: 14, color: colors.primary},
    durationText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    priceText: {
      ...typography.title,
      color: colors.primary,
      fontWeight: '800',
    },
    perPerson: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    bookBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    bookBtnText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '700',
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}>
      {/* Card Top */}
      <View style={styles.cardTop}>
        <View style={styles.companyRow}>
          <Icon name="bus" style={styles.busIcon} />
          <Text style={styles.companyName}>{trip.company}</Text>
          <View style={[styles.typeBadge, {backgroundColor: badge.color}]}>
            <Text style={styles.typeBadgeText}>{badge.label}</Text>
          </View>
        </View>
        <Text style={styles.seatsText}>{trip.availableSeats} {t('bus.seats')}</Text>
      </View>

      {/* Time Row */}
      <View style={styles.cardBody}>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeText}>{trip.departureTime}</Text>
            <Text style={styles.cityText}>{trip.from}</Text>
          </View>

          <View style={styles.durationBlock}>
            <View style={styles.durationLine}>
              <View style={styles.dashedLine} />
              <Icon name="bus" style={styles.busEmoji} />
              <View style={styles.dashedLine} />
            </View>
            <Text style={styles.durationText}>
              {formatDuration(trip.durationMinutes)}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.timeText}>{trip.arrivalTime}</Text>
            <Text style={styles.cityText}>{trip.to}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceText}>{formatCurrency(trip.price)}</Text>
          <Text style={styles.perPerson}>{t('bus.perPerson')}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
          <Text style={styles.bookBtnText}>{t('common.bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default BusTripCard;
