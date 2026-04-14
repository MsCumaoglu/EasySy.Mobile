/**
 * BusFilterModal
 *
 * Bottom sheet for filtering bus results.
 * Filters: bus type, max price, departure time slot, amenities.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';
import BottomSheetModal from '../../../shared/components/BottomSheetModal';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {BusTripAmenity} from '../models/BusTrip';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusFilters {
  busType?: 'standard' | 'vip' | 'express';
  maxPrice?: number;
  departureSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  amenities?: BusTripAmenity[];
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BUS_TYPES = ['standard', 'vip', 'express'] as const;

const PRICE_RANGES = [
  {label: '< $20', max: 20},
  {label: '< $40', max: 40},
  {label: '< $60', max: 60},
  {label: 'Any', max: undefined},
];

const DEPARTURE_SLOTS: {key: BusFilters['departureSlot']; icon: string; labelKey: string}[] = [
  {key: 'morning', icon: 'sunny-outline', labelKey: 'bus.filters.morning'},
  {key: 'afternoon', icon: 'partly-sunny-outline', labelKey: 'bus.filters.afternoon'},
  {key: 'evening', icon: 'moon-outline', labelKey: 'bus.filters.evening'},
  {key: 'night', icon: 'cloudy-night-outline', labelKey: 'bus.filters.night'},
];

const AMENITIES: {key: BusTripAmenity; icon: string; labelKey: string}[] = [
  {key: 'ac', icon: 'snow-outline', labelKey: 'bus.amenities.ac'},
  {key: 'wifi', icon: 'wifi-outline', labelKey: 'bus.amenities.wifi'},
  {key: 'usb', icon: 'battery-charging-outline', labelKey: 'bus.amenities.usb'},
  {key: 'snacks', icon: 'cafe-outline', labelKey: 'bus.amenities.snacks'},
  {key: 'toilet', icon: 'water-outline', labelKey: 'bus.amenities.toilet'},
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: BusFilters;
  onApply: (filters: BusFilters) => void;
}

const BusFilterModal: React.FC<Props> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();
  const [draft, setDraft] = useState<BusFilters>(filters);

  useEffect(() => {
    if (visible) {setDraft(filters);}
  }, [visible, filters]);

  const toggleAmenity = (a: BusTripAmenity) => {
    const current = draft.amenities ?? [];
    setDraft(prev => ({
      ...prev,
      amenities: current.includes(a)
        ? current.filter(x => x !== a)
        : [...current, a],
    }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const empty: BusFilters = {};
    setDraft(empty);
    onApply(empty);
    onClose();
  };

  const s = StyleSheet.create({
    scroll: {paddingHorizontal: spacing.xl, paddingTop: spacing.lg},
    sectionLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}18`,
    },
    chipText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    chipTextActive: {color: colors.primary, fontWeight: '700'},
    chipIcon: {fontSize: 14, color: colors.textSecondary},
    chipIconActive: {fontSize: 14, color: colors.primary},
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      marginTop: spacing.lg,
    },
    resetBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
    },
    resetText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    applyBtn: {
      flex: 2,
      paddingVertical: 13,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    applyText: {
      ...typography.body,
      color: '#fff',
      fontWeight: '700',
    },
  });

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('common.filter')}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} bounces={false}>

        {/* Bus Type */}
        <Text style={s.sectionLabel}>{t('bus.filters.busType')}</Text>
        <View style={s.chipRow}>
          {BUS_TYPES.map(bt => {
            const active = draft.busType === bt;
            return (
              <TouchableOpacity
                key={bt}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setDraft(prev => ({...prev, busType: prev.busType === bt ? undefined : bt}))}
                activeOpacity={0.75}>
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(`bus.type.${bt}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Max Price */}
        <Text style={s.sectionLabel}>{t('hotels.filters.priceRange')}</Text>
        <View style={s.chipRow}>
          {PRICE_RANGES.map(p => {
            const active = draft.maxPrice === p.max;
            return (
              <TouchableOpacity
                key={p.label}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setDraft(prev => ({...prev, maxPrice: p.max}))}
                activeOpacity={0.75}>
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Departure Time */}
        <Text style={s.sectionLabel}>{t('bus.filters.departureTime')}</Text>
        <View style={s.chipRow}>
          {DEPARTURE_SLOTS.map(slot => {
            const active = draft.departureSlot === slot.key;
            return (
              <TouchableOpacity
                key={slot.key}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setDraft(prev => ({
                  ...prev,
                  departureSlot: prev.departureSlot === slot.key ? undefined : slot.key,
                }))}
                activeOpacity={0.75}>
                <Icon name={slot.icon} style={[s.chipIcon, active && s.chipIconActive]} />
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(slot.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amenities */}
        <Text style={s.sectionLabel}>{t('bus.amenities.title')}</Text>
        <View style={s.chipRow}>
          {AMENITIES.map(a => {
            const active = (draft.amenities ?? []).includes(a.key);
            return (
              <TouchableOpacity
                key={a.key}
                style={[s.chip, active && s.chipActive]}
                onPress={() => toggleAmenity(a.key)}
                activeOpacity={0.75}>
                <Icon name={a.icon} style={[s.chipIcon, active && s.chipIconActive]} />
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(a.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.resetBtn} onPress={handleReset} activeOpacity={0.75}>
          <Text style={s.resetText}>{t('common.reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <Text style={s.applyText}>{t('common.applyFilters')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

export default BusFilterModal;
