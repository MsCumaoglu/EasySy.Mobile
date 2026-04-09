import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  ImageSourcePropType,
  Image,
} from 'react-native';
import {useTheme} from '../../../app/providers/ThemeProvider';

interface HomeButtonCardProps {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'horizontal' | 'vertical';
}

const HomeButtonCard: React.FC<HomeButtonCardProps> = ({
  image,
  title,
  description,
  onPress,
  style,
  variant = 'horizontal',
}) => {
  const {colors, spacing, radius, typography} = useTheme();

  const isVertical = variant === 'vertical';

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...(isVertical ? {
        height: 240, // Enough height for text and bottom image
        flexDirection: 'column',
      } : {
        flexDirection: 'row',
        height: 140, // Height for horizontal layout
      }),
    },
    textContainer: {
      padding: spacing.xl,
      ...(isVertical ? {
        zIndex: 2,
      } : {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 0,
        zIndex: 2,
      }),
    },
    title: {
      ...typography.title,
      color: colors.primary,
      fontWeight: '800',
      marginBottom: spacing.xs,
      fontSize: 22,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 20,
      fontSize: 14,
    },
    imageContainer: {
      ...(isVertical ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        alignItems: 'center',
        justifyContent: 'flex-end',
      } : {
        width: '55%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
      }),
    },
    image: {
      ...(isVertical ? {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        bottom: -15,
        left: -20,
      } : {
        width: '100%',
        height: '150%', // Slightly larger for visual pop
        resizeMode: 'contain',
        right: -20,
        bottom: -20,
      }),
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: radius.lg,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      ...(isVertical ? {
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: spacing.lg,
      } : {
        marginLeft: spacing.lg,
      })
    },
    icon: {
      fontSize: 28,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.imageContainer} pointerEvents="none">
          <Image source={image} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
};

export default HomeButtonCard;
