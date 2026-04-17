import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Reward } from '@/types';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';

interface RewardCardProps {
  reward: Reward;
  onPress: () => void;
  userPoints: number;
}

export function RewardCard({ reward, onPress, userPoints }: RewardCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const canRedeem = userPoints >= reward.pointsRequired;

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

  const getCategoryIcon = () => {
    switch (reward.category) {
      case 'drinks':
        return 'cafe';
      case 'food':
        return 'restaurant';
      case 'merchandise':
        return 'gift';
      case 'experiences':
        return 'sparkles';
      default:
        return 'star';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: colors.card }, Shadows.md]}
      >
        <Image
          source={{ uri: reward.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon()} size={12} color={colors.primary} />
        </View>

        {/* Limited quantity indicator */}
        {reward.quantity > 0 && reward.quantity <= 20 && (
          <View style={[styles.limitedBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.limitedText}>Only {reward.quantity} left</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {reward.name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {reward.description}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={[styles.points, { color: colors.primary }]}>
                {reward.pointsRequired.toLocaleString()}
              </Text>
            </View>
            
            {canRedeem ? (
              <Badge label="Available" variant="success" size="sm" />
            ) : (
              <Text style={[styles.needMore, { color: colors.textMuted }]}>
                Need {(reward.pointsRequired - userPoints).toLocaleString()} more
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 140,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  limitedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  points: {
    fontSize: 16,
    fontWeight: '700',
  },
  needMore: {
    fontSize: 11,
    fontWeight: '500',
  },
});