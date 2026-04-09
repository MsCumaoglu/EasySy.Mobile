import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from  '../../../app/providers/ThemeProvider';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outline';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'filled',
}) => {
  const {colors, spacing, radius, typography} = useTheme();

  const filled = variant === 'filled';

  const styles = StyleSheet.create({
    button: {
      backgroundColor: filled
        ? disabled
          ? colors.border
          : colors.primary
        : 'transparent',
      borderWidth: filled ? 0 : 2,
      borderColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 52,
    },
    label: {
      ...typography.subtitle,
      color: filled ? colors.white : colors.primary,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={filled ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
