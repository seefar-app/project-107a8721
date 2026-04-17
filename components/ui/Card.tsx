import React, { useRef } from 'react';
import { View, Pressable, Animated, ViewStyle, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      overflow: 'hidden',
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { padding: 12 },
      md: { padding: 16 },
      lg: { padding: 24 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.card,
        ...Shadows.sm,
      },
      elevated: {
        backgroundColor: colors.card,
        ...Shadows.lg,
      },
      outlined: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.backgroundSecondary,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[getCardStyle(), style]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}