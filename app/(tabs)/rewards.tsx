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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { RewardCard } from '@/components/shared/RewardCard';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { RewardCategory } from '@/types';

const CATEGORIES: { id: RewardCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'drinks', label: 'Drinks', icon: 'cafe' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'merchandise', label: 'Merch', icon: 'gift' },
  { id: 'experiences', label: 'Experiences', icon: 'sparkles' },
];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const { rewards, fetchRewards, isLoadingRewards, activeRedemptions } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'all'>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchRewards();

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
    await fetchRewards();
    setRefreshing(false);
  };

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter((r) => r.category === selectedCategory);

  const handleCategoryPress = (category: RewardCategory | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handleRewardPress = (rewardId: string) => {
    router.push(`/reward-detail/${rewardId}`);
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Rewards</Text>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.primary }]}>
              {user.totalPoints.toLocaleString()} pts
            </Text>
          </View>
        </View>

        {/* Active Redemptions */}
        {activeRedemptions.length > 0 && (
          <Pressable style={[styles.activeRedemptionsBanner, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.activeRedemptionsText, { color: colors.success }]}>
              {activeRedemptions.length} active reward{activeRedemptions.length !== 1 ? 's' : ''} to use
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.success} />
          </Pressable>
        )}

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                  },
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isSelected ? '#ffffff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? '#ffffff' : colors.textSecondary },
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
          {/* Results header */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {filteredRewards.length} reward{filteredRewards.length !== 1 ? 's' : ''} available
            </Text>
            <Pressable style={styles.sortButton}>
              <Ionicons name="funnel-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.sortText, { color: colors.textSecondary }]}>Sort</Text>
            </Pressable>
          </View>

          {/* Rewards list */}
          {isLoadingRewards ? (
            <View style={styles.rewardsList}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : filteredRewards.length > 0 ? (
            <View style={styles.rewardsList}>
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onPress={() => handleRewardPress(reward.id)}
                  userPoints={user.totalPoints}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No rewards in this category
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                Check back later for new rewards!
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
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeRedemptionsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  activeRedemptionsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rewardsList: {
    gap: 0,
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