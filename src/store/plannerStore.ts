import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { UserSettings } from '../types';

interface PlannerState {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  selectedDate: string; // yyyy-MM-dd, the date the Today page is viewing
  setSelectedDate: (d: string) => void;
}

const defaultSettings: UserSettings = {
  name: 'Alex',
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
    { name: 'dayflow-planner-store' }
  )
);
