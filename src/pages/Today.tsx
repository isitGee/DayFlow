import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Moon, Sparkles } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { usePlannerStore } from '../store/plannerStore';
import { useUIStore } from '../store/uiStore';
import { calculateWorkload } from '../services/scheduleService';
import { DailyCapacity } from '../components/planner/DailyCapacity';
import { PrioritiesList } from '../components/planner/PrioritiesList';
import { Timeline } from '../components/planner/Timeline';
import { DailyReviewModal } from '../components/planner/DailyReviewModal';
import { TaskCard } from '../components/tasks/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { greeting } from '../lib/utils';

export default function Today() {
  const tasks = useTaskStore((s) => s.tasks);
  const events = useTaskStore((s) => s.events);
  const settings = usePlannerStore((s) => s.settings);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const [reviewOpen, setReviewOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const tasksToday = useMemo(() => tasks.filter((t) => t.scheduledDate === today), [tasks, today]);
  const priorityTasks = useMemo(() => tasksToday.filter((t) => t.isPriorityToday), [tasksToday]);
  const otherTasks = useMemo(
    () => tasksToday.filter((t) => !t.isPriorityToday).sort((a, b) => (a.scheduledStart ?? '').localeCompare(b.scheduledStart ?? '')),
    [tasksToday]
  );

  const workload = useMemo(() => calculateWorkload(tasksToday, settings.workingHours, events), [tasksToday, settings.workingHours, events]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {greeting()}, {settings.name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setReviewOpen(true)}>
          <Moon className="h-4 w-4" /> Wrap up day
        </Button>
      </div>

      <DailyCapacity workload={workload} />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Today's priorities</h2>
          <span className="text-xs text-ink-faint">{priorityTasks.length}/3</span>
        </div>
        <PrioritiesList tasks={priorityTasks} />
      </section>

      <section>
        <Timeline date={today} tasks={tasksToday} events={events} />
      </section>

      {otherTasks.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">Also today</h2>
          <div className="flex flex-col gap-2">
            {otherTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}

      {tasksToday.length === 0 && (
        <EmptyState
          title="Your day is clear."
          description="You've got nothing scheduled yet."
          icon={<Sparkles className="h-5 w-5" />}
          action={<Button variant="primary" onClick={() => setQuickAddOpen(true)}>+ Plan my day</Button>}
        />
      )}

      <DailyReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} date={today} tasksForDay={tasksToday} workload={workload} />
    </div>
  );
}
