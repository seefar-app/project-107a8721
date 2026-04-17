import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  Transaction,
  Reward,
  Redemption,
  PaymentMethod,
  Offer,
  Notification,
  Order,
  OrderItem,
} from '@/types';

interface StoreState {
  // Transactions
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  fetchTransactions: () => Promise<void>;

  // Rewards
  rewards: Reward[];
  isLoadingRewards: boolean;
  fetchRewards: () => Promise<void>;
  getRewardById: (id: string) => Reward | undefined;

  // Redemptions
  redemptions: Redemption[];
  activeRedemptions: Redemption[];
  redeemReward: (rewardId: string, userId: string) => Promise<Redemption | null>;

  // Payment Methods
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;

  // Offers
  offers: Offer[];
  fetchOffers: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  cancelOrder: (id: string) => Promise<void>;

  // QR Code
  qrCodeData: string | null;
  generateQRCode: (userId: string) => void;

  // Processing payment
  processPayment: (amount: number, userId: string) => Promise<Transaction | null>;
}

function mapDatabaseTransactionToTransaction(dbTransaction: any): Transaction {
  return {
    id: dbTransaction.id,
    userId: dbTransaction.userId,
    amount: parseFloat(dbTransaction.amount),
    pointsEarned: dbTransaction.pointsEarned,
    date: new Date(dbTransaction.date),
    itemsPurchased: [],
    status: dbTransaction.status,
    storeName: dbTransaction.storeName,
    storeAddress: dbTransaction.storeAddress,
    receiptNumber: dbTransaction.receiptNumber,
  };
}

function mapDatabaseRewardToReward(dbReward: any): Reward {
  return {
    id: dbReward.id,
    name: dbReward.name,
    description: dbReward.description,
    pointsRequired: dbReward.pointsRequired,
    category: dbReward.category,
    image: dbReward.image,
    expiresAt: dbReward.expiresAt ? new Date(dbReward.expiresAt) : null,
    quantity: dbReward.quantity,
    terms: dbReward.terms || [],
  };
}

function mapDatabaseRedemptionToRedemption(dbRedemption: any, reward?: any): Redemption {
  return {
    id: dbRedemption.id,
    userId: dbRedemption.userId,
    rewardId: dbRedemption.rewardId,
    reward: reward ? mapDatabaseRewardToReward(reward) : undefined,
    redeemedAt: new Date(dbRedemption.redeemedAt),
    expiresAt: dbRedemption.expiresAt ? new Date(dbRedemption.expiresAt) : undefined,
    status: dbRedemption.status,
    confirmationCode: dbRedemption.confirmationCode,
  };
}

function mapDatabasePaymentMethodToPaymentMethod(dbMethod: any): PaymentMethod {
  return {
    id: dbMethod.id,
    userId: dbMethod.userId,
    cardLast4: dbMethod.cardLast4,
    type: dbMethod.type,
    isDefault: dbMethod.isDefault,
    expiryMonth: dbMethod.expiryMonth,
    expiryYear: dbMethod.expiryYear,
  };
}

function mapDatabaseOfferToOffer(dbOffer: any): Offer {
  return {
    id: dbOffer.id,
    title: dbOffer.title,
    description: dbOffer.description,
    image: dbOffer.image,
    discount: dbOffer.discount,
    validUntil: dbOffer.validUntil ? new Date(dbOffer.validUntil) : undefined,
    code: dbOffer.code,
  };
}

function mapDatabaseNotificationToNotification(dbNotification: any): Notification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type,
    read: dbNotification.read,
    createdAt: new Date(dbNotification.createdAt),
  };
}

function mapDatabaseOrderItemToOrderItem(dbItem: any): OrderItem {
  return {
    id: dbItem.id,
    name: dbItem.name,
    quantity: dbItem.quantity,
    price: parseFloat(dbItem.price),
    image: dbItem.image,
    customizations: dbItem.customizations || [],
  };
}

function mapDatabaseOrderToOrder(dbOrder: any, items?: any[]): Order {
  return {
    id: dbOrder.id,
    userId: dbOrder.userId,
    orderNumber: dbOrder.orderNumber,
    items: items ? items.map(mapDatabaseOrderItemToOrderItem) : [],
    subtotal: parseFloat(dbOrder.subtotal),
    tax: parseFloat(dbOrder.tax),
    discount: parseFloat(dbOrder.discount),
    total: parseFloat(dbOrder.total),
    status: dbOrder.status,
    createdAt: new Date(dbOrder.createdAt),
    storeName: dbOrder.storeName,
    storeAddress: dbOrder.storeAddress,
    estimatedReadyTime: dbOrder.estimatedReadyTime ? new Date(dbOrder.estimatedReadyTime) : undefined,
  };
}

