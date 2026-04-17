import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/useAuthStore';
import { useColors } from '@/hooks/useThemeColor';
import { Gradients, Shadows } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TIERS, getTierForPoints, getNextTier, getPointsToNextTier } from '@/constants/Tiers';

interface SettingsItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { user, logout } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (!user) return null;

  const currentTier = getTierForPoints(user.totalPoints);
  const nextTier = getNextTier(currentTier.name);
  const pointsToNext = getPointsToNextTier(user.totalPoints, currentTier.name);

  const settingsGroups: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'personal',
          icon: 'person-outline',
          label: 'Personal Information',
          onPress: () => {},
        },
        {
          id: 'payment',
          icon: 'card-outline',
          label: 'Payment Methods',
          value: '2 cards',
          onPress: () => {},
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'favorites',
          icon: 'heart-outline',
          label: 'Favorite Items',
          value: `${user.favoriteItems.length} items`,
          onPress: () => {},
        },
        {
          id: 'appearance',
          icon: 'color-palette-outline',
          label: 'Appearance',
          value: 'System',
          onPress: () => {},
        },
        {
          id: 'language',
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          label: 'Help Center',
          onPress: () => {},
        },
        {
          id: 'feedback',
          icon: 'chatbubble-outline',
          label: 'Send Feedback',
          onPress: () => {},
        },
        {
          id: 'rate',
          icon: 'star-outline',
          label: 'Rate the App',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy',
          icon: 'shield-outline',
          label: 'Privacy Policy',
          onPress: () => {},
        },
        {
          id: 'terms',
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: () => {},
        },
        {
          id: 'logout',
          icon: 'log-out-outline',
          label: 'Sign Out',
          onPress: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with gradient */}
        <LinearGradient colors={Gradients.primary} style={styles.headerGradient}>
          <View style={{ paddingTop: insets.top + 16 }}>
            <Animated.View
              style={[
                styles.profileHeader,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Avatar source={user.avatar} size="xl" />
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              
              <View style={styles.tierBadgeContainer}>
                <Badge
                  label={currentTier.displayName}
                  variant="tier"
                  tierColor={currentTier.color}
                  icon={currentTier.icon as any}
                />
              </View>
            </Animated.View>
          </View>
        </LinearGradient>

        {/* Tier Progress Card */}
        <View style={styles.tierCardContainer}>
          <Card variant="elevated" style={styles.tierCard}>
            <View style={styles.tierCardHeader}>
              <Text style={[styles.tierCardTitle, { color: colors.text }]}>
                Your Rewards Status
              </Text>
              <Text style={[styles.tierPointsValue, { color: colors.primary }]}>
                {user.totalPoints.toLocaleString()} pts
              </Text>
            </View>

            {nextTier && (
              <>
                <View style={styles.tierProgressContainer}>
                  <View style={[styles.tierProgressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.tierProgressFill,
                        {
                          backgroundColor: currentTier.color,
                          width: `${Math.min(100, ((user.totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.tierLabels}>
                    <Text style={[styles.tierLabel, { color: colors.textMuted }]}>
                      {currentTier.displayName}
                    </Text>
                    <Text style={[styles.tierLabel, { color: colors.textMuted }]}>
                      {nextTier.displayName}
                    </Text>
                  </View>
                </View>

                <View style={[styles.tierInfoBox, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="trending-up" size={18} color={colors.primary} />
                  <Text style={[styles.tierInfoText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>{pointsToNext}</Text> more points to {nextTier.displayName}
                  </Text>
                </View>
              </>
            )}

            {!nextTier && (
              <View style={[styles.tierInfoBox, { backgroundColor: colors.successLight }]}>
                <Ionicons name="trophy" size={18} color={colors.success} />
                <Text style={[styles.tierInfoText, { color: colors.success }]}>
                  You've reached the highest tier! 🎉
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Settings Groups */}
        <Animated.View
          style={[
            styles.settingsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {settingsGroups.map((group) => (
            <View key={group.title} style={styles.settingsGroup}>
              <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
                {group.title}
              </Text>
              <Card variant="default" padding="none">
                {group.items.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      item.onPress();
                    }}
                    style={({ pressed }) => [
                      styles.settingsItem,
                      pressed && { backgroundColor: colors.backgroundSecondary },
                      index !== group.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[
                      styles.settingsIcon,
                      { backgroundColor: item.destructive ? colors.errorLight : colors.backgroundSecondary },
                    ]}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.destructive ? colors.error : colors.primary}
                      />
                    </View>
                    <Text style={[
                      styles.settingsLabel,
                      { color: item.destructive ? colors.error : colors.text },
                    ]}>
                      {item.label}
                    </Text>
                    <View style={styles.settingsRight}>
                      {item.value && (
                        <Text style={[styles.settingsValue, { color: colors.textMuted }]}>
                          {item.value}
                        </Text>
                      )}
                      {item.badge && (
                        <Badge label={item.badge} variant="info" size="sm" />
                      )}
                      {!item.destructive && (
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}
        </Animated.View>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Brew Rewards v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 60,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  tierBadgeContainer: {
    marginTop: 12,
  },
  tierCardContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  tierCard: {
    borderRadius: 20,
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tierPointsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  tierProgressContainer: {
    marginBottom: 12,
  },
  tierProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tierInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  tierInfoText: {
    fontSize: 13,
    flex: 1,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 14,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 20,
  },
});