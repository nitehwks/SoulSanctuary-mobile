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

  const chatWithTherapist = useCallback(async (message: string, history: unknown[]): Promise<string> => {
    setLoading(true);
    try {
      const result = await post('/ai/chat', { message, history });
      return result.response;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getMoodInsight, getGoalCoaching, chatWithTherapist, loading };
}
