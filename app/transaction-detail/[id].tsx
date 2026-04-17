import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
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
import { Button } from '@/components/ui/Button';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { transactions } = useStore();

  const transaction = transactions.find((t) => t.id === id);

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

  const handleGetHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to support screen
  };

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  // Defensive check: ensure itemsPurchased array exists
  const items = transaction.itemsPurchased || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Receipt Header */}
          <Card variant="elevated" style={styles.receiptHeader}>
            <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.statusText, { color: colors.success }]}>Completed</Text>
            </View>
            <Text style={[styles.receiptNumber, { color: colors.textMuted }]}>
              Receipt #{transaction.receiptNumber}
            </Text>
            <Text style={[styles.receiptDate, { color: colors.textSecondary }]}>
              {format(new Date(transaction.date), 'EEEE, MMMM d, yyyy • h:mm a')}
            </Text>
          </Card>

          {/* Store Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Location</Text>
            <Card variant="default">
              <View style={styles.storeRow}>
                <View style={[styles.storeIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={[styles.storeName, { color: colors.text }]}>
                    {transaction.storeName}
                  </Text>
                  <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>
                    {transaction.storeAddress}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Items Purchased */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Items Purchased</Text>
            <Card variant="default" padding="none">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      index !== items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                        <Ionicons name="cafe" size={24} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.itemQuantity, { color: colors.textMuted }]}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.textMuted }]}>No items</Text>
                </View>
              )}
            </Card>
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>
            <Card variant="default">
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${transaction.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>$0.00</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryTotal, { color: colors.text }]}>Total</Text>
                <Text style={[styles.summaryTotal, { color: colors.text }]}>
                  ${transaction.amount.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.pointsRow}>
                <View style={styles.pointsInfo}>
                  <Ionicons name="star" size={18} color={colors.primary} />
                  <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                    Points Earned
                  </Text>
                </View>
                <Text style={[styles.pointsValue, { color: colors.primary }]}>
                  +{transaction.pointsEarned}
                </Text>
              </View>
            </Card>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            <Card variant="default">
              <View style={styles.paymentRow}>
                <View style={[styles.cardIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="card" size={20} color={colors.text} />
                </View>
                <Text style={[styles.paymentText, { color: colors.text }]}>
                  Visa ending in 4242
                </Text>
              </View>
            </Card>
          </View>

          {/* Help Button */}
          <Button
            title="Need Help?"
            onPress={handleGetHelp}
            variant="outline"
            icon="help-circle-outline"
            fullWidth
            style={{ marginTop: 8 }}
          />
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
  receiptHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptNumber: {
    fontSize: 13,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
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
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
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
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsLabel: {
    fontSize: 14,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentText: {
    fontSize: 15,
    fontWeight: '500',
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