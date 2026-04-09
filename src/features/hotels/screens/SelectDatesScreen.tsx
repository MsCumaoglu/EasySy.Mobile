import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom} from 'jotai';
import dayjs from 'dayjs';
import {HotelStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import Icon from 'react-native-vector-icons/Ionicons';

type SelectDatesNavProp = NativeStackNavigationProp<
  HotelStackParamList,
  'SelectDates'
>;

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarMonthProps {
  year: number;
  month: number;
  selectedStart: string | null;
  selectedEnd: string | null;
  onDayPress: (dateStr: string) => void;
  colors: any;
  spacing: any;
  radius: any;
  typography: any;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year,
  month,
  selectedStart,
  selectedEnd,
  onDayPress,
  colors,
  spacing,
  radius,
  typography,
}) => {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startOffset = firstDay.day();

  const monthName = firstDay.format('MMMM YYYY');

  const isSelected = (day: number): boolean => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const isInRange = (day: number): boolean => {
    if (!selectedStart || !selectedEnd) {
      return false;
    }
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr > selectedStart && dateStr < selectedEnd;
  };

  const isStart = (day: number): boolean => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedStart;
  };

  const isEnd = (day: number): boolean => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedEnd;
  };

  const styles = StyleSheet.create({
    monthContainer: {marginBottom: spacing.xl},
    monthTitle: {
      ...typography.subtitle,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      fontWeight: '700',
    },
    daysHeader: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    dayHeaderText: {
      flex: 1,
      textAlign: 'center',
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    rangeHighlight: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 0,
      right: 0,
      backgroundColor: colors.primary + '20',
    },
    rangeHighlightStart: {
      left: '50%',
    },
    rangeHighlightEnd: {
      right: '50%',
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    selectedCircle: {
      backgroundColor: colors.primary,
    },
    dayText: {
      ...typography.body,
      color: colors.textPrimary,
    },
    selectedDayText: {
      color: colors.white,
      fontWeight: '700',
    },
    inRangeDayText: {
      color: colors.primary,
      fontWeight: '600',
    },
    emptyCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
    },
  });

  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(<View key={`empty-${i}`} style={styles.emptyCell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const sel = isSelected(day);
    const range = isInRange(day);
    const start = isStart(day);
    const end = isEnd(day);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    cells.push(
      <TouchableOpacity
        key={day}
        style={styles.dayCell}
        onPress={() => onDayPress(dateStr)}
        activeOpacity={0.7}>
        {range && <View style={styles.rangeHighlight} />}
        {start && selectedEnd && <View style={[styles.rangeHighlight, styles.rangeHighlightStart]} />}
        {end && selectedStart && <View style={[styles.rangeHighlight, styles.rangeHighlightEnd]} />}
        <View style={[styles.dayCircle, sel && styles.selectedCircle]}>
          <Text
            style={[
              styles.dayText,
              sel && styles.selectedDayText,
              !sel && range && styles.inRangeDayText,
            ]}>
            {day}
          </Text>
        </View>
      </TouchableOpacity>,
    );
  }

  return (
    <View style={styles.monthContainer}>
      <Text style={styles.monthTitle}>{monthName}</Text>
      <View style={styles.daysHeader}>
        {DAYS_OF_WEEK.map(d => (
          <Text key={d} style={styles.dayHeaderText}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.daysGrid}>{cells}</View>
    </View>
  );
};

const SelectDatesScreen: React.FC = () => {
  const navigation = useNavigation<SelectDatesNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [params, setParams] = useAtom(hotelSearchParamsAtom);
  const [tempStart, setTempStart] = useState<string | null>(params.checkIn);
  const [tempEnd, setTempEnd] = useState<string | null>(params.checkOut);

  const handleDayPress = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd(null);
    } else if (dateStr > tempStart) {
      setTempEnd(dateStr);
    } else {
      setTempStart(dateStr);
      setTempEnd(null);
    }
  };

  const handleConfirm = () => {
    setParams(p => ({...p, checkIn: tempStart, checkOut: tempEnd}));
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    closeBtnText: {fontSize: 20, color: colors.textPrimary},
    headerTitle: {...typography.title, color: colors.textPrimary},
    selectedDatesRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
    },
    dateChip: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: tempStart ? colors.primary + '50' : colors.border,
    },
    dateChipLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    dateChipValue: {
      ...typography.body,
      color: tempStart ? colors.primary : colors.textSecondary,
      fontWeight: '600',
    },
    separator: {
      alignSelf: 'center',
      fontSize: 18,
      color: colors.textSecondary,
    },
    calendarsContent: {padding: spacing.xl},
    footer: {
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="close" style={styles.closeBtnText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('hotels.selectDates')}</Text>
        </View>
        <View style={styles.selectedDatesRow}>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipLabel}>{t('hotels.checkIn')}</Text>
            <Text style={styles.dateChipValue}>
              {tempStart ? dayjs(tempStart).format('Apr DD') : 'Start'}
            </Text>
          </View>
          <Icon name="arrow-forward" style={styles.separator} />
          <View
            style={[
              styles.dateChip,
              {borderColor: tempEnd ? colors.primary + '50' : colors.border},
            ]}>
            <Text style={styles.dateChipLabel}>{t('hotels.checkOut')}</Text>
            <Text
              style={[
                styles.dateChipValue,
                {color: tempEnd ? colors.primary : colors.textSecondary},
              ]}>
              {tempEnd ? dayjs(tempEnd).format('MMM DD') : 'End'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarsContent}>
          <CalendarMonth
            year={2026}
            month={4}
            selectedStart={tempStart}
            selectedEnd={tempEnd}
            onDayPress={handleDayPress}
            colors={colors}
            spacing={spacing}
            radius={radius}
            typography={typography}
          />
          <CalendarMonth
            year={2026}
            month={5}
            selectedStart={tempStart}
            selectedEnd={tempEnd}
            onDayPress={handleDayPress}
            colors={colors}
            spacing={spacing}
            radius={radius}
            typography={typography}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('hotels.confirmDates')}
          onPress={handleConfirm}
          disabled={!tempStart || !tempEnd}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectDatesScreen;
