// =============================================================================
// SUBSCRIPTIONS SCHEMA - Premium access management
// =============================================================================

import { pgTable, uuid, varchar, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

// Subscription status
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'unpaid' 
  | 'trialing' 
  | 'paused'
  | 'expired';

// =============================================================================
// USER SUBSCRIPTIONS
// Tracks premium access for users
// =============================================================================
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  // Subscription details
  tier: varchar('tier', { length: 50 }).notNull().default('free'), // 'free', 'premium', 'premium_plus'
  status: varchar('status', { length: 50 }).notNull().default('active'),
  
  // Billing period
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  
  // Trial
  trialEndsAt: timestamp('trial_ends_at'),
  isTrial: boolean('is_trial').default(false),
  
  // Cancellation
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  
  // Payment provider info (Stripe, etc.)
  provider: varchar('provider', { length: 50 }), // 'stripe', 'apple', 'google'
  providerSubscriptionId: varchar('provider_subscription_id', { length: 255 }),
  providerCustomerId: varchar('provider_customer_id', { length: 255 }),
  
  // Feature flags (for granular access)
  features: jsonb('features').default({
    aiChat: true,              // Free
    moodTracking: true,        // Free
    basicCoaching: true,       // Free
    advancedCoaching: false,   // Premium
    curriculum: false,         // Premium
    comprehensivePlan: false,  // Premium
    memoryInsights: false,     // Premium
    unlimitedAI: false,        // Premium
    prioritySupport: false,    // Premium+
    familySharing: false,      // Premium+
  }),
  
  // Usage limits tracking
  monthlyAIUsage: integer('monthly_ai_usage').default(0),
  monthlyAILimit: integer('monthly_ai_limit').default(50), // Free tier: 50 messages/month
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// SUBSCRIPTION EVENTS (Audit log)
// =============================================================================
export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'created', 'updated', 'canceled', 'renewed', 'expired'
  previousTier: varchar('previous_tier', { length: 50 }),
  newTier: varchar('new_tier', { length: 50 }),
  previousStatus: varchar('previous_status', { length: 50 }),
  newStatus: varchar('new_status', { length: 50 }),
  
  metadata: jsonb('metadata').default({}),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// RELATIONS
// =============================================================================

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
}));

export const subscriptionEventsRelations = relations(subscriptionEvents, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionEvents.userId],
    references: [users.id],
  }),
}));
