import type { Task, Workload, ParsedTaskDraft } from '../types';
import { parseNaturalLanguageTask as localParse } from '../lib/nlpParser';
import { suggestTasksToMove, capacityStatus } from './scheduleService';

/**
 * AIService abstracts every AI-assisted feature in DAYFLOW behind a single
 * interface. When no provider is configured (VITE_AI_PROVIDER unset), every
 * method falls back to a deterministic local implementation so the product
 * is fully usable without an API key. To wire up a real provider later,
 * implement AIServiceProvider and swap the export at the bottom of this file.
 */

export interface AIServiceProvider {
  parseNaturalLanguageTask(input: string): Promise<ParsedTaskDraft>;
  suggestPriorities(tasks: Task[]): Promise<Task[]>;
  suggestSchedule(tasks: Task[], workload: Workload): Promise<{ message: string; tasksToMove: Task[] }>;
  breakDownTask(title: string): Promise<string[]>;
  summarizeDay(completed: Task[], workload: Workload): Promise<string>;
  rescheduleOverloadedDay(tasks: Task[], overloadMinutes: number): Promise<Task[]>;
}

class LocalAIProvider implements AIServiceProvider {
  async parseNaturalLanguageTask(input: string): Promise<ParsedTaskDraft> {
    // Simulate latency so the UI's preview state feels real.
    await delay(120);
    return localParse(input);
  }

  async suggestPriorities(tasks: Task[]): Promise<Task[]> {
    await delay(150);
    const order = { high: 0, medium: 1, low: 2 };
    return [...tasks]
      .sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (aDue !== bDue) return aDue - bDue;
        return order[a.priority] - order[b.priority];
      })
      .slice(0, 3);
  }

  async suggestSchedule(tasks: Task[], workload: Workload) {
    await delay(200);
    const status = capacityStatus(workload.capacityPercentage);
    const tasksToMove = status === 'overloaded' ? suggestTasksToMove(tasks, workload.overloadMinutes) : [];
    const message =
      status === 'overloaded'
        ? `This day is overloaded by ${workload.overloadMinutes}m. I'd move ${tasksToMove.length} task${tasksToMove.length === 1 ? '' : 's'} without a hard deadline.`
        : 'This day has a realistic amount planned. No changes needed.';
    return { message, tasksToMove };
  }

  async breakDownTask(title: string): Promise<string[]> {
    await delay(150);
    // Deterministic, generic breakdown — good enough as a starting point
    // without a real model, and easy to edit afterward.
    return [`Plan approach for "${title}"`, 'Do the core work', 'Review and clean up', 'Mark as done'];
  }

  async summarizeDay(completed: Task[], workload: Workload): Promise<string> {
    await delay(150);
    if (completed.length === 0) return 'No tasks completed yet today — there is still time.';
    return `You completed ${completed.length} task${completed.length === 1 ? '' : 's'} today. Planned time was ${workload.plannedMinutes}m against ${workload.availableMinutes}m available.`;
  }

  async rescheduleOverloadedDay(tasks: Task[], overloadMinutes: number): Promise<Task[]> {
    await delay(150);
    return suggestTasksToMove(tasks, overloadMinutes);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Swap this for a real provider-backed implementation when VITE_AI_PROVIDER
// is configured. Kept as a single local provider today since no key exists.
export const aiService: AIServiceProvider = new LocalAIProvider();
