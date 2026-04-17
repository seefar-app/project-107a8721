import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Transaction } from '@/types';
import { useColors } from '@/hooks/useThemeColor';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const router = useRouter();
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push(`/transaction-detail/${transaction.id}`);
    }
  };

  const firstItem = transaction.itemsPurchased[0];
  const additionalItems = transaction.itemsPurchased.length - 1;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: colors.card }]}
      >
        {firstItem.image ? (
          <Image
            source={{ uri: firstItem.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="cafe" size={24} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
              {transaction.storeName}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              ${transaction.amount.toFixed(2)}
            </Text>
          </View>

          <Text style={[styles.items, { color: colors.textSecondary }]} numberOfLines={1}>
            {firstItem.name}
            {additionalItems > 0 && ` +${additionalItems} more`}
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {format(new Date(transaction.date), 'MMM d, h:mm a')}
            </Text>
            <View style={styles.points}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={[styles.pointsText, { color: colors.primary }]}>
                +{transaction.pointsEarned}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  items: {
    fontSize: 13,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
  },
});