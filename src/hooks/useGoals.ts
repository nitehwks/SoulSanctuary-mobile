import { useState, useCallback } from 'react';
import { apiFetch, post, patch } from '../utils/api';
import type { Goal, Milestone } from '../types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [_loading, _setLoading] = useState(false);
  const fetchGoals = useCallback(async () => {
    const data = await apiFetch('/goals');
    setGoals(data);
    return data;
  }, []);

  const createGoal = useCallback(async (goal: Partial<Goal>) => {
    const result = await post('/goals', goal);
    setGoals(prev => [...prev, result]);
    return result;
  }, []);

  const updateProgress = useCallback(async (goalId: string, progress: number) => {
    const result = await patch(`/goals/${goalId}/progress`, { progress });
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
    return result;
  }, []);

  const addMilestone = useCallback(async (goalId: string, milestone: Partial<Milestone>) => {
    const result = await post(`/goals/${goalId}/milestones`, milestone);
    return result;
  }, []);

  return { goals, fetchGoals, createGoal, updateProgress, addMilestone };
}
