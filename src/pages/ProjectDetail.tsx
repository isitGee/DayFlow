import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { formatMinutes } from '../lib/utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const projects = useTaskStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return <EmptyState title="Project not found" description="It may have been deleted." />;
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completed = projectTasks.filter((t) => t.status === 'completed');
  const upcoming = projectTasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const pct = projectTasks.length ? Math.round((completed.length / projectTasks.length) * 100) : 0;
  const totalEstimated = projectTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalActual = projectTasks.reduce((s, t) => s + t.actualMinutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/app/projects" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Projects
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{project.icon}</span>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{project.name}</h1>
          {project.description && <p className="text-sm text-ink-muted">{project.description}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Progress: {pct}%</span>
          <span className="text-ink-muted">{completed.length} / {projectTasks.length} tasks complete</span>
        </div>
        <Progress value={pct} />
        <div className="mt-3 flex gap-6 text-xs text-ink-faint">
          <span>Estimated: {formatMinutes(totalEstimated)}</span>
          <span>Logged: {formatMinutes(totalActual)}</span>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">Upcoming tasks</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing upcoming" description="Add a task to keep this project moving." />
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">Completed</h2>
          <div className="flex flex-col gap-2">
            {completed.map((t) => <TaskCard key={t.id} task={t} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
