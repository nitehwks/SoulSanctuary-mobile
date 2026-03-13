export interface MoodEntry {
  id: string;
  userId: string;
  mood: number;
  emotions: string[];
  note: string;
  context?: string;
  timestamp: Date;
  aiInsights?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'mental' | 'physical' | 'social' | 'career' | 'personal';
  status: 'active' | 'completed' | 'archived';
  progress: number;
  targetDate?: Date;
  createdAt: Date;
  milestones: Milestone[];
  aiCoaching?: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface MemoryNode {
  id: string;
  userId: string;
  type: 'mood' | 'goal' | 'insight' | 'crisis' | 'gratitude';
  content: string;
  relatedNodes: string[];
  sentiment: number;
  timestamp: Date;
  encrypted: boolean;
}

export interface CrisisEvent {
  id: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trigger: string;
  response: string;
  resourcesAccessed: string[];
  resolved: boolean;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    encryptionEnabled: boolean;
    theme: 'dark' | 'light';
  };
  emergencyContacts: EmergencyContact[];
  createdAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyOnCrisis: boolean;
}
