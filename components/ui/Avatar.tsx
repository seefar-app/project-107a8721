import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useThemeColor';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  style?: ViewStyle;
}

const SIZES = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function Avatar({
  source,
  name,
  size = 'md',
  showStatus = false,
  status = 'offline',
  style,
}: AvatarProps) {
  const colors = useColors();
  const dimension = SIZES[size];
  const fontSize = dimension * 0.4;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusColors = {
    online: colors.success,
    offline: colors.textMuted,
    away: colors.warning,
  };

  const statusDotSize = Math.max(dimension * 0.25, 8);

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: '#ffffff' }]}>
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              backgroundColor: statusColors[status],
              borderColor: colors.background,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
  },
});