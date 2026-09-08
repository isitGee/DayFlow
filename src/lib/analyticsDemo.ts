import { format, subDays } from 'date-fns';

export interface DayStat {
  date: string; // yyyy-MM-dd
  label: string; // "Mon"
  focusMinutes: number;
  tasksCompleted: number;
  plannedMinutes: number;
  actualMinutes: number;
}

// Deterministic-looking but varied demo history for the last 7 days
// (excluding today, which is computed live from the task store).
const SEED = [220, 180, 260, 90, 240, 130, 300];
const SEED_TASKS = [5, 4, 6, 2, 5, 3, 7];
const SEED_PLANNED = [260, 210, 280, 120, 260, 160, 320];

export function getWeekHistory(): DayStat[] {
  return SEED.map((focusMinutes, i) => {
    const date = subDays(new Date(), 7 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      focusMinutes,
      tasksCompleted: SEED_TASKS[i],
      plannedMinutes: SEED_PLANNED[i],
      actualMinutes: focusMinutes,
    };
  });
}

export const PROJECT_DISTRIBUTION_FALLBACK = [
  { name: 'University', value: 8, color: '#2b7de9' },
  { name: 'GeePlays', value: 6, color: '#1a9e6f' },
  { name: 'Portfolio', value: 3, color: '#c98a12' },
  { name: 'Personal', value: 4, color: '#8b5cf6' },
];
