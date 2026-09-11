import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, format } from 'date-fns';
import type { CalendarEvent, DailyReview, Project, Task } from '../types';
import { DEMO_EVENTS, DEMO_PROJECTS, DEMO_TASKS } from '../lib/demoData';
import { uid } from '../lib/utils';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import * as taskService from '../services/taskService';
import * as reviewService from '../services/reviewService';

/**
 * The store is the single source of truth for the UI in both modes:
 *  - Demo mode (default): seeded with realistic sample data and persisted
 *    to localStorage (via the `persist` middleware below), since there's no
 *    backend to be the source of truth instead.
 *  - Supabase mode (VITE_SUPABASE_URL set): starts EMPTY (no demo seed —
 *    a new real account should never see sample tasks), and `loadRemote`
 *    fetches what's actually in Postgres on sign-in. Task/project/event/
 *    review data is deliberately excluded from localStorage in this mode
 *    (see `partialize` below) — Postgres is the only source of truth, so
 *    every page load re-fetches fresh rather than ever risking one
 *    account's cached data bleeding into another account on a shared
 *    browser. Every mutation still fires a best-effort write to
 *    taskService alongside the local (optimistic) update.
 */

function syncError(action: string, err: unknown) {
  // Local state has already been updated optimistically; a failed remote
  // write just gets logged rather than rolled back, so a flaky connection
  // never blocks the person from continuing to plan their day.
  console.error(`[dayflow] failed to sync "${action}" to Supabase:`, err);
}

interface TaskStoreState {
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  reviews: DailyReview[];
  currentUserId: string;
  remoteLoaded: boolean;
  remoteLoading: boolean;

  setCurrentUserId: (id: string) => void;
  loadRemote: (userId: string) => Promise<void>;
  resetRemote: () => void;

  addTask: (partial: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, actualMinutes?: number) => void;
  reopenTask: (id: string) => void;
  scheduleTask: (id: string, scheduledDate: string, start?: string, end?: string) => void;
  unscheduleTask: (id: string) => void;
  moveTaskToTomorrow: (id: string) => void;
  moveTaskToInbox: (id: string) => void;
  reorderPriorities: (orderedIds: string[]) => void;
  togglePriorityToday: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;

  saveReview: (review: Omit<DailyReview, 'id'>) => void;

  resetDemoData: () => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      tasks: isSupabaseConfigured ? [] : DEMO_TASKS,
      projects: isSupabaseConfigured ? [] : DEMO_PROJECTS,
      events: isSupabaseConfigured ? [] : DEMO_EVENTS,
      reviews: [],
      currentUserId: 'demo',
      remoteLoaded: false,
      remoteLoading: false,

      setCurrentUserId: (id) => set({ currentUserId: id }),

      resetRemote: () => set({ tasks: [], projects: [], events: [], reviews: [], currentUserId: 'demo', remoteLoaded: false, remoteLoading: false }),

      loadRemote: async (userId) => {
        if (!isSupabaseConfigured) return;
        set({ remoteLoading: true });
        try {
          const [tasks, projects] = await Promise.all([taskService.fetchTasks(userId), taskService.fetchProjects(userId)]);
          set({ tasks, projects, currentUserId: userId, remoteLoaded: true, remoteLoading: false });
        } catch (err) {
          syncError('loadRemote', err);
          set({ remoteLoading: false });
        }
      },

      addTask: (partial) => {
        const userId = get().currentUserId;
        const task: Task = {
          id: uid('task'),
          userId,
          title: partial.title,
          description: partial.description ?? '',
          projectId: partial.projectId ?? null,
          status: partial.status ?? (partial.scheduledDate ? 'scheduled' : 'inbox'),
          priority: partial.priority ?? 'medium',
          estimatedMinutes: partial.estimatedMinutes ?? 30,
          actualMinutes: 0,
          dueDate: partial.dueDate ?? null,
          scheduledDate: partial.scheduledDate ?? null,
          scheduledStart: partial.scheduledStart ?? null,
          scheduledEnd: partial.scheduledEnd ?? null,
          tags: partial.tags ?? [],
          subtasks: partial.subtasks ?? [],
          notes: partial.notes ?? '',
          isPriorityToday: partial.isPriorityToday ?? false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        if (isSupabaseConfigured) taskService.createTaskRemote(task).catch((err) => syncError('addTask', err));
        return task;
      },

      updateTask: (id, patch) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
        if (isSupabaseConfigured) {
          taskService.updateTaskRemote(id, { ...patch, userId: get().currentUserId }).catch((err) => syncError('updateTask', err));
        }
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        if (isSupabaseConfigured) taskService.deleteTaskRemote(id).catch((err) => syncError('deleteTask', err));
      },

      completeTask: (id, actualMinutes) => {
        const task = get().tasks.find((t) => t.id === id);
        get().updateTask(id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          actualMinutes: actualMinutes ?? (task?.actualMinutes || task?.estimatedMinutes || 0),
        });
      },

      reopenTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        get().updateTask(id, { status: task?.scheduledDate ? 'scheduled' : 'inbox', completedAt: null });
      },

      scheduleTask: (id, scheduledDate, start, end) => {
        const task = get().tasks.find((t) => t.id === id);
        get().updateTask(id, {
          status: 'scheduled',
          scheduledDate,
          scheduledStart: start ?? task?.scheduledStart ?? null,
          scheduledEnd: end ?? task?.scheduledEnd ?? null,
        });
      },

      unscheduleTask: (id) => {
        get().updateTask(id, { status: 'inbox', scheduledDate: null, scheduledStart: null, scheduledEnd: null, isPriorityToday: false });
      },

      moveTaskToTomorrow: (id) => {
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        get().updateTask(id, { status: 'scheduled', scheduledDate: tomorrow, scheduledStart: null, scheduledEnd: null, isPriorityToday: false });
      },

      moveTaskToInbox: (id) => {
        get().unscheduleTask(id);
      },

      reorderPriorities: (orderedIds) => {
        orderedIds.forEach((id, idx) => get().updateTask(id, { priorityOrder: idx }));
      },

      togglePriorityToday: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        get().updateTask(id, { isPriorityToday: !task?.isPriorityToday });
      },

      addProject: (project) => {
        const p: Project = { ...project, id: uid('proj'), createdAt: new Date().toISOString() };
        set((s) => ({ projects: [...s.projects, p] }));
        if (isSupabaseConfigured) taskService.createProjectRemote(p, get().currentUserId).catch((err) => syncError('addProject', err));
        return p;
      },

      saveReview: (review) => {
        const r: DailyReview = { ...review, id: uid('review') };
        set((s) => ({ reviews: [...s.reviews.filter((x) => x.date !== review.date), r] }));
        if (isSupabaseConfigured) reviewService.upsertReviewRemote(r, get().currentUserId).catch((err) => syncError('saveReview', err));
      },

      resetDemoData: () => set({ tasks: DEMO_TASKS, projects: DEMO_PROJECTS, events: DEMO_EVENTS, reviews: [] }),
    }),
    {
      name: 'dayflow-demo-store',
      // In Supabase mode, Postgres is the only source of truth for this
      // data — persisting it locally is exactly what let one account's
      // cached tasks bleed into a different account signed in later on the
      // same browser. Demo mode still persists everything, since it has no
      // backend to fall back on.
      partialize: (s) =>
        isSupabaseConfigured
          ? { currentUserId: s.currentUserId }
          : { tasks: s.tasks, projects: s.projects, events: s.events, reviews: s.reviews, currentUserId: s.currentUserId },
    }
  )
);

