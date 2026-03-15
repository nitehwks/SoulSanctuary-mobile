import { createContext, useContext, useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import type { MoodEntry, Goal, MemoryNode } from '../types';
import { get } from '../utils/api';

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
  isLoading: boolean;
}

const SanctuaryContext = createContext<SanctuaryContextType | undefined>(undefined);

interface SanctuaryProviderProps {
  children: React.ReactNode;
}

export const SanctuaryProvider = memo(function SanctuaryProvider({ children }: SanctuaryProviderProps) {
  const { isSignedIn } = useClerkAuth();
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [memoryGraph, setMemoryGraph] = useState<MemoryNode[]>([]);
  const [crisisMode, setCrisisMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMemoryNode = useCallback((node: MemoryNode) => {
    setMemoryGraph(prev => [...prev, node]);
  }, []);

  const refreshData = useCallback(async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    try {
      const [moods, goals, memories] = await Promise.all([
        get('/moods').catch(() => []),
        get('/goals').catch(() => []),
        get('/memories').catch(() => [])
      ]);
      
      if (moods && moods.length > 0) {
        setCurrentMood(moods[0]);
      }
      setActiveGoals(goals || []);
      setMemoryGraph(memories || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Load data when user signs in
  useEffect(() => {
    if (isSignedIn) {
      refreshData();
    }
  }, [isSignedIn, refreshData]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentMood, setCurrentMood,
    activeGoals, setActiveGoals,
    memoryGraph, addMemoryNode,
    crisisMode, setCrisisMode,
    refreshData,
    isLoading
  }), [currentMood, activeGoals, memoryGraph, crisisMode, addMemoryNode, refreshData, isLoading]);

  return (
    <SanctuaryContext.Provider value={value}>
      {children}
    </SanctuaryContext.Provider>
  );
});

export const useSanctuary = () => {
  const context = useContext(SanctuaryContext);
  if (!context) throw new Error('useSanctuary must be used within SanctuaryProvider');
  return context;
};
