import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import PrimaryButton from '../../../shared/components/PrimaryButton';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
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
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isStart = dateStr === selectedStart;
    const isEnd = dateStr === selectedEnd;
    const isSelected = isStart || isEnd;
    const isInRange = selectedStart && selectedEnd && dateStr > selectedStart && dateStr < selectedEnd;

    cells.push(
      <TouchableOpacity
        key={day}
        style={styles.dayCell}
        onPress={() => onDayPress(dateStr)}
        activeOpacity={0.7}>
        {isInRange && <View style={styles.rangeHighlight} />}
        {isStart && selectedEnd && <View style={[styles.rangeHighlight, styles.rangeHighlightStart]} />}
        {isEnd && selectedStart && <View style={[styles.rangeHighlight, styles.rangeHighlightEnd]} />}
        <View style={[styles.dayCircle, isSelected && styles.selectedCircle]}>
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              !isSelected && isInRange && styles.inRangeDayText,
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

interface SelectDatesModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (start: string | null, end: string | null) => void;
  initialStart: string | null;
  initialEnd: string | null;
}

const SelectDatesModal: React.FC<SelectDatesModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialStart,
  initialEnd,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const [tempStart, setTempStart] = useState<string | null>(initialStart);
  const [tempEnd, setTempEnd] = useState<string | null>(initialEnd);

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

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      height: SCREEN_HEIGHT * 0.9,
      paddingTop: spacing.sm,
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    header: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    title: {
      ...typography.title,
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    closeBtn: {
        fontSize: 24,
        color: colors.textPrimary,
    },
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
    scrollArea: {
      flex: 1,
    },
    calendarsContent: {
      padding: spacing.xl,
    },
    footer: {
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: spacing.xl + 20,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Select Dates</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" style={styles.closeBtn} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.selectedDatesRow}>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateChipLabel}>Check-in</Text>
                            <Text style={styles.dateChipValue}>
                                {tempStart ? dayjs(tempStart).format('MMM DD') : 'Start Date'}
                            </Text>
                        </View>
                        <Icon name="arrow-forward" style={styles.separator} />
                        <View
                            style={[
                                styles.dateChip,
                                {borderColor: tempEnd ? colors.primary + '50' : colors.border},
                            ]}>
                            <Text style={styles.dateChipLabel}>Check-out</Text>
                            <Text
                                style={[
                                    styles.dateChipValue,
                                    {color: tempEnd ? colors.primary : colors.textSecondary},
                                ]}>
                                {tempEnd ? dayjs(tempEnd).format('MMM DD') : 'End Date'}
                            </Text>
                        </View>
                    </View>
                </View>

                <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
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
                        label="Confirm Dates"
                        onPress={() => onConfirm(tempStart, tempEnd)}
                    />
                </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectDatesModal;
