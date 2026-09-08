import { useMemo, useState } from 'react';
import { addDays, format, isToday, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useUIStore } from '../store/uiStore';
import { Timeline } from '../components/planner/Timeline';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

type ViewMode = 'day' | '3day' | 'week';

const VIEW_DAYS: Record<ViewMode, number> = { day: 1, '3day': 3, week: 7 };

export default function CalendarPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const events = useTaskStore((s) => s.events);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const [view, setView] = useState<ViewMode>('3day');
  const [anchor, setAnchor] = useState(new Date());

  const days = useMemo(() => {
    const count = VIEW_DAYS[view];
    const start = view === 'week' ? startOfWeek(anchor, { weekStartsOn: 1 }) : anchor;
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  function shift(dir: 1 | -1) {
    setAnchor((d) => addDays(d, dir * VIEW_DAYS[view]));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Calendar</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {format(days[0], 'MMM d')} – {format(days[days.length - 1], 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5">
            {(['day', '3day', 'week'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium capitalize text-ink-muted',
                  view === v && 'bg-accent-600 text-white'
                )}
              >
                {v === '3day' ? '3 Days' : v}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="icon" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(new Date())}>Today</Button>
        </div>
      </div>

      <div className={cn('grid gap-4', view === 'day' ? 'grid-cols-1' : view === '3day' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 xl:grid-cols-7')}>
        {days.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);
          const dayEvents = events.filter((e) => format(new Date(e.start), 'yyyy-MM-dd') === dateStr);
          return (
            <div key={dateStr} className="flex flex-col gap-2">
              <button
                onClick={() => setQuickAddOpen(true)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-2 py-1 text-left text-sm font-medium',
                  isToday(d) ? 'text-accent-600' : 'text-ink-muted'
                )}
              >
                <span>{format(d, 'EEE d')}</span>
                {isToday(d) && <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">Today</span>}
              </button>
              <Timeline date={dateStr} tasks={dayTasks} events={dayEvents} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
