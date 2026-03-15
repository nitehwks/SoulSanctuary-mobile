import { z } from 'zod';

// ==========================================
// User Validation
// ==========================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).max(255).optional(),
  password: z.string().min(8).max(100).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  preferences: z.record(z.any()).optional(),
});

export const fcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

// ==========================================
// Mood Validation
// ==========================================

export const createMoodSchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotions: z.array(z.string()).max(10),
  note: z.string().max(2000).optional(),
  context: z.string().max(500).optional(),
});

export const updateMoodSchema = z.object({
  mood: z.number().int().min(1).max(5).optional(),
  emotions: z.array(z.string()).max(10).optional(),
  note: z.string().max(2000).optional(),
  context: z.string().max(500).optional(),
});

// ==========================================
// Goal Validation
// ==========================================

export const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(['mental_health', 'physical', 'career', 'relationships', 'personal', 'other']),
  targetDate: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(['mental_health', 'physical', 'career', 'relationships', 'personal', 'other']).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  targetDate: z.string().datetime().optional(),
});

export const updateGoalProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

// ==========================================
// Milestone Validation
// ==========================================

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  completed: z.boolean().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});

// ==========================================
// Memory Validation
// ==========================================

export const createMemorySchema = z.object({
  type: z.enum(['note', 'event', 'milestone', 'gratitude', 'crisis', 'mood', 'goal']),
  content: z.string().min(1).max(10000),
  relatedNodes: z.array(z.string().uuid()).max(20).optional(),
  sentiment: z.number().int().min(-10).max(10).optional(),
  encrypted: z.boolean().optional(),
});

export const updateMemorySchema = z.object({
  type: z.enum(['note', 'event', 'milestone', 'gratitude', 'crisis', 'mood', 'goal']).optional(),
  content: z.string().min(1).max(10000).optional(),
  relatedNodes: z.array(z.string().uuid()).max(20).optional(),
  sentiment: z.number().int().min(-10).max(10).optional(),
});

// ==========================================
// Crisis Validation
// ==========================================

export const crisisAlertSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  context: z.object({
    note: z.string().optional(),
    mood: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

export const crisisInterventionSchema = z.object({
  context: z.object({
    note: z.string().optional(),
    mood: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

export const crisisAnalyzeSchema = z.object({
  moodData: z.object({
    mood: z.number().int().min(1).max(5),
    note: z.string().optional(),
    emotions: z.array(z.string()),
  }),
});

// ==========================================
// AI Validation
// ==========================================

export const moodInsightSchema = z.object({
  entries: z.array(z.object({
    mood: z.number(),
    emotions: z.array(z.string()),
    note: z.string().optional(),
    timestamp: z.string(),
  })).min(1).max(100),
});

export const goalCoachingSchema = z.object({
  goal: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    progress: z.number(),
    status: z.string(),
  }),
});

export const memoryInsightSchema = z.object({
  memories: z.array(z.object({
    type: z.string(),
    content: z.string(),
    sentiment: z.number(),
    timestamp: z.string(),
  })).min(1).max(50),
});

export const weeklySummarySchema = z.object({
  moods: z.array(z.any()).optional(),
  goals: z.array(z.any()).optional(),
  memories: z.array(z.any()).optional(),
});

export const crisisAssessmentSchema = z.object({
  message: z.string().min(1).max(5000),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(50).optional(),
  mode: z.enum(['spiritual', 'general']).optional().default('spiritual'),
});

export const suggestionsSchema = z.object({
  context: z.enum(['mood', 'goal', 'crisis', 'general']),
  data: z.record(z.any()).optional(),
});

// ==========================================
// Notification Validation
// ==========================================

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  type: z.enum(['goal', 'mood', 'crisis', 'system', 'scheduled']),
  data: z.record(z.any()).optional(),
});

// ==========================================
// User Settings Validation
// ==========================================

export const updateSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  dailyReminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  crisisModeEnabled: z.boolean().optional(),
  encryptionEnabled: z.boolean().optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  language: z.string().length(2).optional(),
});

// ==========================================
// Emergency Contact Validation
// ==========================================

export const createEmergencyContactSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  relationship: z.string().max(100).optional(),
  isPrimary: z.boolean().optional(),
  notifyOnCrisis: z.boolean().optional(),
});

// ==========================================
// Webhook Validation
// ==========================================

export const clerkWebhookSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateMoodInput = z.infer<typeof createMoodSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type CrisisAlertInput = z.infer<typeof crisisAlertSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
