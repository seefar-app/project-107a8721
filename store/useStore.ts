import { create } from 'zustand';
import { 
  Transaction, 
  Reward, 
  Redemption, 
  PaymentMethod, 
  Offer,
  Notification,
  RewardCategory,
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
  setDefaultPaymentMethod: (id: string) => void;
  
  // Offers
  offers: Offer[];
  fetchOffers: () => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  // QR Code
  qrCodeData: string | null;
  generateQRCode: (userId: string) => void;
  
  // Processing payment
  processPayment: (amount: number, userId: string) => Promise<Transaction | null>;
}

// Mock Data
const mockTransactions: Transaction[] = [
  {
    id: crypto.randomUUID(),
    userId: '1',
    amount: 12.50,
    pointsEarned: 19,
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    itemsPurchased: [
      { id: '1', name: 'Caramel Macchiato', quantity: 1, price: 5.50, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200' },
      { id: '2', name: 'Blueberry Muffin', quantity: 1, price: 4.00 },
      { id: '3', name: 'Croissant', quantity: 1, price: 3.00 },
    ],
    status: 'completed',
    storeName: 'Brew Rewards - Downtown',
    storeAddress: '123 Main Street',
    receiptNumber: 'BR-2024-001847',
  },
  {
    id: crypto.randomUUID(),
    userId: '1',
    amount: 8.75,
    pointsEarned: 13,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    itemsPurchased: [
      { id: '4', name: 'Cold Brew', quantity: 1, price: 4.75, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200' },
      { id: '5', name: 'Chocolate Chip Cookie', quantity: 2, price: 2.00 },
    ],
    status: 'completed',
    storeName: 'Brew Rewards - Uptown',
    storeAddress: '456 Oak Avenue',
    receiptNumber: 'BR-2024-001832',
  },
  {
    id: crypto.randomUUID(),
    userId: '1',
    amount: 15.25,
    pointsEarned: 23,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    itemsPurchased: [
      { id: '6', name: 'Vanilla Latte', quantity: 2, price: 5.50, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200' },
      { id: '7', name: 'Avocado Toast', quantity: 1, price: 4.25 },
    ],
    status: 'completed',
    storeName: 'Brew Rewards - Downtown',
    storeAddress: '123 Main Street',
    receiptNumber: 'BR-2024-001798',
  },
  {
    id: crypto.randomUUID(),
    userId: '1',
    amount: 6.50,
    pointsEarned: 10,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    itemsPurchased: [
      { id: '8', name: 'Espresso', quantity: 2, price: 3.25 },
    ],
    status: 'completed',
    storeName: 'Brew Rewards - Airport',
    storeAddress: '789 Terminal B',
    receiptNumber: 'BR-2024-001654',
  },
  {
    id: crypto.randomUUID(),
    userId: '1',
    amount: 22.00,
    pointsEarned: 33,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    itemsPurchased: [
      { id: '9', name: 'Iced Mocha', quantity: 2, price: 6.00, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200' },
      { id: '10', name: 'Breakfast Sandwich', quantity: 2, price: 5.00 },
    ],
    status: 'completed',
    storeName: 'Brew Rewards - Mall',
    storeAddress: '321 Shopping Center Dr',
    receiptNumber: 'BR-2024-001521',
  },
];

const mockRewards: Reward[] = [
  {
    id: crypto.randomUUID(),
    name: 'Free Coffee',
    description: 'Any handcrafted beverage of your choice, any size. Perfect for trying something new or enjoying your favorite.',
    pointsRequired: 150,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    expiresAt: null,
    quantity: -1,
    terms: ['Valid at participating locations', 'One per transaction', 'Cannot be combined with other offers'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Free Pastry',
    description: 'Choose any delicious pastry from our bakery case. From croissants to muffins, the choice is yours.',
    pointsRequired: 100,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    expiresAt: null,
    quantity: -1,
    terms: ['Valid at participating locations', 'Subject to availability'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Premium Tumbler',
    description: 'Exclusive Brew Rewards branded stainless steel tumbler. Keeps drinks hot for 12 hours, cold for 24.',
    pointsRequired: 500,
    category: 'merchandise',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    expiresAt: null,
    quantity: 50,
    terms: ['While supplies last', 'In-store pickup only'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Coffee Tasting Experience',
    description: 'Exclusive guided tasting of rare single-origin coffees with our master barista. Learn brewing techniques.',
    pointsRequired: 750,
    category: 'experiences',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    quantity: 10,
    terms: ['Reservation required', 'Limited to 8 guests per session', 'Ages 18+'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Breakfast Combo',
    description: 'Start your day right with a handcrafted drink and breakfast sandwich of your choice.',
    pointsRequired: 250,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    expiresAt: null,
    quantity: -1,
    terms: ['Valid before 11 AM', 'Includes any size drink'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Double Points Day',
    description: 'Earn 2x points on your next purchase. Stack with your tier multiplier for maximum rewards!',
    pointsRequired: 200,
    category: 'experiences',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    expiresAt: null,
    quantity: -1,
    terms: ['Valid for one transaction', 'Cannot be combined with other multipliers'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Brew Rewards Tote Bag',
    description: 'Eco-friendly canvas tote with the Brew Rewards logo. Perfect for carrying your coffee essentials.',
    pointsRequired: 300,
    category: 'merchandise',
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400',
    expiresAt: null,
    quantity: 100,
    terms: ['While supplies last', 'In-store pickup only'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Barista for a Day',
    description: 'Go behind the counter and learn to make drinks like a pro! Includes certificate and free drinks.',
    pointsRequired: 1000,
    category: 'experiences',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days
    quantity: 5,
    terms: ['Ages 16+', 'Reservation required', '3-hour session'],
  },
];

const mockOffers: Offer[] = [
  {
    id: crypto.randomUUID(),
    title: 'Happy Hour Special',
    description: '50% off any iced drink between 2-5 PM',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    discount: 50,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    code: 'HAPPYHOUR50',
  },
  {
    id: crypto.randomUUID(),
    title: 'Gold Member Exclusive',
    description: 'Free extra shot with any espresso drink',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    discount: 100,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    code: 'GOLDSHOT',
  },
  {
    id: crypto.randomUUID(),
    title: 'Weekend Brunch Deal',
    description: 'Buy any breakfast item, get a medium coffee free',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400',
    discount: 100,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    code: 'BRUNCHFREE',
  },
];

const mockNotifications: Notification[] = [
  {
    id: crypto.randomUUID(),
    title: 'Points Earned! ☕',
    message: 'You earned 19 points from your recent purchase',
    type: 'points',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: crypto.randomUUID(),
    title: 'New Reward Available! 🎁',
    message: 'You have enough points to redeem a free coffee',
    type: 'reward',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: crypto.randomUUID(),
    title: 'Happy Hour Starts Soon! ⏰',
    message: '50% off iced drinks from 2-5 PM today',
    type: 'offer',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: crypto.randomUUID(),
    title: 'Welcome to Gold Tier! 🌟',
    message: 'Congratulations! You now earn 1.5x points on every purchase',
    type: 'general',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: crypto.randomUUID(),
    userId: '1',
    cardLast4: '4242',
    type: 'visa',
    isDefault: true,
    expiryMonth: 12,
    expiryYear: 2026,
  },
  {
    id: crypto.randomUUID(),
    userId: '1',
    cardLast4: '8888',
    type: 'mastercard',
    isDefault: false,
    expiryMonth: 8,
    expiryYear: 2025,
  },
];

export const useStore = create<StoreState>((set, get) => ({
  // Transactions
  transactions: [],
  isLoadingTransactions: false,
  
  fetchTransactions: async () => {
    set({ isLoadingTransactions: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ transactions: mockTransactions, isLoadingTransactions: false });
  },

  // Rewards
  rewards: [],
  isLoadingRewards: false,
  
  fetchRewards: async () => {
    set({ isLoadingRewards: true });
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ rewards: mockRewards, isLoadingRewards: false });
  },
  
  getRewardById: (id: string) => {
    return get().rewards.find(r => r.id === id);
  },

  // Redemptions
  redemptions: [],
  activeRedemptions: [],
  
  redeemReward: async (rewardId: string, userId: string) => {
    const reward = get().rewards.find(r => r.id === rewardId);
    if (!reward) return null;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const redemption: Redemption = {
      id: crypto.randomUUID(),
      userId,
      rewardId,
      reward,
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      status: 'active',
      confirmationCode: `BR${Date.now().toString(36).toUpperCase()}`,
    };
    
    set(state => ({
      redemptions: [...state.redemptions, redemption],
      activeRedemptions: [...state.activeRedemptions, redemption],
    }));
    
    return redemption;
  },

  // Payment Methods
  paymentMethods: mockPaymentMethods,
  defaultPaymentMethod: mockPaymentMethods.find(m => m.isDefault) || null,
  
  addPaymentMethod: async (method) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMethod: PaymentMethod = { ...method, id: crypto.randomUUID() };
    set(state => ({
      paymentMethods: [...state.paymentMethods, newMethod],
    }));
  },
  
  setDefaultPaymentMethod: (id: string) => {
    set(state => ({
      paymentMethods: state.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id,
      })),
      defaultPaymentMethod: state.paymentMethods.find(m => m.id === id) || null,
    }));
  },

  // Offers
  offers: mockOffers,
  
  fetchOffers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ offers: mockOffers });
  },

  // Notifications
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,
  
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length,
    }));
  },
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // QR Code
  qrCodeData: null,
  
  generateQRCode: (userId: string) => {
    const data = JSON.stringify({
      type: 'brew_rewards_payment',
      userId,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    });
    set({ qrCodeData: data });
  },

  // Process Payment
  processPayment: async (amount: number, userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pointsEarned = Math.floor(amount * 1.5); // Gold tier multiplier
    
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId,
      amount,
      pointsEarned,
      date: new Date(),
      itemsPurchased: [
        { id: crypto.randomUUID(), name: 'In-Store Purchase', quantity: 1, price: amount },
      ],
      status: 'completed',
      storeName: 'Brew Rewards - Downtown',
      storeAddress: '123 Main Street',
      receiptNumber: `BR-${Date.now().toString(36).toUpperCase()}`,
    };
    
    set(state => ({
      transactions: [transaction, ...state.transactions],
    }));
    
    return transaction;
  },
}));