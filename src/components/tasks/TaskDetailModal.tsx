import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Plus, Timer, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { cn, formatMinutes, uid, PRIORITY_LABEL } from '../../lib/utils';

export function TaskDetailModal() {
  const activeId = useUIStore((s) => s.activeTaskDetailId);
  const closeTaskDetail = useUIStore((s) => s.closeTaskDetail);
  const startFocus = useUIStore((s) => s.startFocus);
  const pushToast = useUIStore((s) => s.pushToast);

  const tasks = useTaskStore((s) => s.tasks);
  const projects = useTaskStore((s) => s.projects);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const moveTaskToTomorrow = useTaskStore((s) => s.moveTaskToTomorrow);

  const [newSubtask, setNewSubtask] = useState('');

  const task = tasks.find((t) => t.id === activeId);
  if (!task) return null;
  const project = projects.find((p) => p.id === task.projectId);

  function addSubtask() {
    if (!newSubtask.trim() || !task) return;
    const current = task;
    updateTask(current.id, { subtasks: [...current.subtasks, { id: uid('sub'), title: newSubtask.trim(), completed: false }] });
    setNewSubtask('');
  }

  function toggleSubtask(id: string) {
    const current = task;
    if (!current) return;
    updateTask(current.id, { subtasks: current.subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)) });
  }

  return (
    <Modal open={!!activeId} onClose={closeTaskDetail} hideHeader className="max-w-xl">
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project && <Badge tone="neutral">{project.icon} {project.name}</Badge>}
            <Badge tone={task.priority === 'high' ? 'overloaded' : task.priority === 'medium' ? 'accent' : 'neutral'}>
              {PRIORITY_LABEL[task.priority]}
            </Badge>
          </div>
          <button onClick={closeTaskDetail} className="text-ink-faint hover:text-ink">✕</button>
        </div>

        <input
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className={cn(
            'w-full border-none bg-transparent text-xl font-semibold text-ink outline-none',
            task.status === 'completed' && 'text-ink-faint line-through'
          )}
        />

        <textarea
          value={task.description ?? ''}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
          placeholder="Add a description…"
          rows={2}
          className="mt-2 w-full resize-none rounded-lg border border-transparent bg-transparent px-0 text-sm text-ink-muted outline-none placeholder:text-ink-faint hover:border-border-subtle focus:border-border focus:bg-surface-sunken focus:px-2 focus:py-1"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-sunken px-3 py-2">
            <p className="text-xs text-ink-faint">Estimated</p>
            <p className="font-medium text-ink">{formatMinutes(task.estimatedMinutes)}</p>
          </div>
          <div className="rounded-lg bg-surface-sunken px-3 py-2">
            <p className="text-xs text-ink-faint">Actual</p>
            <p className="font-medium text-ink">{formatMinutes(task.actualMinutes)}</p>
          </div>
          <div className="rounded-lg bg-surface-sunken px-3 py-2">
            <p className="text-xs text-ink-faint">Scheduled</p>
            <p className="font-medium text-ink">
              {task.scheduledDate ? format(new Date(task.scheduledDate), 'EEE, MMM d') : 'Not scheduled'}
            </p>
          </div>
          <div className="rounded-lg bg-surface-sunken px-3 py-2">
            <p className="text-xs text-ink-faint">Due</p>
            <p className="font-medium text-ink">{task.dueDate ? format(new Date(task.dueDate), 'EEE, MMM d') : 'No due date'}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Subtasks</p>
          <div className="flex flex-col gap-1.5">
            {task.subtasks.map((s) => (
              <button key={s.id} onClick={() => toggleSubtask(s.id)} className="flex items-center gap-2 text-left text-sm">
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border-2',
                    s.completed ? 'border-healthy bg-healthy text-white' : 'border-border-subtle'
                  )}
                >
                  {s.completed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className={cn('text-ink', s.completed && 'text-ink-faint line-through')}>{s.title}</span>
              </button>
            ))}
            <div className="mt-1 flex items-center gap-2">
              <Plus className="h-4 w-4 text-ink-faint" />
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                placeholder="Add a subtask"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Notes</p>
          <textarea
            value={task.notes ?? ''}
            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
            placeholder="Notes, links, context…"
            rows={3}
            className="w-full resize-none rounded-lg border border-border-subtle bg-surface-sunken px-2.5 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {task.status !== 'completed' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                completeTask(task.id);
                pushToast({ message: `Completed "${task.title}"` });
              }}
            >
              <Check className="h-4 w-4" /> Complete
            </Button>
          ) : (
            <Badge tone="healthy">Completed</Badge>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              startFocus(task.id);
              closeTaskDetail();
            }}
          >
            <Timer className="h-4 w-4" /> Start focus
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              moveTaskToTomorrow(task.id);
              pushToast({ message: `Moved "${task.title}" to tomorrow` });
              closeTaskDetail();
            }}
          >
            Move to tomorrow
          </Button>
        </div>
        <button
          onClick={() => {
            deleteTask(task.id);
            closeTaskDetail();
            pushToast({ message: `Deleted "${task.title}"` });
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-overloaded hover:bg-overloaded/10"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </Modal>
  );
}
