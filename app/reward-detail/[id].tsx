import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useColors } from '@/hooks/useThemeColor';
import { Gradients, Shadows } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, updateUser } = useAuthStore();
  const { getRewardById, redeemReward } = useStore();

  const [isRedeeming, setIsRedeeming] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const reward = getRewardById(id as string);

  useEffect(() => {
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

  if (!reward || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Reward not found</Text>
        </View>
      </View>
    );
  }

  const canRedeem = user.totalPoints >= reward.pointsRequired;
  const pointsNeeded = reward.pointsRequired - user.totalPoints;

  const handleRedeem = async () => {
    if (!canRedeem) {
      Alert.alert(
        'Not Enough Points',
        `You need ${pointsNeeded.toLocaleString()} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.name} for ${reward.pointsRequired.toLocaleString()} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          style: 'default',
          onPress: async () => {
            setIsRedeeming(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const redemption = await redeemReward(reward.id, user.id);

            if (redemption) {
              updateUser({ totalPoints: user.totalPoints - reward.pointsRequired });
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              Alert.alert(
                'Success! 🎉',
                `Your reward is ready to use!\n\nConfirmation Code: ${redemption.confirmationCode}`,
                [
                  {
                    text: 'View My Rewards',
                    onPress: () => router.push('/(tabs)/rewards'),
                  },
                ]
              );
            } else {
              Alert.alert('Error', 'Failed to redeem reward. Please try again.');
            }

            setIsRedeeming(false);
          },
        },
      ]
    );
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: reward.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.imageGradient}
          />
          
          {/* Header Buttons */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            >
              <Ionicons name="share-outline" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Category Badge */}
          <View style={styles.categoryBadgeContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
              <Ionicons name={getCategoryIcon()} size={16} color={colors.primary} />
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>{reward.name}</Text>
            <View style={styles.pointsRow}>
              <Ionicons name="star" size={20} color={colors.primary} />
              <Text style={[styles.pointsValue, { color: colors.primary }]}>
                {reward.pointsRequired.toLocaleString()}
              </Text>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>points</Text>
            </View>
          </View>

          {/* Availability Status */}
          {reward.quantity > 0 && reward.quantity <= 20 && (
            <Card variant="filled" style={[styles.warningCard, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                Only {reward.quantity} rewards remaining
              </Text>
            </Card>
          )}

          {reward.expiresAt && (
            <Card variant="filled" style={[styles.infoCard, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                Expires {new Date(reward.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </Card>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Reward</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {reward.description}
            </Text>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Terms & Conditions</Text>
            <Card variant="outlined">
              {reward.terms.map((term, index) => (
                <View key={index} style={styles.termRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.termText, { color: colors.textSecondary }]}>{term}</Text>
                </View>
              ))}
            </Card>
          </View>

          {/* Points Status */}
          <Card variant="filled" style={styles.pointsStatusCard}>
            <View style={styles.pointsStatusRow}>
              <Text style={[styles.pointsStatusLabel, { color: colors.textSecondary }]}>
                Your Points
              </Text>
              <Text style={[styles.pointsStatusValue, { color: colors.text }]}>
                {user.totalPoints.toLocaleString()}
              </Text>
            </View>
            <View style={styles.pointsStatusRow}>
              <Text style={[styles.pointsStatusLabel, { color: colors.textSecondary }]}>
                Required
              </Text>
              <Text style={[styles.pointsStatusValue, { color: colors.text }]}>
                {reward.pointsRequired.toLocaleString()}
              </Text>
            </View>
            {!canRedeem && (
              <View style={[styles.pointsStatusRow, styles.pointsStatusHighlight]}>
                <Text style={[styles.pointsStatusLabel, { color: colors.error }]}>
                  Points Needed
                </Text>
                <Text style={[styles.pointsStatusValue, { color: colors.error }]}>
                  {pointsNeeded.toLocaleString()}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 16, backgroundColor: colors.card },
          Shadows.lg,
        ]}
      >
        <Button
          label={isRedeeming ? 'Redeeming...' : canRedeem ? 'Redeem Now' : 'Not Enough Points'}
          onPress={handleRedeem}
          variant={canRedeem ? 'primary' : 'secondary'}
          disabled={!canRedeem || isRedeeming}
          icon={isRedeeming ? undefined : 'gift'}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  categoryBadgeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    ...Shadows.md,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  pointsLabel: {
    fontSize: 14,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  termRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  termText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  pointsStatusCard: {
    marginTop: 24,
    gap: 12,
  },
  pointsStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsStatusHighlight: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  pointsStatusLabel: {
    fontSize: 14,
  },
  pointsStatusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});