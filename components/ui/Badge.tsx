import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useThemeColor';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  tierColor?: string;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  tierColor,
  style,
}: BadgeProps) {
  const colors = useColors();

  const getVariantStyles = () => {
    const variants = {
      default: {
        backgroundColor: colors.backgroundTertiary,
        textColor: colors.text,
      },
      success: {
        backgroundColor: colors.successLight,
        textColor: colors.success,
      },
      warning: {
        backgroundColor: colors.warningLight,
        textColor: colors.warning,
      },
      error: {
        backgroundColor: colors.errorLight,
        textColor: colors.error,
      },
      info: {
        backgroundColor: colors.infoLight,
        textColor: colors.info,
      },
      tier: {
        backgroundColor: tierColor ? `${tierColor}20` : colors.primaryLight,
        textColor: tierColor || colors.primary,
      },
    };
    return variants[variant];
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: variantStyles.backgroundColor },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 12 : 14}
          color={variantStyles.textColor}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: variantStyles.textColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 10,
  },
});