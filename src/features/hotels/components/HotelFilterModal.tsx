/**
 * HotelFilterModal
 *
 * Bottom sheet for filtering hotel results.
 * Filters: price range, min rating, category, amenities.
 *
 * Usage:
 *   <HotelFilterModal
 *     visible={filterOpen}
 *     onClose={() => setFilterOpen(false)}
 *     filters={activeFilters}
 *     onApply={(f) => setActiveFilters(f)}
 *   />
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';
import BottomSheetModal from '../../../shared/components/BottomSheetModal';
import {HotelFilters} from '../types/hotelTypes';
import {HotelAmenity} from '../models/Hotel';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CATEGORIES = ['luxury', 'business', 'resort', 'budget'] as const;

const AMENITIES: {key: HotelAmenity; icon: string}[] = [
  {key: 'pool', icon: 'water-outline'},
  {key: 'wifi', icon: 'wifi-outline'},
  {key: 'restaurant', icon: 'restaurant-outline'},
  {key: 'spa', icon: 'leaf-outline'},
  {key: 'gym', icon: 'barbell-outline'},
  {key: 'parking', icon: 'car-outline'},
  {key: 'ac', icon: 'snow-outline'},
  {key: 'breakfast', icon: 'cafe-outline'},
];

const RATINGS = [3, 3.5, 4, 4.5];

const PRICE_RANGES: {label: string; min: number; max: number}[] = [
  {label: '< $200', min: 0, max: 200},
  {label: '$200 – $400', min: 200, max: 400},
  {label: '$400 – $700', min: 400, max: 700},
  {label: '$700+', min: 700, max: 99999},
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: HotelFilters;
  onApply: (filters: HotelFilters) => void;
}

const HotelFilterModal: React.FC<Props> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();

  // Local draft state — only committed on "Apply"
  const [draft, setDraft] = useState<HotelFilters>(filters);

  const toggleAmenity = (a: HotelAmenity) => {
    const current = draft.amenities ?? [];
    setDraft(prev => ({
      ...prev,
      amenities: current.includes(a)
        ? current.filter(x => x !== a)
        : [...current, a],
    }));
  };

  const toggleCategory = (c: string) => {
    setDraft(prev => ({...prev, category: prev.category === c ? undefined : c}));
  };

  const setPriceRange = (min: number, max: number) => {
    setDraft(prev => ({...prev, minPrice: min, maxPrice: max}));
  };

  const setRating = (r: number) => {
    setDraft(prev => ({...prev, rating: prev.rating === r ? undefined : r}));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const empty: HotelFilters = {};
    setDraft(empty);
    onApply(empty);
    onClose();
  };

  // Sync draft with external filters when modal opens
  React.useEffect(() => {
    if (visible) {setDraft(filters);}
  }, [visible, filters]);

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

  const isAmenityActive = (a: HotelAmenity) =>
    (draft.amenities ?? []).includes(a);

  const isPriceActive = (min: number, max: number) =>
    draft.minPrice === min && draft.maxPrice === max;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('common.filter')}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>

        {/* Price Range */}
        <Text style={s.sectionLabel}>{t('hotels.filters.priceRange')}</Text>
        <View style={s.chipRow}>
          {PRICE_RANGES.map(p => {
            const active = isPriceActive(p.min, p.max);
            return (
              <TouchableOpacity
                key={p.label}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setPriceRange(p.min, p.max)}
                activeOpacity={0.75}>
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Min Rating */}
        <Text style={s.sectionLabel}>{t('hotels.filters.minRating')}</Text>
        <View style={s.chipRow}>
          {RATINGS.map(r => {
            const active = draft.rating === r;
            return (
              <TouchableOpacity
                key={r}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setRating(r)}
                activeOpacity={0.75}>
                <Icon
                  name="star"
                  style={[s.chipIcon, active && s.chipIconActive]}
                />
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {r}+
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category */}
        <Text style={s.sectionLabel}>{t('hotels.filters.category')}</Text>
        <View style={s.chipRow}>
          {CATEGORIES.map(c => {
            const active = draft.category === c;
            return (
              <TouchableOpacity
                key={c}
                style={[s.chip, active && s.chipActive]}
                onPress={() => toggleCategory(c)}
                activeOpacity={0.75}>
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(`hotels.category.${c}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amenities */}
        <Text style={s.sectionLabel}>{t('hotels.amenities')}</Text>
        <View style={s.chipRow}>
          {AMENITIES.map(a => {
            const active = isAmenityActive(a.key);
            return (
              <TouchableOpacity
                key={a.key}
                style={[s.chip, active && s.chipActive]}
                onPress={() => toggleAmenity(a.key)}
                activeOpacity={0.75}>
                <Icon
                  name={a.icon}
                  style={[s.chipIcon, active && s.chipIconActive]}
                />
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {t(`hotels.${a.key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
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

export default HotelFilterModal;
