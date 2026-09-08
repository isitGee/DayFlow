import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal } from '../types';
import { DEMO_GOALS } from '../lib/demoData';
import { uid } from '../lib/utils';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import * as goalService from '../services/goalService';

function syncError(action: string, err: unknown) {
  console.error(`[dayflow] failed to sync "${action}" to Supabase:`, err);
}

interface GoalStoreState {
  goals: Goal[];
  currentUserId: string;
  remoteLoaded: boolean;

  setCurrentUserId: (id: string) => void;
  loadRemote: (userId: string) => Promise<void>;

  addGoal: (g: Omit<Goal, 'id' | 'progress' | 'linkedTaskIds'>) => void;
  updateProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStoreState>()(
  persist(
    (set, get) => ({
      goals: DEMO_GOALS,
      currentUserId: 'demo',
      remoteLoaded: false,

      setCurrentUserId: (id) => set({ currentUserId: id }),

      loadRemote: async (userId) => {
        if (!isSupabaseConfigured) return;
        try {
          const goals = await goalService.fetchGoals(userId);
          set({ goals, currentUserId: userId, remoteLoaded: true });
        } catch (err) {
          syncError('loadRemote', err);
        }
      },

      addGoal: (g) => {
        const goal: Goal = { ...g, id: uid('goal'), progress: 0, linkedTaskIds: [] };
        set((s) => ({ goals: [...s.goals, goal] }));
        if (isSupabaseConfigured) goalService.createGoalRemote(goal, get().currentUserId).catch((err) => syncError('addGoal', err));
      },

      updateProgress: (id, progress) => {
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)) }));
        if (isSupabaseConfigured) goalService.updateGoalRemote(id, { progress }).catch((err) => syncError('updateProgress', err));
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        if (isSupabaseConfigured) goalService.deleteGoalRemote(id).catch((err) => syncError('deleteGoal', err));
      },
    }),
    { name: 'dayflow-goals-store' }
  )
);
