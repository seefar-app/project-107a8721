export interface User {
  id: string;
  phoneNumber: string;
  email: string;
  name: string;
  avatar: string;
  totalPoints: number;
  currentTier: TierName;
  createdAt: Date;
  favoriteItems: string[];
  pin?: string;
}

export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Tier {
  name: TierName;
  displayName: string;
  minPoints: number;
  maxPoints: number;
  pointsMultiplier: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  pointsEarned: number;
  date: Date;
  itemsPurchased: PurchasedItem[];
  status: TransactionStatus;
  storeName: string;
  storeAddress: string;
  receiptNumber: string;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface PurchasedItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: RewardCategory;
  image: string;
  expiresAt: Date | null;
  quantity: number;
  terms: string[];
}

export type RewardCategory = 'drinks' | 'food' | 'merchandise' | 'experiences';

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  reward: Reward;
  redeemedAt: Date;
  expiresAt: Date;
  status: RedemptionStatus;
  confirmationCode: string;
}

export type RedemptionStatus = 'active' | 'redeemed' | 'expired' | 'cancelled';

export interface PaymentMethod {
  id: string;
  userId: string;
  cardLast4: string;
  type: 'visa' | 'mastercard' | 'amex';
  isDefault: boolean;
  expiryMonth: number;
  expiryYear: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: number;
  validUntil: Date;
  code: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'points' | 'reward' | 'general';
  read: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  storeName: string;
  storeAddress: string;
  estimatedReadyTime?: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  customizations?: string[];
}