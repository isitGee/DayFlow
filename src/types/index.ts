export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'inbox' | 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'archived';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  projectId?: string | null;
  status: TaskStatus;
  priority: Priority;
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate?: string | null; // ISO date
  scheduledDate?: string | null; // ISO date (yyyy-MM-dd)
  scheduledStart?: string | null; // ISO datetime
  scheduledEnd?: string | null; // ISO datetime
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  isPriorityToday?: boolean;
  priorityOrder?: number;
  goalId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  title: string;
  period: GoalPeriod;
  targetDate: string;
  progress: number; // 0-100, derived
  linkedTaskIds: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  source: 'external' | 'dayflow';
  location?: string;
}

export interface DailyReview {
  id: string;
  date: string;
  biggestWin?: string;
  whatGotInTheWay?: string;
  moveToTomorrow?: string;
  plannedMinutes: number;
  actualMinutes: number;
  completedCount: number;
  totalCount: number;
  focusMinutes: number;
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface UserSettings {
  name: string;
  workingHours: WorkingHours;
  theme: 'system' | 'light' | 'dark';
  planningPreference: 'manual' | 'assisted' | 'automatic';
  pomodoro: { work: number; break: number; enabled: boolean };
  notificationsEnabled: boolean;
}

export interface Workload {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  capacityPercentage: number;
  overloadMinutes: number;
}

export interface ParsedTaskDraft {
  title: string;
  estimatedMinutes?: number;
  scheduledDate?: string | null;
  suggestedTimeOfDay?: 'morning' | 'afternoon' | 'evening' | null;
  dueDate?: string | null;
}
