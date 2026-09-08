import { describe, expect, it } from 'vitest';
import { calculateWorkload, capacityStatus, suggestTasksToMove } from '../services/scheduleService';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't1',
    userId: 'u',
    title: 'Task',
    status: 'scheduled',
    priority: 'medium',
    estimatedMinutes: 60,
    actualMinutes: 0,
    tags: [],
    subtasks: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  } as Task;
}

describe('calculateWorkload', () => {
  it('computes available/planned/remaining minutes correctly', () => {
    const tasks = [makeTask({ estimatedMinutes: 90 }), makeTask({ estimatedMinutes: 30 })];
    const workload = calculateWorkload(tasks, { start: '09:00', end: '17:00' });
    expect(workload.availableMinutes).toBe(480);
    expect(workload.plannedMinutes).toBe(120);
    expect(workload.remainingMinutes).toBe(360);
    expect(workload.capacityPercentage).toBe(25);
  });

  it('excludes completed and archived tasks from planned time', () => {
    const tasks = [
      makeTask({ estimatedMinutes: 60, status: 'completed' }),
      makeTask({ estimatedMinutes: 60, status: 'scheduled' }),
    ];
    const workload = calculateWorkload(tasks, { start: '09:00', end: '17:00' });
    expect(workload.plannedMinutes).toBe(60);
  });

  it('flags overload when planned exceeds available', () => {
    const tasks = [makeTask({ estimatedMinutes: 600 })];
    const workload = calculateWorkload(tasks, { start: '09:00', end: '17:00' });
    expect(workload.overloadMinutes).toBe(120);
    expect(capacityStatus(workload.capacityPercentage)).toBe('overloaded');
  });
});

describe('suggestTasksToMove', () => {
  it('never suggests moving a high-priority task with a due date', () => {
    const important = makeTask({ id: 'important', priority: 'high', dueDate: '2099-01-01', estimatedMinutes: 200 });
    const filler = makeTask({ id: 'filler', priority: 'low', estimatedMinutes: 60 });
    const toMove = suggestTasksToMove([important, filler], 60);
    expect(toMove.find((t) => t.id === 'important')).toBeUndefined();
  });

  it('returns nothing when there is no overload', () => {
    expect(suggestTasksToMove([makeTask({})], 0)).toEqual([]);
  });
});
