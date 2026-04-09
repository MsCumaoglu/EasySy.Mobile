import React from 'react';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({message}) => {
  const {colors, spacing, typography} = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text
          style={[
            typography.body,
            {color: colors.textSecondary, marginTop: spacing.md},
          ]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
