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
} from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useTranslation} from 'react-i18next';
import PrimaryButton from '../../../shared/components/PrimaryButton';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Mini Calendar ─────────────────────────────────────────────────────────────
interface CalendarMonthProps {
  year: number;
  month: number;
  selected: string | null;
  onDayPress: (dateStr: string) => void;
  colors: any;
  spacing: any;
  radius: any;
  typography: any;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year, month, selected, onDayPress,
  colors, spacing, radius, typography,
}) => {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startOffset = firstDay.day();
  const today = dayjs().format('YYYY-MM-DD');

  const st = StyleSheet.create({
    monthContainer: {marginBottom: spacing.xl},
    monthTitle: {
      ...typography.subtitle, color: colors.textPrimary,
      textAlign: 'center', marginBottom: spacing.lg, fontWeight: '700',
    },
    daysHeader: {flexDirection: 'row', marginBottom: spacing.sm},
    dayHeaderText: {
      flex: 1, textAlign: 'center',
      ...typography.caption, color: colors.textSecondary, fontWeight: '600',
    },
    daysGrid: {flexDirection: 'row', flexWrap: 'wrap'},
    dayCell: {
      width: `${100 / 7}%`, aspectRatio: 1,
      alignItems: 'center', justifyContent: 'center',
    },
    dayCircle: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
    },
    selectedCircle: {backgroundColor: colors.primary},
    todayCircle: {borderWidth: 1.5, borderColor: colors.primary},
    dayText: {...typography.body, color: colors.textPrimary},
    selectedDayText: {color: colors.white, fontWeight: '700'},
    pastDayText: {color: colors.border},
    emptyCell: {width: `${100 / 7}%`, aspectRatio: 1},
  });

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push(<View key={`e-${i}`} style={st.emptyCell} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = dateStr === selected;
    const isToday = dateStr === today;
    const isPast = dateStr < today;

    cells.push(
      <TouchableOpacity
        key={day}
        style={st.dayCell}
        onPress={() => !isPast && onDayPress(dateStr)}
        activeOpacity={isPast ? 1 : 0.7}>
        <View style={[st.dayCircle, isSelected && st.selectedCircle, !isSelected && isToday && st.todayCircle]}>
          <Text style={[st.dayText, isSelected && st.selectedDayText, isPast && st.pastDayText]}>
            {day}
          </Text>
        </View>
      </TouchableOpacity>,
    );
  }

  return (
    <View style={st.monthContainer}>
      <Text style={st.monthTitle}>{firstDay.format('MMMM YYYY')}</Text>
      <View style={st.daysHeader}>
        {DAYS_OF_WEEK.map(d => <Text key={d} style={st.dayHeaderText}>{d}</Text>)}
      </View>
      <View style={st.daysGrid}>{cells}</View>
    </View>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
interface SelectBusDateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  initialDate?: string | null;
}

const SelectBusDateModal: React.FC<SelectBusDateModalProps> = ({
  isVisible, onClose, onConfirm, initialDate,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();
  const today = dayjs();
  const [selected, setSelected] = useState<string | null>(initialDate ?? null);

  // Show current + next month
  const months = [
    {year: today.year(), month: today.month() + 1},
    {year: today.add(1, 'month').year(), month: today.add(1, 'month').month() + 1},
  ];

  const styles = StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
    content: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 30, borderTopRightRadius: 30,
      height: SCREEN_HEIGHT * 0.88, paddingTop: spacing.sm,
    },
    handle: {
      width: 40, height: 5, backgroundColor: colors.border,
      borderRadius: 10, alignSelf: 'center', marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
    },
    title: {...typography.title, fontSize: 18, color: colors.textPrimary, fontWeight: '600'},
    closeIcon: {fontSize: 24, color: colors.textPrimary},
    selectedChip: {
      marginHorizontal: spacing.xl, marginBottom: spacing.lg,
      backgroundColor: colors.surface, borderRadius: radius.lg,
      padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    },
    chipIcon: {fontSize: 18, color: colors.primary},
    chipText: {
      ...typography.body, color: selected ? colors.primary : colors.textSecondary,
      fontWeight: selected ? '600' : '400',
    },
    scrollArea: {flex: 1},
    calendarContent: {padding: spacing.xl},
    footer: {
      padding: spacing.xl, backgroundColor: colors.card,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
  });

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>{t('common.selectDate')}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              {/* Selected date chip */}
              <View style={styles.selectedChip}>
                <Icon name="calendar-outline" style={styles.chipIcon} />
                <Text style={styles.chipText}>
                  {selected ? dayjs(selected).format('ddd, D MMMM YYYY') : t('common.noDateSelected')}
                </Text>
              </View>

              {/* Calendar */}
              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.calendarContent}>
                  {months.map(m => (
                    <CalendarMonth
                      key={`${m.year}-${m.month}`}
                      year={m.year}
                      month={m.month}
                      selected={selected}
                      onDayPress={setSelected}
                      colors={colors}
                      spacing={spacing}
                      radius={radius}
                      typography={typography}
                    />
                  ))}
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <PrimaryButton
                  label={t('common.confirmDate')}
                  onPress={() => selected && onConfirm(selected)}
                  disabled={!selected}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectBusDateModal;
