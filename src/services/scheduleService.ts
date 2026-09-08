import { differenceInMinutes, parseISO } from 'date-fns';
import type { Task, Workload, CalendarEvent, WorkingHours } from '../types';

/**
 * Pure, dependency-free scheduling logic. Kept separate from any UI or
 * store code so it can be unit tested and, later, swapped for a
 * server-side or AI-assisted implementation without touching callers.
 */

export function minutesBetween(startHHMM: string, endHHMM: string): number {
  const [sh, sm] = startHHMM.split(':').map(Number);
  const [eh, em] = endHHMM.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function calculateWorkload(
  tasksForDay: Task[],
  workingHours: WorkingHours,
  events: CalendarEvent[] = []
): Workload {
  const availableMinutes = Math.max(0, minutesBetween(workingHours.start, workingHours.end));
  const eventMinutes = events.reduce((sum, e) => sum + Math.max(0, differenceInMinutes(parseISO(e.end), parseISO(e.start))), 0);
  const plannedMinutes = tasksForDay
    .filter((t) => t.status !== 'completed' && t.status !== 'archived')
    .reduce((sum, t) => sum + t.estimatedMinutes, 0) + eventMinutes;
  const remainingMinutes = availableMinutes - plannedMinutes;
  const capacityPercentage = availableMinutes > 0 ? Math.round((plannedMinutes / availableMinutes) * 100) : 0;
  const overloadMinutes = Math.max(0, plannedMinutes - availableMinutes);
  return { availableMinutes, plannedMinutes, remainingMinutes, capacityPercentage, overloadMinutes };
}

export function capacityStatus(pct: number): 'healthy' | 'caution' | 'overloaded' {
  if (pct > 100) return 'overloaded';
  if (pct > 85) return 'caution';
  return 'healthy';
}

export function capacityMessage(workload: Workload): string {
  const status = capacityStatus(workload.capacityPercentage);
  if (status === 'overloaded') {
    return `Your day is overloaded by ${formatMins(workload.overloadMinutes)}. Consider moving something to tomorrow.`;
  }
  if (status === 'caution') {
    return 'Your day is getting tight. Leave room for the unexpected.';
  }
  if (workload.plannedMinutes === 0) {
    return 'Your day is wide open. Plan a few things worth doing.';
  }
  return "Your day looks realistic. You've got room to breathe.";
}

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Suggests which unscheduled/overflow tasks to move when a day is overloaded.
 * Rule: keep high priority and due-today tasks, suggest moving lowest
 * priority / no-due-date tasks first (rule set mirrors section 27 of the brief).
 */
export function suggestTasksToMove(tasksForDay: Task[], overloadMinutes: number): Task[] {
  if (overloadMinutes <= 0) return [];
  const candidates = [...tasksForDay]
    .filter((t) => t.status !== 'completed' && t.status !== 'archived')
    .sort((a, b) => {
      const aDue = a.dueDate ? 0 : 1;
      const bDue = b.dueDate ? 0 : 1;
      if (aDue !== bDue) return bDue - aDue; // no-due-date first (candidates to move)
      const order = { low: 0, medium: 1, high: 2 };
      return order[a.priority] - order[b.priority];
    });

  const toMove: Task[] = [];
  let recovered = 0;
  for (const t of candidates) {
    if (recovered >= overloadMinutes) break;
    if (t.priority === 'high' && t.dueDate) continue; // never silently move an important task
    toMove.push(t);
    recovered += t.estimatedMinutes;
  }
  return toMove;
}
