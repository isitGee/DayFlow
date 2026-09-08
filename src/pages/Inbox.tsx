import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Inbox as InboxIcon, Sparkles } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useUIStore } from '../store/uiStore';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { aiService } from '../services/aiService';
import { formatMinutes, PRIORITY_DOT } from '../lib/utils';

export default function Inbox() {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useTaskStore((s) => s.projects);
  const scheduleTask = useTaskStore((s) => s.scheduleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const pushToast = useUIStore((s) => s.pushToast);

  const [planning, setPlanning] = useState(false);

  const inboxTasks = useMemo(() => tasks.filter((t) => t.status === 'inbox'), [tasks]);

  async function handlePlanInbox() {
    setPlanning(true);
    const suggested = await aiService.suggestPriorities(inboxTasks);
    suggested.forEach((t) => scheduleTask(t.id, format(new Date(), 'yyyy-MM-dd')));
    pushToast({ message: `Scheduled ${suggested.length} task${suggested.length === 1 ? '' : 's'} for today.` });
    setPlanning(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Inbox</h1>
          <p className="mt-1 text-sm text-ink-muted">Capture now. Organize later.</p>
        </div>
        {inboxTasks.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handlePlanInbox} disabled={planning}>
            <Sparkles className="h-4 w-4" /> {planning ? 'Planning…' : 'Plan my inbox'}
          </Button>
        )}
      </div>

      {inboxTasks.length === 0 ? (
        <EmptyState
          title="Nothing captured."
          description="Enjoy the empty inbox."
          icon={<InboxIcon className="h-5 w-5" />}
          action={<Button variant="primary" onClick={() => setQuickAddOpen(true)}>+ Add a task</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {inboxTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            return (
              <div key={task.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-raised px-3 py-3 shadow-soft">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                <button className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => openTaskDetail(task.id)}>
                  <span className="truncate text-[14px] font-medium text-ink">{task.title}</span>
                  <span className="mt-0.5 text-xs text-ink-muted">
                    {project ? `${project.icon} ${project.name} · ` : ''}
                    {formatMinutes(task.estimatedMinutes)}
                  </span>
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      scheduleTask(task.id, format(new Date(), 'yyyy-MM-dd'));
                      pushToast({ message: `Scheduled "${task.title}" for today` });
                    }}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface-sunken"
                  >
                    Schedule
                  </button>
                  <select
                    value={task.projectId ?? ''}
                    onChange={(e) => updateTask(task.id, { projectId: e.target.value || null })}
                    className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-muted"
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                  <button onClick={() => deleteTask(task.id)} className="rounded-md px-2 py-1 text-xs text-overloaded hover:bg-overloaded/10">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
