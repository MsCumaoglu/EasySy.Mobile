/**
 * BottomSheetModal — Reusable animated bottom sheet.
 *
 * Uses React Native's built-in Modal + Animated API.
 * No external dependency needed.
 *
 * Props:
 *  - visible     : controls open/close
 *  - onClose     : called when backdrop or drag-down closes the sheet
 *  - title       : header title
 *  - children    : sheet content
 *  - snapHeight? : fixed sheet height (default: auto via flex)
 */

import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useTheme} from '../../app/providers/ThemeProvider';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAG_THRESHOLD = 80; // px: drag-down distance to dismiss

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional fixed height. If omitted the sheet sizes to its content. */
  snapHeight?: number;
}

const BottomSheetModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  children,
  snapHeight,
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Slide in when visible, slide out when not
  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, dragY]);

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          dragY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_THRESHOLD) {
          onClose();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xl ?? 24,
      borderTopRightRadius: radius.xl ?? 24,
      paddingBottom: spacing.xxl,
      ...(snapHeight ? {height: snapHeight} : {}),
    },
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    titleText: {
      ...typography.subtitle,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* Backdrop tap to close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          {/* Stop touch propagation to backdrop inside sheet */}
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [
                    {
                      translateY: Animated.add(translateY, dragY),
                    },
                  ],
                },
              ]}
              {...panResponder.panHandlers}>
              {/* Drag handle */}
              <View style={styles.handleBar} />

              {/* Title */}
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{title}</Text>
              </View>

              {/* Content */}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheetModal;
