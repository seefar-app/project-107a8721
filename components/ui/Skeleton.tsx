import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useThemeColor';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton height={120} borderRadius={12} />
      <View style={skeletonStyles.cardContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={skeletonStyles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={skeletonStyles.listContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  listContent: {
    flex: 1,
  },
});