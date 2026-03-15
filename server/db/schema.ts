import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// Users
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  fcmToken: varchar('fcm_token', { length: 255 }), // Firebase Cloud Messaging token for push notifications
  createdAt: timestamp('created_at').defaultNow(),
  preferences: jsonb('preferences').default({}),
});

export const usersRelations = relations(users, ({ many }) => ({
  moods: many(moods),
  goals: many(goals),
  memories: many(memories),
  crisisEvents: many(crisisEvents),
  notifications: many(notifications),
  emergencyContacts: many(emergencyContacts),
  chatHistory: many(chatHistory),
  prayerRequests: many(prayerRequests),
  meditationSessions: many(meditationSessions),
  journalEntries: many(journalEntries),
  candles: many(candles),
}));

// ==========================================
// Moods
// ==========================================
export const moods = pgTable('moods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  mood: integer('mood').notNull(),
  emotions: jsonb('emotions').default([]),
  note: text('note'),
  context: text('context'),
  aiInsights: text('ai_insights'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const moodsRelations = relations(moods, ({ one }) => ({
  user: one(users, {
    fields: [moods.userId],
    references: [users.id],
  }),
}));

// ==========================================
// Goals
// ==========================================
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  progress: integer('progress').default(0),
  targetDate: timestamp('target_date'),
  aiCoaching: text('ai_coaching'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  milestones: many(milestones),
}));

// ==========================================
// Milestones
// ==========================================
export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').references(() => goals.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
});

export const milestonesRelations = relations(milestones, ({ one }) => ({
  goal: one(goals, {
    fields: [milestones.goalId],
    references: [goals.id],
  }),
}));

// ==========================================
// Memories
// ==========================================
export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  relatedNodes: jsonb('related_nodes').default([]),
  sentiment: integer('sentiment').default(0),
  encrypted: boolean('encrypted').default(true),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
}));

// ==========================================
// Crisis Events
// ==========================================
export const crisisEvents = pgTable('crisis_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  trigger: text('trigger'),
  response: text('response'),
  resourcesAccessed: jsonb('resources_accessed').default([]),
  resolved: boolean('resolved').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const crisisEventsRelations = relations(crisisEvents, ({ one }) => ({
  user: one(users, {
    fields: [crisisEvents.userId],
    references: [users.id],
  }),
}));

// ==========================================
// Notifications
// ==========================================
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'goal', 'mood', 'crisis', 'system', 'scheduled'
  read: boolean('read').default(false),
  data: jsonb('data').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ==========================================
// Emergency Contacts
// ==========================================
export const emergencyContacts = pgTable('emergency_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  relationship: varchar('relationship', { length: 100 }),
  isPrimary: boolean('is_primary').default(false),
  notifyOnCrisis: boolean('notify_on_crisis').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  user: one(users, {
    fields: [emergencyContacts.userId],
    references: [users.id],
  }),
}));

// ==========================================
// Chat History
// ==========================================
export const chatHistory = pgTable('chat_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(users, {
    fields: [chatHistory.userId],
    references: [users.id],
  }),
}));

// ==========================================
// User Settings
// ==========================================
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  dailyReminderTime: varchar('daily_reminder_time', { length: 10 }), // "09:00"
  crisisModeEnabled: boolean('crisis_mode_enabled').default(true),
  encryptionEnabled: boolean('encryption_enabled').default(true),
  theme: varchar('theme', { length: 20 }).default('dark'),
  language: varchar('language', { length: 10 }).default('en'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// ==========================================
// GUIDED MEDITATIONS
// ==========================================
export const meditations = pgTable('meditations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'anxiety', 'sleep', 'peace', 'healing', 'spiritual'
  duration: integer('duration').notNull(), // in minutes
  audioUrl: varchar('audio_url', { length: 500 }),
  script: text('script'), // The meditation text/script
  scripture: text('scripture'), // Associated scripture
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  isPremium: boolean('is_premium').default(false),
  isActive: boolean('is_active').default(true),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const meditationsRelations = relations(meditations, ({ many }) => ({
  sessions: many(meditationSessions),
}));

// ==========================================
// MEDITATION SESSIONS (User Progress)
// ==========================================
export const meditationSessions = pgTable('meditation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  meditationId: uuid('meditation_id').references(() => meditations.id).notNull(),
  duration: integer('duration'), // actual time spent in seconds
  completed: boolean('completed').default(false),
  notes: text('notes'),
  moodAfter: integer('mood_after'), // 1-5 scale
  createdAt: timestamp('created_at').defaultNow(),
});

export const meditationSessionsRelations = relations(meditationSessions, ({ one }) => ({
  user: one(users, {
    fields: [meditationSessions.userId],
    references: [users.id],
  }),
  meditation: one(meditations, {
    fields: [meditationSessions.meditationId],
    references: [meditations.id],
  }),
}));

// ==========================================
// PRAYER COMPANION - Prayer Requests
// ==========================================
export const prayerRequests = pgTable('prayer_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'), // 'personal', 'family', 'friends', 'community', 'global'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'answered', 'archived'
  answerNotes: text('answer_notes'), // How the prayer was answered
  reminderFrequency: varchar('reminder_frequency', { length: 20 }), // 'daily', 'weekly', 'none'
  lastPrayedAt: timestamp('last_prayed_at'),
  answeredAt: timestamp('answered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const prayerRequestsRelations = relations(prayerRequests, ({ one }) => ({
  user: one(users, {
    fields: [prayerRequests.userId],
    references: [users.id],
  }),
}));

