import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Transaction } from '@/types';

type TimeFilter = 'all' | 'week' | 'month';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { transactions, fetchTransactions, isLoadingTransactions } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchTransactions();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filterTransactions = (txs: Transaction[]) => {
    const now = new Date();
    switch (timeFilter) {
      case 'week':
        return txs.filter((t) => isThisWeek(new Date(t.date)));
      case 'month':
        return txs.filter((t) => isThisMonth(new Date(t.date)));
      default:
        return txs;
    }
  };

  const groupTransactions = (txs: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    txs.forEach((tx) => {
      const date = new Date(tx.date);
      let key: string;

      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else if (isThisWeek(date)) {
        key = 'This Week';
      } else if (isThisMonth(date)) {
        key = 'This Month';
      } else {
        key = format(date, 'MMMM yyyy');
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tx);
    });

    return groups;
  };

  const filteredTransactions = filterTransactions(transactions);
  const groupedTransactions = groupTransactions(filteredTransactions);
  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = filteredTransactions.reduce((sum, t) => sum + t.pointsEarned, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Transaction History</Text>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card variant="filled" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="card" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${totalSpent.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Spent</Text>
          </Card>
          <Card variant="filled" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="star" size={18} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalEarned.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Points Earned</Text>
          </Card>
        </View>

        {/* Time Filter */}
        <View style={styles.filterRow}>
          {(['all', 'week', 'month'] as TimeFilter[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeFilter(filter);
              }}
              style={[
                styles.filterButton,
                {
                  backgroundColor: timeFilter === filter ? colors.primary : colors.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: timeFilter === filter ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {isLoadingTransactions ? (
            <View style={styles.transactionsList}>
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </View>
          ) : filteredTransactions.length > 0 ? (
            Object.entries(groupedTransactions).map(([groupTitle, txs]) => (
              <View key={groupTitle} style={styles.group}>
                <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
                  {groupTitle}
                </Text>
                {txs.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => {}}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                {timeFilter !== 'all'
                  ? 'Try selecting a different time period'
                  : 'Your purchase history will appear here'}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  transactionsList: {
    gap: 0,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});