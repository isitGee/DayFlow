import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pause, Play, Plus, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { Progress } from '../ui/Progress';
import { cn } from '../../lib/utils';

function formatClock(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '+' : '';
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${s.toString().padStart(2, '0')}`;
}

export function FocusMode() {
  const focusTaskId = useUIStore((s) => s.focusTaskId);
  const endFocus = useUIStore((s) => s.endFocus);
  const pushToast = useUIStore((s) => s.pushToast);
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);

  const task = tasks.find((t) => t.id === focusTaskId);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!task) return;
    setElapsedSeconds((task.actualMinutes || 0) * 60);
    setPaused(false);
    setJustCompleted(false);
  }, [task?.id]);

  useEffect(() => {
    if (!task || paused || justCompleted) return;
    intervalRef.current = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [task, paused, justCompleted]);

  if (!task) return null;

  const targetSeconds = task.estimatedMinutes * 60;
  const remaining = targetSeconds - elapsedSeconds;
  const progressPct = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  function handleComplete() {
    updateTask(task!.id, { actualMinutes: Math.round(elapsedSeconds / 60) });
    setJustCompleted(true);
    setTimeout(() => {
      completeTask(task!.id, Math.round(elapsedSeconds / 60));
      pushToast({ message: `Nice work — "${task!.title}" complete.` });
      endFocus();
    }, 900);
  }

  function handleAbandon() {
    updateTask(task!.id, { actualMinutes: Math.round(elapsedSeconds / 60) });
    endFocus();
  }

  function handleAddTime() {
    updateTask(task!.id, { estimatedMinutes: task!.estimatedMinutes + 5 });
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-surface animate-fade-in">
      <button onClick={handleAbandon} className="absolute right-6 top-6 rounded-full p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink">
        <X className="h-5 w-5" />
      </button>

      <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Focus</p>
        <h2 className="mt-3 text-2xl font-semibold text-ink">{task.title}</h2>

        <div
          className={cn(
            'mt-10 flex h-52 w-52 items-center justify-center rounded-full border-4 transition-all',
            justCompleted ? 'scale-105 border-healthy animate-pop' : remaining < 0 ? 'border-caution' : 'border-accent-500'
          )}
        >
          {justCompleted ? (
            <Check className="h-16 w-16 text-healthy" strokeWidth={2.5} />
          ) : (
            <span className="font-mono text-5xl font-semibold tabular-nums text-ink">{formatClock(remaining)}</span>
          )}
        </div>

        {!justCompleted && (
          <>
            <Progress value={progressPct} className="mt-8 w-full" barClassName={remaining < 0 ? 'bg-caution' : undefined} />
            <p className="mt-2 text-xs text-ink-faint">
              {remaining >= 0 ? `${Math.round(remaining / 60)}m remaining · ` : 'Over estimate · '}
              estimated {task.estimatedMinutes}m
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-raised text-ink hover:bg-surface-sunken"
                aria-label={paused ? 'Resume' : 'Pause'}
              >
                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </button>
              <button
                onClick={handleComplete}
                className="flex h-14 items-center gap-2 rounded-full bg-accent-600 px-6 font-semibold text-white shadow-raised hover:bg-accent-700"
              >
                <Check className="h-5 w-5" /> Complete
              </button>
              <button
                onClick={handleAddTime}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-raised text-ink hover:bg-surface-sunken"
                aria-label="Add 5 minutes"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <button onClick={handleAbandon} className="mt-6 text-sm text-ink-faint hover:text-ink-muted">
              Abandon session
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