// ==========================================
// DAILY BREAD - Devotionals
// ==========================================
export const devotionals = pgTable('devotionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  scripture: text('scripture').notNull(),
  scriptureReference: varchar('scripture_reference', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  reflection: text('reflection'),
  prayer: text('prayer'),
  tags: jsonb('tags').default([]),
  moodFocus: varchar('mood_focus', { length: 50 }), // 'anxiety', 'peace', 'gratitude', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// User's devotional reading history
export const devotionalReads = pgTable('devotional_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  devotionalId: uuid('devotional_id').references(() => devotionals.id).notNull(),
  readAt: timestamp('read_at').defaultNow(),
  notes: text('notes'),
  bookmarked: boolean('bookmarked').default(false),
});

export const devotionalReadsRelations = relations(devotionalReads, ({ one }) => ({
  user: one(users, {
    fields: [devotionalReads.userId],
    references: [users.id],
  }),
  devotional: one(devotionals, {
    fields: [devotionalReads.devotionalId],
    references: [devotionals.id],
  }),
}));

// ==========================================
// REFLECTION JOURNAL
// ==========================================
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  aiPrompt: text('ai_prompt'), // The AI prompt that generated this entry
  mood: integer('mood'), // 1-5 scale
  category: varchar('category', { length: 50 }).default('reflection'), // 'reflection', 'gratitude', 'prayer', 'milestone'
  tags: jsonb('tags').default([]),
  isEncrypted: boolean('is_encrypted').default(true),
  spiritualMilestone: boolean('spiritual_milestone').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

// ==========================================
// VIRTUAL CANDLES
// ==========================================
export const candles = pgTable('candles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  intention: text('intention').notNull(), // Prayer intention
  for: varchar('for', { length: 255 }), // Who/what the candle is for
  color: varchar('color', { length: 20 }).default('white'), // 'white', 'red', 'blue', 'green', 'purple'
  lit: boolean('lit').default(true),
  litAt: timestamp('lit_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // When the candle "burns out"
  prayerCount: integer('prayer_count').default(0), // Number of prayers offered
  lastPrayedAt: timestamp('last_prayed_at'),
  isPublic: boolean('is_public').default(false), // Can others see this candle
  createdAt: timestamp('created_at').defaultNow(),
});

export const candlesRelations = relations(candles, ({ one }) => ({
  user: one(users, {
    fields: [candles.userId],
    references: [users.id],
  }),
}));

// ==========================================
// SACRED SOUNDSCAPES
// ==========================================
export const soundscapes = pgTable('soundscapes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'worship', 'nature', 'binaural', 'ambient'
  audioUrl: varchar('audio_url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  duration: integer('duration'), // in seconds, null for looping
  isPremium: boolean('is_premium').default(false),
  isActive: boolean('is_active').default(true),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// User's soundscape listening history
export const soundscapeSessions = pgTable('soundscape_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  soundscapeId: uuid('soundscape_id').references(() => soundscapes.id).notNull(),
  duration: integer('duration'), // time listened in seconds
  createdAt: timestamp('created_at').defaultNow(),
});

export const soundscapeSessionsRelations = relations(soundscapeSessions, ({ one }) => ({
  user: one(users, {
    fields: [soundscapeSessions.userId],
    references: [users.id],
  }),
  soundscape: one(soundscapes, {
    fields: [soundscapeSessions.soundscapeId],
    references: [soundscapes.id],
  }),
}));
