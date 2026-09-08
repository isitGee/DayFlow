import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock } from 'lucide-react';
import type { CalendarEvent, Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { cn, formatMinutes, PRIORITY_DOT } from '../../lib/utils';

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64; // px per hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

function minutesSinceStart(date: Date): number {
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes();
}

function timeFromOffsetMinutes(base: Date, totalMinutesFromStart: number): Date {
  const d = new Date(base);
  d.setHours(START_HOUR, 0, 0, 0);
  d.setMinutes(d.getMinutes() + totalMinutesFromStart);
  return d;
}

function snap(mins: number, step = 15): number {
  return Math.round(mins / step) * step;
}

interface TimelineProps {
  date: string; // yyyy-MM-dd
  tasks: Task[];
  events: CalendarEvent[];
}

export function Timeline({ date, tasks, events }: TimelineProps) {
  const scheduleTask = useTaskStore((s) => s.scheduleTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const startFocus = useUIStore((s) => s.startFocus);

  const containerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [resizeTaskId, setResizeTaskId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  const scheduled = tasks.filter((t) => t.scheduledDate === date && t.scheduledStart && t.scheduledEnd);

  const isToday = format(now, 'yyyy-MM-dd') === date;
  const nowOffset = minutesSinceStart(now);

  function offsetFromClientY(clientY: number): number {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const y = clientY - rect.top;
    return snap(Math.max(0, y / MINUTE_HEIGHT));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragTaskId) return;
    const task = tasks.find((t) => t.id === dragTaskId);
    if (!task) return;
    const duration = task.estimatedMinutes;
    const startOffset = offsetFromClientY(e.clientY);
    const newStart = timeFromOffsetMinutes(new Date(date), startOffset);
    const newEnd = new Date(newStart.getTime() + duration * 60000);
    scheduleTask(task.id, date, newStart.toISOString(), newEnd.toISOString());
    setDragTaskId(null);
  }

  function handleResizeMove(taskId: string, e: PointerEvent) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.scheduledStart) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startOffset = minutesSinceStart(new Date(task.scheduledStart));
    const currentOffset = snap(Math.max(startOffset + 15, (e.clientY - rect.top) / MINUTE_HEIGHT));
    const newEnd = timeFromOffsetMinutes(new Date(date), currentOffset);
    scheduleTask(task.id, date, task.scheduledStart, newEnd.toISOString());
  }

  function startResize(taskId: string) {
    setResizeTaskId(taskId);
    function move(e: PointerEvent) {
      handleResizeMove(taskId, e);
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setResizeTaskId(null);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-soft">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-muted">
        <Clock className="h-4 w-4" /> Timeline
      </div>
      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative select-none"
        style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
      >
        {hours.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex items-start gap-3" style={{ top: i * HOUR_HEIGHT }}>
            <span className="w-12 -translate-y-2 text-right text-xs text-ink-faint">
              {format(new Date(2000, 0, 1, h), 'h a')}
            </span>
            <div className="mt-0 h-px flex-1 bg-border-subtle" />
          </div>
        ))}

        {events.map((evt) => {
          const start = new Date(evt.start);
          const end = new Date(evt.end);
          const top = minutesSinceStart(start) * MINUTE_HEIGHT;
          const height = Math.max(20, (minutesSinceStart(end) - minutesSinceStart(start)) * MINUTE_HEIGHT);
          return (
            <div
              key={evt.id}
              className="absolute left-14 right-2 rounded-md border border-dashed border-ink-faint/40 bg-surface-sunken/60 px-2 py-1 text-xs text-ink-faint"
              style={{ top, height }}
            >
              {evt.title}
            </div>
          );
        })}

        {scheduled.map((task) => {
          const start = new Date(task.scheduledStart!);
          const end = new Date(task.scheduledEnd!);
          const top = minutesSinceStart(start) * MINUTE_HEIGHT;
          const height = Math.max(28, (minutesSinceStart(end) - minutesSinceStart(start)) * MINUTE_HEIGHT);
          const isActive = isToday && now >= start && now <= end && task.status !== 'completed';
          const isDone = task.status === 'completed';

          return (
            <div
              key={task.id}
              draggable={!isDone}
              onDragStart={() => setDragTaskId(task.id)}
              onClick={() => openTaskDetail(task.id)}
              className={cn(
                'group absolute left-14 right-2 cursor-pointer rounded-lg border px-3 py-1.5 shadow-soft transition-shadow',
                isDone
                  ? 'border-border-subtle bg-surface-sunken opacity-60'
                  : isActive
                  ? 'border-accent-400 bg-accent-50 ring-2 ring-accent-300 dark:bg-accent-900/30'
                  : 'border-border-subtle bg-surface hover:border-accent-300',
                resizeTaskId === task.id && 'ring-2 ring-accent-400'
              )}
              style={{ top, height }}
            >
              <div className="flex h-full flex-col justify-between overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('truncate text-[13px] font-medium text-ink', isDone && 'text-ink-faint line-through')}>
                    {task.title}
                  </span>
                  <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', PRIORITY_DOT[task.priority])} />
                </div>
                {height > 36 && (
                  <div className="flex items-center justify-between text-[11px] text-ink-faint">
                    <span>{format(start, 'h:mm a')} – {format(end, 'h:mm a')} · {formatMinutes(task.estimatedMinutes)}</span>
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startFocus(task.id);
                        }}
                        className="rounded bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100"
                      >
                        Focus
                      </button>
                    )}
                  </div>
                )}
              </div>
              {!isDone && (
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startResize(task.id);
                  }}
                  className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize rounded-b-lg opacity-0 group-hover:opacity-100 group-hover:bg-accent-400/50"
                />
              )}
              {!isDone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    completeTask(task.id);
                  }}
                  className="absolute right-1.5 top-1.5 hidden h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-ink-faint hover:border-healthy hover:text-healthy group-hover:flex"
                >
                  <Check className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {isToday && nowOffset >= 0 && nowOffset <= (END_HOUR - START_HOUR) * 60 && (
          <div className="pointer-events-none absolute left-10 right-0 z-10 flex items-center gap-1.5" style={{ top: nowOffset * MINUTE_HEIGHT }}>
            <span className="h-2 w-2 rounded-full bg-accent-600" />
            <div className="h-px flex-1 bg-accent-600" />
            <span className="rounded bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{format(now, 'h:mm a')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
