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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';

import {HotelRoomConfig} from '../types/hotelTypes';
import {useTranslation} from 'react-i18next';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface GuestSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (rooms: HotelRoomConfig[]) => void;
  initialRoomsConfig: HotelRoomConfig[];
}

const GuestSelectionModal: React.FC<GuestSelectionModalProps> = ({
  isVisible,
  onClose,
  onApply,
  initialRoomsConfig,
}) => {
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [rooms, setRooms] = useState<HotelRoomConfig[]>(initialRoomsConfig);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  React.useEffect(() => {
    if (isVisible) {
      setRooms(initialRoomsConfig);
      setExpandedIdx(0);
    }
  }, [isVisible, initialRoomsConfig]);

  const updateRoom = (idx: number, field: 'adults' | 'children', delta: number) => {
    setRooms(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const val = Math.max(field === 'adults' ? 1 : 0, r[field] + delta);
      return {...r, [field]: val};
    }));
  };

  const addRoom = () => {
    if (rooms.length < 4) {
      const nextIdx = rooms.length;
      setRooms(prev => [...prev, {adults: 1, children: 0}]);
      setExpandedIdx(nextIdx);
    }
  };

  const removeRoom = (idx: number) => {
    setRooms(prev => {
      const newRooms = prev.filter((_, i) => i !== idx);
      // Adjust expandedIdx after removal
      if (expandedIdx === idx) {
        setExpandedIdx(0);
      } else if (expandedIdx !== null && expandedIdx > idx) {
        setExpandedIdx(expandedIdx - 1);
      }
      return newRooms;
    });
  };

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
      backgroundColor: colors.border,
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
    roomsList: {
      maxHeight: SCREEN_HEIGHT * 0.5,
    },
    roomBlock: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.xl,
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.md,
    },
    roomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    roomTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    chevronIcon: {
      fontSize: 18,
      color: colors.primary,
    },
    roomTitle: {
      ...typography.subtitle,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    roomContent: {
      marginTop: spacing.xs,
    },
    removeBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    removeText: {
      ...typography.caption,
      color: '#EF4444',
      fontWeight: '700',
      fontSize: 13,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      backgroundColor: colors.surface,
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
        marginTop: spacing.md,
        paddingVertical: spacing.lg,
        borderRadius: radius.lg,
        alignItems: 'center',
    },
    applyBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    addRoomBtn: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    addRoomText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    addRoomDisabled: {
      opacity: 0.4,
      borderColor: colors.border,
    },
    addRoomDisabledText: {
      color: colors.textSecondary,
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
                  <Text style={styles.title}>{t('hotels.roomsAndGuests') || 'Rooms & Guests'}</Text>
                </View>

                <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
                  {rooms.map((room, idx) => (
                    <View key={idx} style={styles.roomBlock}>
                      <TouchableOpacity 
                        style={styles.roomHeader} 
                        activeOpacity={0.7}
                        onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      >
                        <View style={styles.roomTitleGroup}>
                          <Icon 
                            name={expandedIdx === idx ? "chevron-down" : "chevron-forward"} 
                            style={styles.chevronIcon} 
                          />
                          <Text style={styles.roomTitle}>{t('common.room') || 'Room'} {idx + 1}</Text>
                        </View>
                        {idx > 0 && (
                          <TouchableOpacity style={styles.removeBtn} onPress={() => removeRoom(idx)}>
                            <Text style={styles.removeText}>{t('common.remove') || 'Remove'}</Text>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>

                      {expandedIdx === idx && (
                        <View style={styles.roomContent}>
                          <CounterRow
                            title={t('common.adults') || 'Adults'}
                            value={room.adults}
                            onValueChange={(val) => updateRoom(idx, 'adults', val - room.adults)}
                            minValue={1}
                          />
                          <CounterRow
                            title={t('common.children') || 'Children'}
                            subtitle={t('hotels.childrenAge') || '0-17 age'}
                            value={room.children}
                            onValueChange={(val) => updateRoom(idx, 'children', val - room.children)}
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity 
                    style={[styles.addRoomBtn, rooms.length >= 4 && styles.addRoomDisabled]}
                    onPress={addRoom}
                    disabled={rooms.length >= 4}
                >
                    <Text style={[styles.addRoomText, rooms.length >= 4 && styles.addRoomDisabledText]}>
                      {rooms.length >= 4 ? t('hotels.maxRoomsReached') : t('hotels.addNewRoom')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.applyBtn}
                    onPress={() => onApply(rooms)}
                >
                    <Text style={styles.applyBtnText}>{t('common.apply') || 'Apply'}</Text>
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
