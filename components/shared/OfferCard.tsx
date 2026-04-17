import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { Offer } from '@/types';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';

interface OfferCardProps {
  offer: Offer;
  onPress: () => void;
}

export function OfferCard({ offer, onPress }: OfferCardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const getTimeRemaining = () => {
    const now = new Date();
    const daysLeft = differenceInDays(offer.validUntil, now);
    const hoursLeft = differenceInHours(offer.validUntil, now);

    if (daysLeft > 1) {
      return `${daysLeft} days left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft} hours left`;
    }
    return 'Expires soon';
  };

  const isExpiringSoon = differenceInDays(offer.validUntil, new Date()) <= 2;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, Shadows.md]}
      >
        <Image
          source={{ uri: offer.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          {/* Discount badge */}
          <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.discountText}>{offer.discount}% OFF</Text>
          </View>

          {/* Timer badge */}
          <View style={[
            styles.timerBadge,
            { backgroundColor: isExpiringSoon ? colors.error : 'rgba(255,255,255,0.2)' }
          ]}>
            <Ionicons name="time-outline" size={12} color="#ffffff" />
            <Text style={styles.timerText}>{getTimeRemaining()}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {offer.description}
            </Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Use code:</Text>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{offer.code}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  timerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {},
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});