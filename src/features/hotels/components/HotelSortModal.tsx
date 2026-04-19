/**
 * HotelSortModal
 *
 * Bottom sheet for sorting hotel results.
 * Sort options: price asc/desc, rating, name.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';
import BottomSheetModal from '../../../shared/components/BottomSheetModal';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {HotelSortOption} from '../types/hotelTypes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// HotelSortOption is defined in hotelTypes.ts — imported above.
export type {HotelSortOption};

const SORT_OPTIONS: {key: HotelSortOption; icon: string; labelKey: string}[] = [
  {key: 'recommended', icon: 'star-outline', labelKey: 'hotels.sort.recommended'},
  {key: 'price_asc', icon: 'arrow-up-outline', labelKey: 'hotels.sort.priceAsc'},
  {key: 'price_desc', icon: 'arrow-down-outline', labelKey: 'hotels.sort.priceDesc'},
  {key: 'rating_desc', icon: 'trophy-outline', labelKey: 'hotels.sort.ratingDesc'},
  {key: 'name_asc', icon: 'text-outline', labelKey: 'hotels.sort.nameAsc'},
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  visible: boolean;
  onClose: () => void;
  activeSort: HotelSortOption;
  onSelect: (sort: HotelSortOption) => void;
}

const HotelSortModal: React.FC<Props> = ({
  visible,
  onClose,
  activeSort,
  onSelect,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();

  const handleSelect = (key: HotelSortOption) => {
    onSelect(key);
    onClose();
  };

  const s = StyleSheet.create({
    list: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionIcon: {
      fontSize: 20,
      color: colors.textSecondary,
      width: 24,
      textAlign: 'center',
    },
    optionIconActive: {
      color: colors.primary,
    },
    optionText: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
      fontWeight: '500',
    },
    optionTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    checkIcon: {
      fontSize: 18,
      color: colors.primary,
    },
  });

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('common.sort')}>
      <View style={s.list}>
        {SORT_OPTIONS.map((opt, idx) => {
          const isActive = activeSort === opt.key;
          const isLast = idx === SORT_OPTIONS.length - 1;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[s.option, isLast && s.optionLast]}
              onPress={() => handleSelect(opt.key)}
              activeOpacity={0.7}>
              <Icon
                name={opt.icon}
                style={[s.optionIcon, isActive && s.optionIconActive]}
              />
              <Text style={[s.optionText, isActive && s.optionTextActive]}>
                {t(opt.labelKey)}
              </Text>
              {isActive && (
                <Icon name="checkmark-circle" style={s.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheetModal>
  );
};

export default HotelSortModal;
