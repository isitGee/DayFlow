import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { UserSettings } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface PlannerState {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  selectedDate: string; // yyyy-MM-dd, the date the Today page is viewing
  setSelectedDate: (d: string) => void;
}

const defaultSettings: UserSettings = {
  name: '',
  workingHours: { start: '08:00', end: '18:00' },
  theme: 'system',
  planningPreference: 'assisted',
  pomodoro: { work: 25, break: 5, enabled: false },
  notificationsEnabled: false,
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      setSelectedDate: (d) => set({ selectedDate: d }),
    }),
    {
      name: 'dayflow-planner-store',
      // These settings (working hours, name override, Pomodoro, etc.) aren't
      // synced to a per-user `profiles` row yet — the table exists in the
      // schema, wiring it up is a fast-follow. Until then, don't persist
      // them locally in Supabase mode either: caching one account's
      // customizations in localStorage is exactly what would leak them into
      // a different account signing in later on the same browser. Demo mode
      // has no such risk (there's only ever one local "account"), so it
      // keeps persisting normally.
      partialize: (s) => (isSupabaseConfigured ? {} : { settings: s.settings }),
    }
  )
);
