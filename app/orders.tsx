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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Order } from '@/types';

type OrderFilter = 'all' | 'active' | 'completed';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { orders, fetchOrders, isLoadingOrders } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchOrders();

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
    await fetchOrders();
    setRefreshing(false);
  };

  const filterOrders = (orderList: Order[]) => {
    switch (orderFilter) {
      case 'active':
        return orderList.filter(o => o.status === 'preparing' || o.status === 'ready');
      case 'completed':
        return orderList.filter(o => o.status === 'completed' || o.status === 'cancelled');
      default:
        return orderList;
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
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

  const getOrderStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatOrderDate = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const filteredOrders = filterOrders(orders);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order Filter */}
        <View style={styles.filterRow}>
          {(['all', 'active', 'completed'] as OrderFilter[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOrderFilter(filter);
              }}
              style={[
                styles.filterButton,
                {
                  backgroundColor: orderFilter === filter ? colors.primary : colors.backgroundSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: orderFilter === filter ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {filter === 'all' ? 'All Orders' : filter === 'active' ? 'Active' : 'Completed'}
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
          {isLoadingOrders ? (
            <View style={styles.ordersList}>
              <Skeleton width="100%" height={120} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={120} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={120} style={{ marginBottom: 12 }} />
            </View>
          ) : filteredOrders.length > 0 ? (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => {
                // Defensive check: ensure items array exists
                const items = order.items || [];
                const itemCount = items.length;
                
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/order-detail/${order.id}`);
                    }}
                  >
                    <Card variant="default" style={styles.orderCard}>
                      <View style={styles.orderHeader}>
                        <View style={styles.orderInfo}>
                          <Text style={[styles.orderNumber, { color: colors.text }]}>
                            Order #{order.orderNumber}
                          </Text>
                          <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                            {formatOrderDate(order.createdAt)}
                          </Text>
                        </View>
                        <Badge
                          label={getOrderStatusLabel(order.status)}
                          variant={order.status === 'ready' ? 'success' : order.status === 'preparing' ? 'warning' : 'default'}
                        />
                      </View>

                      <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

                      <View style={styles.orderItems}>
                        {items.slice(0, 2).map((item, index) => (
                          <View key={index} style={styles.orderItem}>
                            <Text style={[styles.itemQuantity, { color: colors.textMuted }]}>
                              {item.quantity}x
                            </Text>
                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                          </View>
                        ))}
                        {itemCount > 2 && (
                          <Text style={[styles.moreItems, { color: colors.textMuted }]}>
                            +{itemCount - 2} more item{itemCount - 2 > 1 ? 's' : ''}
                          </Text>
                        )}
                      </View>

                      <View style={styles.orderFooter}>
                        <View style={styles.storeInfo}>
                          <Ionicons name="location" size={14} color={colors.textMuted} />
                          <Text style={[styles.storeName, { color: colors.textSecondary }]} numberOfLines={1}>
                            {order.storeName}
                          </Text>
                        </View>
                        <Text style={[styles.orderTotal, { color: colors.text }]}>
                          ${order.total.toFixed(2)}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No orders found
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {orderFilter !== 'all'
                  ? 'Try selecting a different filter'
                  : 'Your order history will appear here'}
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
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
    paddingBottom: 40,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    marginBottom: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
  },
  orderDivider: {
    height: 1,
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 38,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  storeName: {
    fontSize: 13,
    flex: 1,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
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