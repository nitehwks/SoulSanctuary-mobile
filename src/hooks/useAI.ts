import { useState, useCallback } from 'react';
import { post } from '../utils/api';

interface AIInsight {
  insight: string;
  suggestions: string[];
  urgency?: 'low' | 'medium' | 'high';
}

export function useAI() {
  const [loading, setLoading] = useState(false);

  const getMoodInsight = useCallback(async (moodEntries: unknown[]): Promise<AIInsight> => {
    setLoading(true);
    try {
      const result = await post('/ai/mood-insight', { entries: moodEntries });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGoalCoaching = useCallback(async (goal: unknown): Promise<AIInsight> => {
    setLoading(true);
    try {
      const result = await post('/ai/goal-coach', { goal });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const chatWithTherapist = useCallback(async (message: string, history: unknown[], mode: 'spiritual' | 'general' = 'spiritual'): Promise<string> => {
    setLoading(true);
    try {
      const result = await post('/ai/chat', { message, history, mode });
      return result.response;
    } finally {
      setLoading(false);
    }
  }, []);

  // Comprehensive coaching - uses full user profile
  const getCoachResponse = useCallback(async (
    message: string, 
    history: unknown[]
  ): Promise<{
    response: string;
    suggestedScripture?: string;
    recommendedExercise?: string;
    technique?: string;
  }> => {
    setLoading(true);
    try {
      const result = await post('/ai/coach-response', { message, history });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeConversation = useCallback(async (
    messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[],
    sessionId?: string
  ): Promise<{ insights: unknown; profileUpdated: boolean }> => {
    setLoading(true);
    try {
      const result = await post('/ai/analyze-conversation', { messages, sessionId });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCoachingPlan = useCallback(async (): Promise<{ success: boolean; plan?: unknown }> => {
    setLoading(true);
    try {
      const result = await post('/ai/coaching-plan', {});
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCoachingPlan = useCallback(async (): Promise<{ hasPlan: boolean; plan?: unknown }> => {
    const result = await fetch('/api/ai/coaching-plan').then(r => r.json());
    return result;
  }, []);

  const getUserInsights = useCallback(async (): Promise<{ hasData: boolean; summary?: unknown }> => {
    const result = await fetch('/api/ai/user-insights').then(r => r.json());
    return result;
  }, []);

  const generateCurriculum = useCallback(async (topic: string): Promise<{ success: boolean; content?: unknown }> => {
    setLoading(true);
    try {
      const result = await post('/ai/curriculum', { topic });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    getMoodInsight, 
    getGoalCoaching, 
    chatWithTherapist, 
    getCoachResponse,
    analyzeConversation,
    generateCoachingPlan,
    getCoachingPlan,
    getUserInsights,
    generateCurriculum,
    loading 
  };
}
