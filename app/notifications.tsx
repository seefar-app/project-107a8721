import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useStore();

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

  const handleNotificationPress = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllAsRead();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'points':
        return { name: 'star', color: colors.primary };
      case 'reward':
        return { name: 'gift', color: colors.success };
      case 'offer':
        return { name: 'pricetag', color: colors.warning };
      default:
        return { name: 'notifications', color: colors.textSecondary };
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NEW</Text>
              {unreadNotifications.map((notification) => {
                const icon = getNotificationIcon(notification.type);
                return (
                  <Pressable
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <Card
                      variant="default"
                      style={[styles.notificationCard, { backgroundColor: colors.primaryLight }]}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: icon.color }]}>
                        <Ionicons name={icon.name as any} size={20} color="#ffffff" />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={[styles.notificationTitle, { color: colors.text }]}>
                          {notification.title}
                        </Text>
                        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                          {notification.message}
                        </Text>
                        <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Text>
                      </View>
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>EARLIER</Text>
              {readNotifications.map((notification) => {
                const icon = getNotificationIcon(notification.type);
                return (
                  <Pressable
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <Card variant="default" style={styles.notificationCard}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: colors.backgroundSecondary },
                        ]}
                      >
                        <Ionicons name={icon.name as any} size={20} color={icon.color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={[styles.notificationTitle, { color: colors.text }]}>
                          {notification.title}
                        </Text>
                        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                          {notification.message}
                        </Text>
                        <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                We'll notify you when something important happens
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
    ...Shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});