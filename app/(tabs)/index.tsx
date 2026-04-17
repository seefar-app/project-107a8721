import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { Gradients, Shadows } from '@/constants/Colors';
import { PointsCard } from '@/components/shared/PointsCard';
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay';
import { QuickActions } from '@/components/shared/QuickActions';
import { OfferCard } from '@/components/shared/OfferCard';
import { TransactionItem } from '@/components/shared/TransactionItem';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonListItem } from '@/components/ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const {
    transactions,
    offers,
    notifications,
    unreadCount,
    fetchTransactions,
    fetchOffers,
    isLoadingTransactions,
    generateQRCode,
    qrCodeData,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchTransactions();
    fetchOffers();
    if (user) {
      generateQRCode(user.id);
    }

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
    await Promise.all([fetchTransactions(), fetchOffers()]);
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'scan',
      icon: 'qr-code' as const,
      label: 'Scan',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowQR(false);
      },
      gradient: Gradients.primary,
    },
    {
      id: 'pay',
      icon: 'wallet' as const,
      label: 'Pay',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowQR(true);
      },
      gradient: Gradients.success,
    },
    {
      id: 'order',
      icon: 'cafe' as const,
      label: 'Order',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      gradient: Gradients.coffee,
    },
    {
      id: 'stores',
      icon: 'location' as const,
      label: 'Stores',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      gradient: Gradients.sunset,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient colors={Gradients.primary} style={styles.headerGradient}>
          <Animated.View
            style={[
              styles.header,
              { paddingTop: insets.top + 16 },
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{user.name.split(' ')[0]} ☕</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/notifications');
                  }}
                  style={styles.notificationButton}
                >
                  <Ionicons name="notifications-outline" size={24} color="#ffffff" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </Pressable>
                <Avatar source={user.avatar} size="md" />
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Points Card */}
        <View style={styles.pointsCardContainer}>
          <PointsCard user={user} />
        </View>

        {/* QR Code Display (when Pay is pressed) */}
        {showQR && qrCodeData && (
          <Animated.View style={[styles.qrSection, { opacity: fadeAnim }]}>
            <Card variant="elevated" padding="none" style={[styles.qrCard, { backgroundColor: colors.card }]}>
              <QRCodeDisplay data={qrCodeData} size={180} userName={user.name} />
            </Card>
            <Pressable
              onPress={() => setShowQR(false)}
              style={[styles.hideQRButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Ionicons name="chevron-up" size={20} color={colors.textMuted} />
              <Text style={[styles.hideQRText, { color: colors.textMuted }]}>Hide QR Code</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <QuickActions actions={quickActions} />
        </Animated.View>

        {/* Special Offers */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Offers</Text>
              <Pressable>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScroll}
            >
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onPress={() => {}} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.transactionsList}>
            {isLoadingTransactions ? (
              <>
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 3).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
                  Start earning points with your first purchase!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tier Benefits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Gold Benefits</Text>
          <Card variant="outlined" style={styles.benefitsCard}>
            {[
              { icon: 'star', text: 'Earn 1.5x points on every purchase' },
              { icon: 'cafe', text: 'Free size upgrades all day' },
              { icon: 'flash', text: 'Priority mobile ordering' },
              { icon: 'calendar', text: 'Exclusive member events' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={benefit.icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={[styles.benefitText, { color: colors.text }]}>{benefit.text}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  pointsCardContainer: {
    marginTop: -50,
    zIndex: 1,
  },
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  qrCard: {
    borderRadius: 24,
  },
  hideQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  hideQRText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  offersScroll: {
    paddingRight: 20,
  },
  transactionsList: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  benefitsCard: {
    marginTop: 8,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
});