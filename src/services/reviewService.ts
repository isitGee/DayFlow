import { supabase } from '../lib/supabaseClient';
import type { DailyReview } from '../types';

function requireClient() {
  if (!supabase) throw new Error('reviewService called without a configured Supabase client');
  return supabase;
}

export async function upsertReviewRemote(review: DailyReview, userId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('daily_reviews').upsert(
    {
      id: review.id,
      user_id: userId,
      date: review.date,
      biggest_win: review.biggestWin ?? null,
      what_got_in_the_way: review.whatGotInTheWay ?? null,
      move_to_tomorrow: review.moveToTomorrow ?? null,
      planned_minutes: review.plannedMinutes,
      actual_minutes: review.actualMinutes,
      completed_count: review.completedCount,
      total_count: review.totalCount,
      focus_minutes: review.focusMinutes,
    },
    { onConflict: 'user_id,date' }
  );
  if (error) throw error;
}
