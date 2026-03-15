import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { userSubscriptions, SubscriptionTier, SubscriptionStatus } from '../db/subscriptions';
import { logError } from '../services/logger';
import './auth'; // Import to get the extended Request type with auth property

// Extend Express Request type to include subscription info
declare global {
  namespace Express {
    interface Request {
      subscription?: {
        tier: SubscriptionTier;
        status: SubscriptionStatus;
        isActive: boolean;
        features: Record<string, boolean>;
        monthlyAIUsage: number;
        monthlyAILimit: number;
      };
    }
  }
}

// Feature flags for different subscription tiers
const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['aiChat', 'moodTracking', 'basicCoaching', 'crisisSupport'],
  premium: [
    'aiChat', 'moodTracking', 'basicCoaching', 'crisisSupport',
    'advancedCoaching', 'curriculum', 'comprehensivePlan', 
    'memoryInsights', 'weeklySummary', 'unlimitedAI'
  ],
  premium_plus: [
    'aiChat', 'moodTracking', 'basicCoaching', 'crisisSupport',
    'advancedCoaching', 'curriculum', 'comprehensivePlan',
    'memoryInsights', 'weeklySummary', 'unlimitedAI',
    'prioritySupport', 'familySharing', 'advancedAnalytics'
  ],
};

// Default monthly AI limits by tier
const TIER_AI_LIMITS: Record<SubscriptionTier, number> = {
  free: 50,
  premium: 500,
  premium_plus: 999999, // Effectively unlimited
};

/**
 * Check if a subscription is active
 */
function isSubscriptionActive(status: SubscriptionStatus, currentPeriodEnd: Date | null): boolean {
  if (status === 'active' || status === 'trialing') {
    return true;
  }
  
  // Grace period for past_due (3 days)
  if (status === 'past_due' && currentPeriodEnd) {
    const gracePeriodEnd = new Date(currentPeriodEnd);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);
    return new Date() < gracePeriodEnd;
  }
  
  return false;
}

/**
 * Middleware to load user's subscription info into request
 */
export async function loadSubscription(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = req.auth?.userId;
    
    if (!userId) {
      return next();
    }

    // Get or create subscription
    let subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
    });

    // If no subscription exists, create free tier
    if (!subscription) {
      const [newSub] = await db.insert(userSubscriptions)
        .values({
          userId,
          tier: 'free',
          status: 'active',
          monthlyAILimit: TIER_AI_LIMITS.free,
        })
        .returning();
      subscription = newSub;
    }

    // Check if subscription expired
    if (subscription.currentPeriodEnd && new Date() > new Date(subscription.currentPeriodEnd)) {
      if (subscription.status === 'active' && !subscription.cancelAtPeriodEnd) {
        // Should auto-renew but didn't - mark as past_due
        await db.update(userSubscriptions)
          .set({ status: 'past_due', updatedAt: new Date() })
          .where(eq(userSubscriptions.id, subscription.id));
        subscription.status = 'past_due';
      } else if (subscription.cancelAtPeriodEnd || subscription.status !== 'active') {
        // Downgrade to free
        await db.update(userSubscriptions)
          .set({ 
            tier: 'free', 
            status: 'expired',
            updatedAt: new Date(),
            monthlyAILimit: TIER_AI_LIMITS.free,
          })
          .where(eq(userSubscriptions.id, subscription.id));
        subscription.tier = 'free';
        subscription.status = 'expired';
      }
    }

    // Build feature map based on tier
    const tierFeatures = TIER_FEATURES[subscription.tier as SubscriptionTier] || TIER_FEATURES.free;
    const features: Record<string, boolean> = {};
    tierFeatures.forEach(feature => {
      features[feature] = true;
    });

    req.subscription = {
      tier: subscription.tier as SubscriptionTier,
      status: subscription.status as SubscriptionStatus,
      isActive: isSubscriptionActive(subscription.status as SubscriptionStatus, subscription.currentPeriodEnd),
      features,
      monthlyAIUsage: subscription.monthlyAIUsage || 0,
      monthlyAILimit: subscription.monthlyAILimit || TIER_AI_LIMITS.free,
    };

    next();
  } catch (error) {
    logError('Load subscription error', error as Error);
    // Continue without subscription info (treat as free tier)
    req.subscription = {
      tier: 'free',
      status: 'active',
      isActive: true,
      features: { aiChat: true, moodTracking: true, basicCoaching: true, crisisSupport: true },
      monthlyAIUsage: 0,
      monthlyAILimit: TIER_AI_LIMITS.free,
    };
    next();
  }
}