export const useStore = create<StoreState>((set, get) => ({
  // Transactions
  transactions: [],
  isLoadingTransactions: false,

  fetchTransactions: async () => {
    set({ isLoadingTransactions: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ transactions: [], isLoadingTransactions: false });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const transactions = (data || []).map(mapDatabaseTransactionToTransaction);
      set({ transactions, isLoadingTransactions: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ transactions: [], isLoadingTransactions: false });
    }
  },

  // Rewards
  rewards: [],
  isLoadingRewards: false,

  fetchRewards: async () => {
    set({ isLoadingRewards: true });
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rewards = (data || []).map(mapDatabaseRewardToReward);
      set({ rewards, isLoadingRewards: false });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      set({ rewards: [], isLoadingRewards: false });
    }
  },

  getRewardById: (id: string) => {
    return get().rewards.find((r) => r.id === id);
  },

  // Redemptions
  redemptions: [],
  activeRedemptions: [],

  redeemReward: async (rewardId: string, userId: string) => {
    try {
      const reward = get().rewards.find((r) => r.id === rewardId);
      if (!reward) return null;

      const confirmationCode = `BR${Date.now().toString(36).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      const { data, error } = await supabase
        .from('redemptions')
        .insert({
          userId,
          rewardId,
          confirmationCode,
          expiresAt: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const redemption = mapDatabaseRedemptionToRedemption(data, reward);

      set((state) => ({
        redemptions: [...state.redemptions, redemption],
        activeRedemptions: [...state.activeRedemptions, redemption],
      }));

      return redemption;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return null;
    }
  },

  // Payment Methods
  paymentMethods: [],
  defaultPaymentMethod: null,

  addPaymentMethod: async (method) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          userId: user.id,
          ...method,
        })
        .select()
        .single();

      if (error) throw error;

      const newMethod = mapDatabasePaymentMethodToPaymentMethod(data);
      set((state) => ({
        paymentMethods: [...state.paymentMethods, newMethod],
      }));
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  },

  setDefaultPaymentMethod: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ isDefault: false })
        .eq('userId', user.id);

      if (updateError) throw updateError;

      const { error: setDefaultError } = await supabase
        .from('payment_methods')
        .update({ isDefault: true })
        .eq('id', id);

      if (setDefaultError) throw setDefaultError;

      set((state) => ({
        paymentMethods: state.paymentMethods.map((m) => ({
          ...m,
          isDefault: m.id === id,
        })),
        defaultPaymentMethod: state.paymentMethods.find((m) => m.id === id) || null,
      }));
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  },

  // Offers
  offers: [],

  fetchOffers: async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const offers = (data || []).map(mapDatabaseOfferToOffer);
      set({ offers });
    } catch (error) {
      console.error('Error fetching offers:', error);
      set({ offers: [] });
    }
  },

  // Notifications
  notifications: [],
  unreadCount: 0,

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Orders
  orders: [],
  isLoadingOrders: false,

  fetchOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ orders: [], isLoadingOrders: false });
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      const orders: Order[] = [];
      for (const order of data || []) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('orderId', order.id);

        if (itemsError) throw itemsError;

        orders.push(mapDatabaseOrderToOrder(order, items || []));
      }

      set({ orders, isLoadingOrders: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ orders: [], isLoadingOrders: false });
    }
  },

  getOrderById: (id: string) => {
    return get().orders.find((o) => o.id === id);
  },

  cancelOrder: async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status: 'cancelled' as const } : o
        ),
      }));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  },

  // QR Code
  qrCodeData: null,

  generateQRCode: (userId: string) => {
    const data = JSON.stringify({
      type: 'brew_rewards_payment',
      userId,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2, 15),
    });
    set({ qrCodeData: data });
  },

  // Process Payment
  processPayment: async (amount: number, userId: string) => {
    try {
      const pointsEarned = Math.floor(amount * 1.5);

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          userId,
          amount,
          pointsEarned,
          status: 'completed',
          storeName: 'Brew Rewards - Downtown',
          storeAddress: '123 Main Street',
          receiptNumber: `BR-${Date.now().toString(36).toUpperCase()}`,
        })
        .select()
        .single();

      if (error) throw error;

      const transaction = mapDatabaseTransactionToTransaction(data);

      set((state) => ({
        transactions: [transaction, ...state.transactions],
      }));

      return transaction;
    } catch (error) {
      console.error('Error processing payment:', error);
      return null;
    }
  },
}));