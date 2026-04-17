import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { getOrderById, cancelOrder } = useStore();

  const order = getOrderById(id || '');

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

  const handleCancelOrder = () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await cancelOrder(order.id);
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
            router.back();
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Reorder', 'This feature will be available soon!');
  };

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Order not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: typeof order.status) => {
    switch (status) {
      case 'preparing':
        return colors.warning;
      case 'ready':
        return colors.success;
      case 'completed':
        return colors.textMuted;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status: typeof order.status) => {
    switch (status) {
      case 'preparing':
        return 'timer-outline';
      case 'ready':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const canCancelOrder = order.status === 'preparing';

  // Defensive check: ensure items array exists
  const items = order.items || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Order Status Card */}
          <Card variant="elevated" style={[styles.statusCard, { backgroundColor: getStatusColor(order.status) + '15' }]}>
            <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons name={getStatusIcon(order.status) as any} size={32} color="#ffffff" />
            </View>
            <Text style={[styles.statusTitle, { color: getStatusColor(order.status) }]}>
              {order.status === 'preparing' && 'Your order is being prepared'}
              {order.status === 'ready' && 'Your order is ready for pickup!'}
              {order.status === 'completed' && 'Order completed'}
              {order.status === 'cancelled' && 'Order cancelled'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              Order #{order.orderNumber}
            </Text>
            <Text style={[styles.statusTime, { color: colors.textMuted }]}>
              Placed {format(order.createdAt, 'MMM d, yyyy • h:mm a')}
            </Text>
          </Card>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
            <Card variant="default" padding="none">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.itemRow,
                      index !== items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    {item.image && (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                      {item.customizations && item.customizations.length > 0 && (
                        <Text style={[styles.itemCustomizations, { color: colors.textMuted }]}>
                          {item.customizations.join(', ')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.itemPricing}>
                      <Text style={[styles.itemQuantity, { color: colors.textMuted }]}>
                        x{item.quantity}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.textMuted }]}>No items in this order</Text>
                </View>
              )}
            </Card>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
            <Card variant="default">
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${order.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${order.tax.toFixed(2)}
                </Text>
              </View>
              {order.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    -${order.discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryTotal, { color: colors.text }]}>Total</Text>
                <Text style={[styles.summaryTotal, { color: colors.text }]}>
                  ${order.total.toFixed(2)}
                </Text>
              </View>
            </Card>
          </View>

          {/* Pickup Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup Location</Text>
            <Card variant="default">
              <View style={styles.locationRow}>
                <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationName, { color: colors.text }]}>
                    {order.storeName}
                  </Text>
                  <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                    {order.storeAddress}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {canCancelOrder && (
              <Button
                title="Cancel Order"
                onPress={handleCancelOrder}
                variant="destructive"
                icon="close-circle-outline"
                fullWidth
                style={{ marginBottom: 12 }}
              />
            )}
            <Button
              title="Reorder"
              onPress={handleReorder}
              variant="primary"
              icon="repeat-outline"
              fullWidth
            />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    ...Shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCustomizations: {
    fontSize: 12,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 13,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
  },
  actions: {
    marginTop: 8,
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