import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { transactions } = useStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const transaction = transactions.find(t => t.id === id);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Receipt</Text>
        <Pressable style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Status Card */}
          <Card variant="elevated" style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            </View>
            <Text style={[styles.statusTitle, { color: colors.text }]}>Payment Successful</Text>
            <Text style={[styles.statusDate, { color: colors.textSecondary }]}>
              {format(new Date(transaction.date), 'MMMM d, yyyy • h:mm a')}
            </Text>
            <Badge label={transaction.status} variant="success" size="md" />
          </Card>

          {/* Amount Card */}
          <Card variant="outlined" style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total Amount</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              ${transaction.amount.toFixed(2)}
            </Text>
            <View style={styles.pointsEarned}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={[styles.pointsEarnedText, { color: colors.primary }]}>
                +{transaction.pointsEarned} points earned
              </Text>
            </View>
          </Card>

          {/* Items */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Items Purchased</Text>
            <Card variant="default" padding="none">
              {transaction.itemsPurchased.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    index !== transaction.itemsPurchased.length - 1 && {
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
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </Card>
          </View>

          {/* Store Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Store Information</Text>
            <Card variant="outlined">
              <View style={styles.storeRow}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.storeDetails}>
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

          {/* Receipt Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt Details</Text>
            <Card variant="outlined">
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Receipt Number
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {transaction.receiptNumber}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Transaction ID
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {transaction.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Payment Method
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>Visa •••• 4242</Text>
              </View>
            </Card>
          </View>

          {/* Help Section */}
          <Card variant="filled" style={[styles.helpCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Need help with this transaction?
            </Text>
            <Pressable>
              <Text style={[styles.helpLink, { color: colors.primary }]}>Contact Support</Text>
            </Pressable>
          </Card>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 13,
    marginBottom: 12,
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  amountLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsEarnedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  storeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
  },
  helpLink: {
    fontSize: 13,
    fontWeight: '600',
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