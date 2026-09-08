import { Check, GripVertical } from 'lucide-react';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { cn, formatMinutes, PRIORITY_DOT } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  draggableHandle?: boolean;
  compact?: boolean;
}

export function TaskCard({ task, draggableHandle, compact }: TaskCardProps) {
  const completeTask = useTaskStore((s) => s.completeTask);
  const reopenTask = useTaskStore((s) => s.reopenTask);
  const projects = useTaskStore((s) => s.projects);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const project = projects.find((p) => p.id === task.projectId);
  const isDone = task.status === 'completed';

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-raised px-3 shadow-soft transition-colors hover:border-border',
        compact ? 'py-2' : 'py-3'
      )}
    >
      {draggableHandle && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-faint opacity-0 group-hover:opacity-100" />}

      <button
        onClick={() => (isDone ? reopenTask(task.id) : completeTask(task.id))}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isDone ? 'border-healthy bg-healthy text-white animate-check-pop' : 'border-border-subtle hover:border-accent-500'
        )}
      >
        {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      <button className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => openTaskDetail(task.id)}>
        <span className={cn('truncate text-[14px] font-medium text-ink', isDone && 'text-ink-faint line-through')}>
          {task.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
          {project && (
            <>
              <span>{project.icon}</span>
              <span className="truncate">{project.name}</span>
              <span className="text-ink-faint">·</span>
            </>
          )}
          <span>{formatMinutes(task.estimatedMinutes)}</span>
        </span>
      </button>

      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', PRIORITY_DOT[task.priority])} title={`${task.priority} priority`} />
    </div>
  );
}
