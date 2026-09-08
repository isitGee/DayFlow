import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Target } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, GoalPeriod } from '../types';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { uid } from '../lib/utils';
import { DEMO_GOALS } from '../lib/demoData';

interface GoalStoreState {
  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id' | 'progress' | 'linkedTaskIds'>) => void;
  updateProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
}

const useGoalStore = create<GoalStoreState>()(
  persist(
    (set) => ({
      goals: DEMO_GOALS,
      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: uid('goal'), progress: 0, linkedTaskIds: [] }] })),
      updateProgress: (id, progress) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, progress } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    { name: 'dayflow-goals-store' }
  )
);

const PERIOD_LABEL: Record<GoalPeriod, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

export default function Goals() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const updateProgress = useGoalStore((s) => s.updateProgress);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');

  function handleCreate() {
    if (!title.trim()) return;
    addGoal({ title: title.trim(), period, targetDate: format(new Date(), 'yyyy-MM-dd') });
    setTitle('');
    setOpen(false);
  }

  const grouped: Record<GoalPeriod, Goal[]> = {
    daily: goals.filter((g) => g.period === 'daily'),
    weekly: goals.filter((g) => g.period === 'weekly'),
    monthly: goals.filter((g) => g.period === 'monthly'),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Goals</h1>
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState title="No goals yet" description="Set a goal to give your week a direction." icon={<Target className="h-5 w-5" />} />
      ) : (
        (['daily', 'weekly', 'monthly'] as GoalPeriod[]).map(
          (period) =>
            grouped[period].length > 0 && (
              <section key={period}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">{PERIOD_LABEL[period]} goals</h2>
                <div className="flex flex-col gap-3">
                  {grouped[period].map((g) => (
                    <div key={g.id} className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-soft">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-ink">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge tone="accent">{g.progress}%</Badge>
                          <button onClick={() => deleteGoal(g.id)} className="text-xs text-ink-faint hover:text-overloaded">Remove</button>
                        </div>
                      </div>
                      <Progress value={g.progress} />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={g.progress}
                        onChange={(e) => updateProgress(g.id, Number(e.target.value))}
                        className="mt-2 w-full accent-accent-600"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
        )
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New goal">
        <div className="flex flex-col gap-4 p-5">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Finish GeePlays redesign"'
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
          />
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${period === p ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : 'border-border text-ink-muted'}`}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!title.trim()}>Create goal</Button>
        </div>
      </Modal>
    </div>
  );
}
