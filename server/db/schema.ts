import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  preferences: jsonb('preferences').default({}),
});

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

export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').references(() => goals.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
});

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
