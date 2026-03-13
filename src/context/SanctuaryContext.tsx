import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MoodEntry, Goal, MemoryNode } from '../types';

interface SanctuaryContextType {
  currentMood: MoodEntry | null;
  setCurrentMood: (mood: MoodEntry | null) => void;
  activeGoals: Goal[];
  setActiveGoals: (goals: Goal[]) => void;
  memoryGraph: MemoryNode[];
  addMemoryNode: (node: MemoryNode) => void;
  crisisMode: boolean;
  setCrisisMode: (mode: boolean) => void;
  refreshData: () => Promise<void>;
}

const SanctuaryContext = createContext<SanctuaryContextType | undefined>(undefined);

export function SanctuaryProvider({ children }: { children: React.ReactNode }) {
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [memoryGraph, setMemoryGraph] = useState<MemoryNode[]>([]);
  const [crisisMode, setCrisisMode] = useState(false);

  const addMemoryNode = useCallback((node: MemoryNode) => {
    setMemoryGraph(prev => [...prev, node]);
  }, []);

  const refreshData = useCallback(async () => {
    // Fetch all data from API
    const [moods, goals, memories] = await Promise.all([
      fetch('/api/moods').then(r => r.json()),
      fetch('/api/goals').then(r => r.json()),
      fetch('/api/memories').then(r => r.json())
    ]);
    if (moods[0]) setCurrentMood(moods[0]);
    setActiveGoals(goals);
    setMemoryGraph(memories);
  }, []);

  return (
    <SanctuaryContext.Provider value={{
      currentMood, setCurrentMood,
      activeGoals, setActiveGoals,
      memoryGraph, addMemoryNode,
      crisisMode, setCrisisMode,
      refreshData
    }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export const useSanctuary = () => {
  const context = useContext(SanctuaryContext);
  if (!context) throw new Error('useSanctuary must be used within SanctuaryProvider');
  return context;
};