/**
 * Middleware to require premium access
 */
export function requirePremium(minimumTier: SubscriptionTier = 'premium') {
  return (req: Request, res: Response, next: NextFunction) => {
    const subscription = req.subscription;
    
    if (!subscription) {
      return res.status(401).json({
        error: 'Subscription information required',
        code: 'SUBSCRIPTION_REQUIRED',
        upgradeUrl: '/upgrade',
      });
    }

    const tierHierarchy: SubscriptionTier[] = ['free', 'premium', 'premium_plus'];
    const userTierIndex = tierHierarchy.indexOf(subscription.tier);
    const requiredTierIndex = tierHierarchy.indexOf(minimumTier);

    if (userTierIndex < requiredTierIndex) {
      return res.status(403).json({
        error: 'Premium access required',
        code: 'PREMIUM_REQUIRED',
        currentTier: subscription.tier,
        requiredTier: minimumTier,
        upgradeUrl: '/upgrade',
        message: `This feature requires ${minimumTier} subscription.`,
      });
    }

    if (!subscription.isActive) {
      return res.status(403).json({
        error: 'Subscription inactive',
        code: 'SUBSCRIPTION_INACTIVE',
        currentTier: subscription.tier,
        status: subscription.status,
        upgradeUrl: '/billing',
        message: 'Your subscription is not active. Please update your payment method.',
      });
    }

    next();
  };
}

/**
 * Middleware to check specific feature access
 */
export function requireFeature(feature: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const subscription = req.subscription;
    
    if (!subscription) {
      return res.status(401).json({
        error: 'Subscription information required',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    if (!subscription.features[feature]) {
      return res.status(403).json({
        error: 'Feature not available',
        code: 'FEATURE_NOT_AVAILABLE',
        feature,
        currentTier: subscription.tier,
        upgradeUrl: '/upgrade',
        message: `The '${feature}' feature requires a premium subscription.`,
      });
    }

    next();
  };
}

/**
 * Middleware to track and limit AI usage
 */
export function limitAIUsage(req: Request, res: Response, next: NextFunction) {
  const subscription = req.subscription;
  
  if (!subscription) {
    return res.status(401).json({
      error: 'Subscription information required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }

  // Premium users have unlimited AI
  if (subscription.features.unlimitedAI) {
    return next();
  }

  // Check if user has exceeded their limit
  if (subscription.monthlyAIUsage >= subscription.monthlyAILimit) {
    return res.status(429).json({
      error: 'AI usage limit reached',
      code: 'USAGE_LIMIT_REACHED',
      currentUsage: subscription.monthlyAIUsage,
      limit: subscription.monthlyAILimit,
      upgradeUrl: '/upgrade',
      message: `You've used all ${subscription.monthlyAILimit} AI messages this month. Upgrade for unlimited access.`,
    });
  }

  next();
}

/**
 * Increment AI usage counter
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
    });

    if (subscription) {
      await db.update(userSubscriptions)
        .set({ 
          monthlyAIUsage: (subscription.monthlyAIUsage || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.id, subscription.id));
    }
  } catch (error) {
    logError('Increment AI usage error', error as Error);
  }
}

/**
 * Reset monthly AI usage (call at start of each month)
 */
export async function resetMonthlyAIUsage(): Promise<void> {
  try {
    await db.update(userSubscriptions)
      .set({ 
        monthlyAIUsage: 0,
        updatedAt: new Date(),
      });
  } catch (error) {
    logError('Reset monthly AI usage error', error as Error);
  }
}
