import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Toast {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

type Theme = 'system' | 'light' | 'dark';

interface UIState {
  theme: Theme;
  setTheme: (t: Theme) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  quickAddOpen: boolean;
  setQuickAddOpen: (v: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;

  focusTaskId: string | null;
  startFocus: (taskId: string) => void;
  endFocus: () => void;

  activeTaskDetailId: string | null;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      quickAddOpen: false,
      setQuickAddOpen: (v) => set({ quickAddOpen: v }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

      focusTaskId: null,
      startFocus: (taskId) => set({ focusTaskId: taskId }),
      endFocus: () => set({ focusTaskId: null }),

      activeTaskDetailId: null,
      openTaskDetail: (id) => set({ activeTaskDetailId: id }),
      closeTaskDetail: () => set({ activeTaskDetailId: null }),

      toasts: [],
      pushToast: (t) => {
        const id = `toast_${Math.random().toString(36).slice(2, 9)}`;
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), 5000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'dayflow-ui-store', partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }) }
  )
);
