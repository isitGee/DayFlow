import { supabase } from '../lib/supabaseClient';
import type { Goal, GoalPeriod } from '../types';

function requireClient() {
  if (!supabase) throw new Error('goalService called without a configured Supabase client');
  return supabase;
}

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  period: GoalPeriod;
  target_date: string;
  progress: number;
}

function rowToGoal(row: GoalRow): Goal {
  return { id: row.id, title: row.title, period: row.period, targetDate: row.target_date, progress: row.progress, linkedTaskIds: [] };
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const client = requireClient();
  const { data, error } = await client.from('weekly_goals').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return ((data as GoalRow[]) ?? []).map(rowToGoal);
}

export async function createGoalRemote(goal: Goal, userId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('weekly_goals').insert({
    id: goal.id,
    user_id: userId,
    title: goal.title,
    period: goal.period,
    target_date: goal.targetDate,
    progress: goal.progress,
  });
  if (error) throw error;
}

export async function updateGoalRemote(id: string, patch: Partial<Goal>): Promise<void> {
  const client = requireClient();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.period !== undefined) row.period = patch.period;
  if (patch.targetDate !== undefined) row.target_date = patch.targetDate;
  if (patch.progress !== undefined) row.progress = patch.progress;
  const { error } = await client.from('weekly_goals').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteGoalRemote(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('weekly_goals').delete().eq('id', id);
  if (error) throw error;
}
