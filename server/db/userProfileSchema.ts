// =============================================================================
// USER PROFILE SCHEMA - Comprehensive Spiritual & Psychological Profile
// All sensitive data is encrypted at rest
// =============================================================================

import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// =============================================================================
// USER PSYCHOLOGICAL PROFILE
// Stores mental health patterns, clinical assessments, and behavioral analysis
// =============================================================================
export const userPsychologicalProfile = pgTable('user_psychological_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  // Encrypted profile data (JSON blob with all psychological data)
  encryptedProfileData: text('encrypted_profile_data').notNull(),
  
  // Non-sensitive metadata (for quick queries)
  profileVersion: integer('profile_version').default(1),
  lastAnalysisAt: timestamp('last_analysis_at'),
  profileCompleteness: integer('profile_completeness').default(0), // 0-100%
  
  // Trust/Relationship Level with AI (0-100)
  trustLevel: integer('trust_level').default(0),
  conversationsAnalyzed: integer('conversations_analyzed').default(0),
  
  // Mental Health Indicators (anonymized scores)
  anxietyLevel: integer('anxiety_level'), // 0-10 scale
  depressionLevel: integer('depression_level'), // 0-10 scale
  traumaIndicators: boolean('trauma_indicators').default(false),
  addictionRisk: integer('addiction_risk'), // 0-10 scale
  
  // DSM-5 Aligned Assessments (stored as encrypted JSON)
  dsm5Screeners: jsonb('dsm5_screeners').default({}),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// USER SPIRITUAL PROFILE
// Faith journey, spiritual practices, beliefs, and scriptural preferences
// =============================================================================
export const userSpiritualProfile = pgTable('user_spiritual_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  encryptedProfileData: text('encrypted_profile_data').notNull(),
  
  // Non-sensitive metadata
  denomination: varchar('denomination', { length: 100 }),
  faithJourneyStage: varchar('faith_journey_stage', { length: 50 }), // 'seeker', 'new_believer', 'growing', 'mature'
  bibleReadingStreak: integer('bible_reading_streak').default(0),
  prayerStreak: integer('prayer_streak').default(0),
  
  // Engagement metrics
  lastDevotionalAt: timestamp('last_devotional_at'),
  lastPrayerAt: timestamp('last_prayer_at'),
  scriptureEngagementScore: integer('scripture_engagement_score').default(0), // 0-100
  
  // Preferred scripture themes (derived from conversations)
  comfortScriptures: jsonb('comfort_scriptures').default([]),
  struggleAreas: jsonb('struggle_areas').default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// BEHAVIORAL PATTERNS
// Habits, routines, triggers, and behavioral insights
// =============================================================================
export const userBehavioralPatterns = pgTable('user_behavioral_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  encryptedPatternsData: text('encrypted_patterns_data').notNull(),
  
  // Quick access metrics
  identifiedTriggers: jsonb('identified_triggers').default([]),
  copingStrategiesUsed: jsonb('coping_strategies_used').default([]),
  
  // Patterns
  moodPatterns: jsonb('mood_patterns').default({}), // Time-based patterns
  sleepPatterns: jsonb('sleep_patterns').default({}),
  socialPatterns: jsonb('social_patterns').default({}),
  
  // Risk factors (anonymized)
  isolationRisk: integer('isolation_risk'), // 0-10
  relapseRisk: integer('relapse_risk'), // 0-10 (if applicable)
  crisisRisk: integer('crisis_risk'), // 0-10
  
  lastPatternAnalysis: timestamp('last_pattern_analysis'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// SUBSTANCE USE HISTORY
// Tracks drug/alcohol use patterns, recovery progress, triggers
// =============================================================================
export const userSubstanceProfile = pgTable('user_substance_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  encryptedProfileData: text('encrypted_profile_data').notNull(),
  
  // High-level indicators (non-identifying)
  hasSubstanceHistory: boolean('has_substance_history').default(false),
  inRecovery: boolean('in_recovery').default(false),
  recoveryDays: integer('recovery_days'), // Days sober/clean
  
  // 12-Step Integration
  twelveStepParticipation: boolean('twelve_step_participation').default(false),
  stepWorkProgress: integer('step_work_progress').default(0), // 0-12
  hasSponsor: boolean('has_sponsor').default(false),
  
  // Risk tracking
  relapseRiskLevel: varchar('relapse_risk_level', { length: 20 }), // 'low', 'moderate', 'high', 'critical'
  lastRelapseAt: timestamp('last_relapse_at'),
  
  // Support system
  supportGroupAttendance: jsonb('support_group_attendance').default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// RELATIONSHIP MAPPING
// Social connections, relationship patterns, support system
// =============================================================================
export const userRelationships = pgTable('user_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  encryptedRelationshipData: text('encrypted_relationship_data').notNull(),
  
  // Non-sensitive metadata
  relationshipType: varchar('relationship_type', { length: 50 }).notNull(), // 'family', 'friend', 'partner', 'colleague', 'therapist', 'sponsor'
  relationshipQuality: integer('relationship_quality'), // 1-10 scale
  isSupportive: boolean('is_supportive').default(true),
  isToxic: boolean('is_toxic').default(false),
  
  // Connection metrics
  contactFrequency: varchar('contact_frequency', { length: 20 }), // 'daily', 'weekly', 'monthly', 'rarely'
  lastContactAt: timestamp('last_contact_at'),
  
  // Risk indicators
  conflictLevel: integer('conflict_level'), // 0-10
  boundaryIssues: boolean('boundary_issues').default(false),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// CONVERSATION INSIGHTS
// AI analysis of individual conversations - extracted insights
// =============================================================================
export const conversationInsights = pgTable('conversation_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Reference to chat messages
  chatSessionId: uuid('chat_session_id'),
  
  encryptedInsights: text('encrypted_insights').notNull(),
  
  // Extracted themes (anonymized keywords)
  emotionalThemes: jsonb('emotional_themes').default([]),
  spiritualThemes: jsonb('spiritual_themes').default([]),
  behavioralThemes: jsonb('behavioral_themes').default([]),
  
  // Sentiment tracking
  overallSentiment: real('overall_sentiment'), // -1.0 to 1.0
  emotionalIntensity: integer('emotional_intensity'), // 0-10
  
  // Clinical indicators
  depressionIndicators: boolean('depression_indicators').default(false),
  anxietyIndicators: boolean('anxiety_indicators').default(false),
  traumaIndicators: boolean('trauma_indicators').default(false),
  crisisIndicators: boolean('crisis_indicators').default(false),
  substanceIndicators: boolean('substance_indicators').default(false),
  
  // Progress tracking
  progressNotes: text('progress_notes'),
  breakthroughMoments: jsonb('breakthrough_moments').default([]),
  
  analyzedAt: timestamp('analyzed_at').defaultNow(),
});

// =============================================================================
// PERSONALIZED COACHING PLAN
// Dynamic, evolving plan based on user's needs and progress
// =============================================================================
export const coachingPlans = pgTable('coaching_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  encryptedPlanData: text('encrypted_plan_data').notNull(),
  
  // Plan metadata
  planVersion: integer('plan_version').default(1),
  planStatus: varchar('plan_status', { length: 20 }).default('active'), // 'active', 'completed', 'paused'
  
  // Focus areas
  primaryFocus: jsonb('primary_focus').default([]), // ['anxiety', 'addiction_recovery', 'spiritual_growth']
  secondaryFocus: jsonb('secondary_focus').default([]),
  
  // Therapeutic approaches being used
  therapeuticMethods: jsonb('therapeutic_methods').default([]), // ['cbt', 'dbt', 'mindfulness', '12_step', 'trauma_informed']
  
  // Progress tracking
  overallProgress: integer('overall_progress').default(0), // 0-100
  goalsAchieved: integer('goals_achieved').default(0),
  goalsTotal: integer('goals_total').default(0),
  
  // Plan evolution
  lastReviewAt: timestamp('last_review_at'),
  nextReviewAt: timestamp('next_review_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// COACHING PLAN MILESTONES
// Specific goals within the coaching plan
// =============================================================================
export const coachingMilestones = pgTable('coaching_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').references(() => coachingPlans.id).notNull(),
  
  encryptedMilestoneData: text('encrypted_milestone_data').notNull(),
  
  // Metadata
  category: varchar('category', { length: 50 }).notNull(), // 'spiritual', 'mental_health', 'behavioral', 'relational'
  therapeuticMethod: varchar('therapeutic_method', { length: 50 }), // 'cbt', 'dbt', 'mindfulness', etc.
  
  // Progress
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'in_progress', 'completed', 'paused'
  progress: integer('progress').default(0), // 0-100
  
  // Time tracking
  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
  
  // Associated resources
  relatedScriptures: jsonb('related_scriptures').default([]),
  relatedCurriculumItems: jsonb('related_curriculum_items').default([]),
  
  order: integer('order').default(0), // Sequence in plan
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// CURRICULUM CONTENT (Premium)
// Structured learning content - worksheets, exercises, teachings
// =============================================================================
export const curriculumModules = pgTable('curriculum_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'mental_health', 'spiritual_growth', 'addiction_recovery', 'relationships'
  
  // Therapeutic approach
  therapeuticMethod: varchar('therapeutic_method', { length: 50 }), // 'cbt', 'dbt', 'mindfulness', '12_step', 'trauma_informed'
  spiritualIntegration: varchar('spiritual_integration', { length: 50 }), // 'scripture', 'prayer', 'meditation', 'devotional'
  
  // Content
  content: text('content').notNull(), // Markdown content
  exercises: jsonb('exercises').default([]), // Array of exercise objects
  worksheets: jsonb('worksheets').default([]), // Array of worksheet PDFs/forms
  
  // Associated scriptures
  keyScriptures: jsonb('key_scriptures').default([]),
  
  // Metadata
  difficulty: varchar('difficulty', { length: 20 }).default('beginner'), // 'beginner', 'intermediate', 'advanced'
  estimatedDuration: integer('estimated_duration'), // in minutes
  order: integer('order').default(0),
  
  // Premium status
  isPremium: boolean('is_premium').default(false),
  requiresPlan: jsonb('requires_plan').default([]), // ['addiction_recovery', 'trauma_recovery']
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// USER CURRICULUM PROGRESS
// Tracks user's progress through premium curriculum
// =============================================================================
export const userCurriculumProgress = pgTable('user_curriculum_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  moduleId: uuid('module_id').references(() => curriculumModules.id).notNull(),
  
  // Progress
  status: varchar('status', { length: 20 }).default('locked'), // 'locked', 'available', 'in_progress', 'completed'
  completionPercentage: integer('completion_percentage').default(0),
  
  // Exercise responses (encrypted)
  encryptedExerciseResponses: text('encrypted_exercise_responses'),
  
  // Time tracking
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  timeSpentMinutes: integer('time_spent_minutes').default(0),
  
  // Reflections
  userReflections: text('user_reflections'),
  aiFeedback: text('ai_feedback'),
  
  // Insights gained
  insightsGained: jsonb('insights_gained').default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// INTERACTION MEMORY
// What the AI has learned about how to communicate with this specific user
// =============================================================================
export const userInteractionMemory = pgTable('user_interaction_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  
  encryptedMemoryData: text('encrypted_memory_data').notNull(),
  
  // Communication preferences (anonymized)
  preferredCommunicationStyle: varchar('preferred_communication_style', { length: 50 }), // 'direct', 'gentle', 'scripture_focused', 'clinical'
  responseToScripture: varchar('response_to_scripture', { length: 20 }), // 'positive', 'neutral', 'resistant'
  responseToHomework: varchar('response_to_homework', { length: 20 }), // 'engaged', 'resistant', 'overwhelmed'
  
  // Effective interventions (tracked patterns)
  effectiveInterventions: jsonb('effective_interventions').default([]),
  ineffectiveApproaches: jsonb('ineffective_approaches').default([]),
  
  // Optimal timing
  bestResponseTime: varchar('best_response_time', { length: 20 }), // 'morning', 'afternoon', 'evening'
  crisisResponsePattern: varchar('crisis_response_pattern', { length: 20 }), // 'immediate', 'space_needed'
  
  // Topics to avoid/approach carefully
  sensitiveTopics: jsonb('sensitive_topics').default([]),
  
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// =============================================================================
// RELATIONS
// =============================================================================

export const userPsychologicalProfileRelations = relations(userPsychologicalProfile, ({ one }) => ({
  user: one(users, {
    fields: [userPsychologicalProfile.userId],
    references: [users.id],
  }),
}));

export const userSpiritualProfileRelations = relations(userSpiritualProfile, ({ one }) => ({
  user: one(users, {
    fields: [userSpiritualProfile.userId],
    references: [users.id],
  }),
}));

export const userBehavioralPatternsRelations = relations(userBehavioralPatterns, ({ one }) => ({
  user: one(users, {
    fields: [userBehavioralPatterns.userId],
    references: [users.id],
  }),
}));

export const userSubstanceProfileRelations = relations(userSubstanceProfile, ({ one }) => ({
  user: one(users, {
    fields: [userSubstanceProfile.userId],
    references: [users.id],
  }),
}));

export const userRelationshipsRelations = relations(userRelationships, ({ one }) => ({
  user: one(users, {
    fields: [userRelationships.userId],
    references: [users.id],
  }),
}));

export const conversationInsightsRelations = relations(conversationInsights, ({ one }) => ({
  user: one(users, {
    fields: [conversationInsights.userId],
    references: [users.id],
  }),
}));

export const coachingPlansRelations = relations(coachingPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [coachingPlans.userId],
    references: [users.id],
  }),
  milestones: many(coachingMilestones),
}));

export const coachingMilestonesRelations = relations(coachingMilestones, ({ one }) => ({
  plan: one(coachingPlans, {
    fields: [coachingMilestones.planId],
    references: [coachingPlans.id],
  }),
}));

export const userCurriculumProgressRelations = relations(userCurriculumProgress, ({ one }) => ({
  user: one(users, {
    fields: [userCurriculumProgress.userId],
    references: [users.id],
  }),
  module: one(curriculumModules, {
    fields: [userCurriculumProgress.moduleId],
    references: [curriculumModules.id],
  }),
}));

export const userInteractionMemoryRelations = relations(userInteractionMemory, ({ one }) => ({
  user: one(users, {
    fields: [userInteractionMemory.userId],
    references: [users.id],
  }),
}));
