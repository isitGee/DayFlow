import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TaskCard } from '../tasks/TaskCard';
import type { Task, Workload } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { formatMinutes } from '../../lib/utils';

interface DailyReviewModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  tasksForDay: Task[];
  workload: Workload;
}

export function DailyReviewModal({ open, onClose, date, tasksForDay, workload }: DailyReviewModalProps) {
  const moveTaskToTomorrow = useTaskStore((s) => s.moveTaskToTomorrow);
  const moveTaskToInbox = useTaskStore((s) => s.moveTaskToInbox);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const saveReview = useTaskStore((s) => s.saveReview);
  const pushToast = useUIStore((s) => s.pushToast);

  const [win, setWin] = useState('');
  const [blocker, setBlocker] = useState('');
  const [moveNote, setMoveNote] = useState('');
  const [saved, setSaved] = useState(false);

  const completed = tasksForDay.filter((t) => t.status === 'completed');
  const unfinished = tasksForDay.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const focusMinutes = tasksForDay.reduce((sum, t) => sum + (t.status === 'completed' ? t.actualMinutes : 0), 0);
  const completionRate = tasksForDay.length ? Math.round((completed.length / tasksForDay.length) * 100) : 0;

  function handleFinishDay() {
    saveReview({
      date,
      biggestWin: win,
      whatGotInTheWay: blocker,
      moveToTomorrow: moveNote,
      plannedMinutes: workload.plannedMinutes,
      actualMinutes: focusMinutes,
      completedCount: completed.length,
      totalCount: tasksForDay.length,
      focusMinutes,
    });
    setSaved(true);
    pushToast({ message: 'Day wrapped up. See you tomorrow.' });
    setTimeout(() => {
      onClose();
      setSaved(false);
      setWin('');
      setBlocker('');
      setMoveNote('');
    }, 900);
  }

  return (
    <Modal open={open} onClose={onClose} title="Wrapping up your day" className="max-w-lg">
      <div className="max-h-[70vh] overflow-y-auto p-5">
        {saved ? (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-lg font-semibold text-ink">Day complete.</p>
            <p className="mt-1 text-sm text-ink-muted">Tomorrow is a fresh plan, not a debt.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-surface-sunken px-2 py-3">
                <p className="text-lg font-semibold text-ink">{completed.length}/{tasksForDay.length}</p>
                <p className="text-xs text-ink-faint">tasks done</p>
              </div>
              <div className="rounded-xl bg-surface-sunken px-2 py-3">
                <p className="text-lg font-semibold text-ink">{formatMinutes(focusMinutes)}</p>
                <p className="text-xs text-ink-faint">focused</p>
              </div>
              <div className="rounded-xl bg-surface-sunken px-2 py-3">
                <p className="text-lg font-semibold text-ink">{completionRate}%</p>
                <p className="text-xs text-ink-faint">completion</p>
              </div>
            </div>

            {unfinished.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Unfinished · {unfinished.length}
                </p>
                <div className="flex flex-col gap-2">
                  {unfinished.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <TaskCard task={t} compact />
                      </div>
                      <button
                        onClick={() => moveTaskToTomorrow(t.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-ink-muted hover:bg-surface-sunken"
                      >
                        Tomorrow
                      </button>
                      <button
                        onClick={() => moveTaskToInbox(t.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-ink-muted hover:bg-surface-sunken"
                      >
                        Inbox
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-overloaded hover:bg-overloaded/10"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">What was your biggest win?</label>
                <input
                  value={win}
                  onChange={(e) => setWin(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">What got in the way?</label>
                <input
                  value={blocker}
                  onChange={(e) => setBlocker(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Anything to carry into tomorrow?</label>
                <input
                  value={moveNote}
                  onChange={(e) => setMoveNote(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border-subtle bg-surface-sunken px-3 py-2.5 text-sm text-ink-muted">
              Tomorrow, {format(addDays(new Date(date), 1), 'EEEE')} — a clean plan is waiting for you.
            </div>
          </>
        )}
      </div>
      {!saved && (
        <div className="flex justify-end border-t border-border-subtle px-5 py-3">
          <Button variant="primary" onClick={handleFinishDay}>Finish day</Button>
        </div>
      )}
    </Modal>
  );
}
