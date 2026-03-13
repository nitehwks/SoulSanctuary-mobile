import { useState, useCallback } from 'react';
import { post } from '../utils/api';
import type { MoodEntry } from '../types';
import { analyzeCrisisRisk } from '../utils/crisisDetection';

export function useMood() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMood = useCallback(async (moodData: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    setLoading(true);
    try {
      // Check for crisis indicators
      const crisisCheck = analyzeCrisisRisk(moodData.note);
      if (crisisCheck.isCrisis) {
        // Alert crisis system but still save
        await post('/crisis-alert', { 
          severity: crisisCheck.severity, 
          context: moodData 
        });
      }

      const result = await post('/moods', moodData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mood');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitMood, loading, error };
}
