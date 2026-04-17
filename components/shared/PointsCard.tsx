import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { User } from '@/types';
import { TIERS, getTierForPoints, getNextTier, getPointsToNextTier } from '@/constants/Tiers';
import { Gradients, Shadows } from '@/constants/Colors';

interface PointsCardProps {
  user: User;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PointsCard({ user }: PointsCardProps) {
  const currentTier = getTierForPoints(user.totalPoints);
  const nextTier = getNextTier(currentTier.name);
  const pointsToNext = getPointsToNextTier(user.totalPoints, currentTier.name);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const progress = nextTier 
    ? (user.totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)
    : 1;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1200,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getTierGradient = () => {
    switch (currentTier.name) {
      case 'platinum':
        return ['#e5e4e2', '#c0c0c0', '#a0a0a0'] as const;
      case 'gold':
        return Gradients.gold;
      case 'silver':
        return Gradients.silver;
      default:
        return Gradients.bronze;
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={getTierGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        
        {/* Card content */}
        <View style={styles.header}>
          <View style={styles.tierBadge}>
            <Ionicons
              name={currentTier.icon as any}
              size={16}
              color={currentTier.name === 'gold' || currentTier.name === 'bronze' ? '#1f2937' : '#374151'}
            />
            <Text style={styles.tierText}>{currentTier.displayName} Member</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={24} color="rgba(0,0,0,0.3)" />
          </View>
        </View>

        <View style={styles.pointsSection}>
          <Text style={styles.pointsLabel}>Available Points</Text>
          <Text style={styles.pointsValue}>
            {user.totalPoints.toLocaleString()}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{user.name}</Text>
          <Text style={styles.memberId}>
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {/* Progress to next tier */}
        {nextTier && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {pointsToNext} points to {nextTier.displayName}
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />
            </View>
          </View>
        )}

        {/* Multiplier badge */}
        <View style={styles.multiplierBadge}>
          <Ionicons name="flash" size={12} color="#fbbf24" />
          <Text style={styles.multiplierText}>
            {currentTier.pointsMultiplier}x points
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    ...Shadows.xl,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    minHeight: 220,
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  logoContainer: {
    opacity: 0.5,
  },
  pointsSection: {
    marginTop: 24,
  },
  pointsLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.85)',
    marginTop: 4,
    letterSpacing: -1,
  },
  memberInfo: {
    marginTop: 16,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
  },
  memberId: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.8)',
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
  },
  multiplierBadge: {
    position: 'absolute',
    top: 24,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  multiplierText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
});