import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import {useTheme} from  '../../../app/providers/ThemeProvider';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  pressable?: boolean;
  leftIconName?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder,
  onPress,
  pressable = false,
  leftIconName = 'search',
  rightElement,
  style,
}) => {
  const {colors, spacing, radius, typography} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      fontSize: 18,
      marginRight: spacing.sm,
      color: colors.textSecondary,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      padding: 0,
    },
    pressableText: {
      flex: 1,
      ...typography.body,
      color: value ? colors.textPrimary : colors.textSecondary,
    },
  });

  if (pressable) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}>
        <Icon name={leftIconName} style={styles.icon} />
        <Text style={styles.pressableText}>{value || placeholder}</Text>
        {rightElement}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Icon name={leftIconName} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {rightElement}
    </View>
  );
};

export default SearchInput;
