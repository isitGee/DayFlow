import { supabase } from '../lib/supabaseClient';
import type { Project, Subtask, Task } from '../types';

/**
 * Maps between DAYFLOW's camelCase Task/Project types and the snake_case
 * Postgres schema in supabase/migrations/0001_init.sql. Only called when
 * isSupabaseConfigured is true — see store/taskStore.ts for how this is
 * layered on top of the local/demo Zustand store rather than replacing it.
 */

function requireClient() {
  if (!supabase) throw new Error('taskService called without a configured Supabase client');
  return supabase;
}

interface TaskRow {
  id: string;
  user_id: string;
  project_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: Task['status'];
  priority: Task['priority'];
  estimated_minutes: number;
  actual_minutes: number;
  due_date: string | null;
  scheduled_date: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  tags: string[];
  notes: string | null;
  is_priority_today: boolean;
  priority_order: number | null;
  created_at: string;
  completed_at: string | null;
}

interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
}

function rowToTask(row: TaskRow, subtasks: Subtask[]): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? '',
    projectId: row.project_id,
    status: row.status,
    priority: row.priority,
    estimatedMinutes: row.estimated_minutes,
    actualMinutes: row.actual_minutes,
    dueDate: row.due_date,
    scheduledDate: row.scheduled_date,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    tags: row.tags ?? [],
    subtasks,
    notes: row.notes ?? '',
    isPriorityToday: row.is_priority_today,
    priorityOrder: row.priority_order ?? undefined,
    goalId: row.goal_id,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function taskToRow(task: Partial<Task> & { userId: string }) {
  const row: Record<string, unknown> = {};
  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description;
  if (task.projectId !== undefined) row.project_id = task.projectId;
  if (task.status !== undefined) row.status = task.status;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.estimatedMinutes !== undefined) row.estimated_minutes = task.estimatedMinutes;
  if (task.actualMinutes !== undefined) row.actual_minutes = task.actualMinutes;
  if (task.dueDate !== undefined) row.due_date = task.dueDate;
  if (task.scheduledDate !== undefined) row.scheduled_date = task.scheduledDate;
  if (task.scheduledStart !== undefined) row.scheduled_start = task.scheduledStart;
  if (task.scheduledEnd !== undefined) row.scheduled_end = task.scheduledEnd;
  if (task.tags !== undefined) row.tags = task.tags;
  if (task.notes !== undefined) row.notes = task.notes;
  if (task.isPriorityToday !== undefined) row.is_priority_today = task.isPriorityToday;
  if (task.priorityOrder !== undefined) row.priority_order = task.priorityOrder;
  if (task.goalId !== undefined) row.goal_id = task.goalId;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt;
  row.user_id = task.userId;
  return row;
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const client = requireClient();
  const [{ data: taskRows, error: taskErr }, { data: subtaskRows, error: subErr }] = await Promise.all([
    client.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    client.from('subtasks').select('*, tasks!inner(user_id)').eq('tasks.user_id', userId),
  ]);
  if (taskErr) throw taskErr;
  if (subErr) throw subErr;

  const subtasksByTask = new Map<string, Subtask[]>();
  ((subtaskRows as SubtaskRow[]) ?? []).forEach((s) => {
    const list = subtasksByTask.get(s.task_id) ?? [];
    list.push({ id: s.id, title: s.title, completed: s.completed });
    subtasksByTask.set(s.task_id, list);
  });

  return ((taskRows as TaskRow[]) ?? []).map((row) => rowToTask(row, subtasksByTask.get(row.id) ?? []));
}

export async function createTaskRemote(task: Task): Promise<void> {
  const client = requireClient();
  const { subtasks, id, ...rest } = task;
  const row = { ...taskToRow(rest), id };
  const { error } = await client.from('tasks').insert(row);
  if (error) throw error;
  if (subtasks.length) {
    await client.from('subtasks').insert(subtasks.map((s) => ({ id: s.id, task_id: id, title: s.title, completed: s.completed })));
  }
}

export async function updateTaskRemote(id: string, patch: Partial<Task> & { userId: string }): Promise<void> {
  const client = requireClient();
  const { subtasks, ...rest } = patch;
  const row = taskToRow(rest);
  const { error } = await client.from('tasks').update(row).eq('id', id);
  if (error) throw error;

  if (subtasks !== undefined) {
    // Simplest-correct approach: replace the subtask set wholesale rather
    // than diffing. Fine at DAYFLOW's per-task subtask volumes.
    await client.from('subtasks').delete().eq('task_id', id);
    if (subtasks.length) {
      await client.from('subtasks').insert(subtasks.map((s) => ({ id: s.id, task_id: id, title: s.title, completed: s.completed })));
    }
  }
}

export async function deleteTaskRemote(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  status: Project['status'];
  created_at: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    description: row.description ?? '',
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  const client = requireClient();
  const { data, error } = await client.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return ((data as ProjectRow[]) ?? []).map(rowToProject);
}

export async function createProjectRemote(project: Project, userId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('projects').insert({
    id: project.id,
    user_id: userId,
    name: project.name,
    icon: project.icon,
    color: project.color,
    description: project.description ?? '',
    status: project.status,
  });
  if (error) throw error;
}
