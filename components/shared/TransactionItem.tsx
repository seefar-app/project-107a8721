import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { useColors } from '@/hooks/useThemeColor';
import { Badge } from '@/components/ui/Badge';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
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

  const getStatusVariant = () => {
    switch (transaction.status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: colors.card }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
              {transaction.storeName}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              ${transaction.amount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {format(new Date(transaction.date), 'MMM d, h:mm a')}
            </Text>
            <View style={styles.pointsEarned}>
              <Ionicons name="star" size={12} color={colors.success} />
              <Text style={[styles.pointsText, { color: colors.success }]}>
                +{transaction.pointsEarned}
              </Text>
            </View>
          </View>

          <View style={styles.itemsRow}>
            <Text style={[styles.itemsText, { color: colors.textSecondary }]} numberOfLines={1}>
              {transaction.itemsPurchased.length} item{transaction.itemsPurchased.length !== 1 ? 's' : ''}
              {' • '}
              {transaction.itemsPurchased.map(i => i.name).join(', ')}
            </Text>
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsRow: {
    marginTop: 6,
  },
  itemsText: {
    fontSize: 12,
  },
});