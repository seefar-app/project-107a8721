import { Tier, TierName } from '@/types';

export const TIERS: Record<TierName, Tier> = {
  bronze: {
    name: 'bronze',
    displayName: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    pointsMultiplier: 1,
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday reward',
      'Free size upgrades on Fridays',
    ],
    color: '#cd7f32',
    icon: 'medal-outline',
  },
  silver: {
    name: 'silver',
    displayName: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    pointsMultiplier: 1.25,
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Birthday reward + free drink',
      'Free size upgrades any day',
      'Early access to new drinks',
    ],
    color: '#c0c0c0',
    icon: 'shield-outline',
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    minPoints: 1500,
    maxPoints: 2999,
    pointsMultiplier: 1.5,
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Birthday reward + free drink + pastry',
      'All size upgrades free',
      'Priority mobile ordering',
      'Exclusive Gold member events',
    ],
    color: '#ffd700',
    icon: 'star-outline',
  },
  platinum: {
    name: 'platinum',
    displayName: 'Platinum',
    minPoints: 3000,
    maxPoints: Infinity,
    pointsMultiplier: 2,
    benefits: [
      'Earn 2 points per $1 spent',
      'Birthday month celebration pack',
      'All upgrades & extras free',
      'Dedicated support line',
      'VIP events & tastings',
      'Free delivery on all orders',
    ],
    color: '#e5e4e2',
    icon: 'diamond-outline',
  },
};

export const getTierForPoints = (points: number): Tier => {
  if (points >= TIERS.platinum.minPoints) return TIERS.platinum;
  if (points >= TIERS.gold.minPoints) return TIERS.gold;
  if (points >= TIERS.silver.minPoints) return TIERS.silver;
  return TIERS.bronze;
};

export const getNextTier = (currentTier: TierName): Tier | null => {
  const tierOrder: TierName[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex < tierOrder.length - 1) {
    return TIERS[tierOrder[currentIndex + 1]];
  }
  return null;
};

export const getPointsToNextTier = (currentPoints: number, currentTier: TierName): number => {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 0;
  return Math.max(0, nextTier.minPoints - currentPoints);
};