import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      gap: 8,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 16 },
      md: { paddingVertical: 14, paddingHorizontal: 24 },
      lg: { paddingVertical: 18, paddingHorizontal: 32 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? colors.textMuted : colors.primary,
        ...Shadows.md,
      },
      secondary: {
        backgroundColor: colors.backgroundSecondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? colors.textMuted : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      destructive: {
        backgroundColor: disabled ? colors.textMuted : colors.error,
        ...Shadows.md,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#ffffff' },
      secondary: { color: colors.text },
      outline: { color: disabled ? colors.textMuted : colors.primary },
      ghost: { color: disabled ? colors.textMuted : colors.primary },
      destructive: { color: '#ffffff' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const iconColor = getTextStyles().color as string;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[getButtonStyles(), style]}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} />
            )}
            <Text style={getTextStyles()}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} />
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}