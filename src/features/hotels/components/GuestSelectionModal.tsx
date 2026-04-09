import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface GuestSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (adults: number, children: number, rooms: number) => void;
  initialAdults: number;
  initialChildren: number;
  initialRooms: number;
}

const GuestSelectionModal: React.FC<GuestSelectionModalProps> = ({
  isVisible,
  onClose,
  onApply,
  initialAdults,
  initialChildren,
  initialRooms,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);

  const CounterRow = ({
    title,
    subtitle,
    value,
    onValueChange,
    minValue = 0,
  }: {
    title: string;
    subtitle?: string;
    value: number;
    onValueChange: (val: number) => void;
    minValue?: number;
  }) => (
    <View style={styles.counterRow}>
      <View style={styles.labelContainer}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.counterWrapper}>
        <View style={styles.counterPill}>
          <TouchableOpacity
            style={styles.minBtn}
            onPress={() => onValueChange(Math.max(minValue, value - 1))}
            disabled={value <= minValue}>
            <Icon name="remove-outline" style={[styles.minIcon, value <= minValue && {opacity: 0.3}]} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{value}</Text>
          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() => onValueChange(value + 1)}>
            <Icon name="add-outline" style={styles.plusIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
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
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    title: {
      ...typography.title,
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    rowsContainer: {
      paddingHorizontal: spacing.xl,
      backgroundColor: '#F9F9F9',
      marginHorizontal: spacing.xl,
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    labelContainer: {
      flex: 1,
    },
    rowTitle: {
      ...typography.body,
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    rowSubtitle: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    counterWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    counterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F0F2',
      borderRadius: radius.full,
      padding: 4,
    },
    minBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    minIcon: {
      fontSize: 20,
      color: colors.textSecondary,
    },
    counterValue: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginHorizontal: spacing.lg,
      minWidth: 12,
      textAlign: 'center',
    },
    plusBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusIcon: {
      fontSize: 20,
      color: colors.white,
    },
    applyBtn: {
        backgroundColor: colors.primary,
        marginHorizontal: spacing.xl,
        marginTop: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: radius.lg,
        alignItems: 'center',
    },
    applyBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    }
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
               <SafeAreaView>
                <View style={styles.handle} />
                
                <View style={styles.header}>
                  <Text style={styles.title}>Guests & Rooms</Text>
                </View>

                <View style={styles.rowsContainer}>
                  <CounterRow
                    title="Adults"
                    value={adults}
                    onValueChange={setAdults}
                    minValue={1}
                  />
                  <CounterRow
                    title="Children"
                    subtitle="Ages 0-17"
                    value={children}
                    onValueChange={setChildren}
                  />
                  <CounterRow
                    title="Rooms"
                    subtitle="Syria"
                    value={rooms}
                    onValueChange={setRooms}
                    minValue={1}
                  />
                </View>

                <TouchableOpacity 
                    style={styles.applyBtn}
                    onPress={() => onApply(adults, children, rooms)}
                >
                    <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default GuestSelectionModal;
