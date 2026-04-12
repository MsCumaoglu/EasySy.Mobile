import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../app/providers/ThemeProvider';
import {useRTL} from '../../core/hooks/useRTL';

export interface ScreenHeaderProps {
  title?: string;
  subtitleNode?: React.ReactNode;
  showBackBtn?: boolean;
  onBackPress?: () => void;
  centered?: boolean;
  rightNode?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitleNode,
  showBackBtn = true,
  onBackPress,
  centered = false,
  rightNode,
  containerStyle,
}) => {
  const navigation = useNavigation();
  const {colors, spacing, typography} = useTheme();
  const {flipIcon, isRTL} = useRTL();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: centered ? 'space-between' : 'flex-start',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: colors.background,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginRight: centered ? 0 : (isRTL ? 0 : spacing.lg),
      marginLeft: centered ? 0 : (isRTL ? spacing.lg : 0),
      zIndex: 1,
    },
    backIcon: {
      fontSize: 26,
      color: colors.primary,
    },
    centerContent: {
      flex: centered ? 1 : undefined,
      alignItems: centered ? 'center' : 'flex-start',
    },
    title: {
      ...typography.title,
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: centered ? 'center' : (isRTL ? 'right' : 'left'),
    },
    rightSpacer: {
      width: 40,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {showBackBtn ? (
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Icon name={flipIcon('arrow-back')} style={styles.backIcon} />
        </TouchableOpacity>
      ) : centered ? (
        <View style={styles.rightSpacer} />
      ) : null}

      <View style={styles.centerContent}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {subtitleNode}
      </View>

      {rightNode ? (
        rightNode
      ) : centered ? (
        <View style={styles.rightSpacer} />
      ) : null}
    </View>
  );
};

export default ScreenHeader;
