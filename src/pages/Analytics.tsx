import { useMemo } from 'react';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { getWeekHistory, PROJECT_DISTRIBUTION_FALLBACK } from '../lib/analyticsDemo';
import { formatMinutes } from '../lib/utils';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-soft">
      <p className="text-xs font-medium text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

const CHART_COLORS = ['#2b7de9', '#1a9e6f', '#c98a12', '#8b5cf6', '#d64545', '#0891b2'];

export default function Analytics() {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useTaskStore((s) => s.projects);

  const history = useMemo(() => getWeekHistory(), []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const completedToday = tasks.filter((t) => t.status === 'completed' && t.scheduledDate === todayStr);
  const todayStat = {
    date: todayStr,
    label: 'Today',
    focusMinutes: completedToday.reduce((s, t) => s + t.actualMinutes, 0),
    tasksCompleted: completedToday.length,
    plannedMinutes: tasks.filter((t) => t.scheduledDate === todayStr).reduce((s, t) => s + t.estimatedMinutes, 0),
    actualMinutes: completedToday.reduce((s, t) => s + t.actualMinutes, 0),
  };
  const fullWeek = [...history, todayStat];

  const weeklyFocusMinutes = fullWeek.reduce((s, d) => s + d.focusMinutes, 0);
  const weeklyTasksCompleted = fullWeek.reduce((s, d) => s + d.tasksCompleted, 0);
  const avgSession = weeklyTasksCompleted ? Math.round(weeklyFocusMinutes / weeklyTasksCompleted) : 0;
  const completionRate = Math.round(
    (fullWeek.reduce((s, d) => s + d.tasksCompleted, 0) / Math.max(1, fullWeek.reduce((s, d) => s + Math.max(d.tasksCompleted, Math.round(d.plannedMinutes / 45)), 0))) * 100
  );

  const projectDistribution = useMemo(() => {
    const counts = projects.map((p, i) => ({
      name: p.name,
      value: tasks.filter((t) => t.projectId === p.id).length,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter((p) => p.value > 0);
    return counts.length ? counts : PROJECT_DISTRIBUTION_FALLBACK;
  }, [projects, tasks]);

  const mostProductiveDay = [...fullWeek].sort((a, b) => b.tasksCompleted - a.tasksCompleted)[0];
  const avgPlannedRatio = Math.round(
    (fullWeek.reduce((s, d) => s + d.plannedMinutes, 0) / Math.max(1, fullWeek.reduce((s, d) => s + d.actualMinutes, 0)) - 1) * 100
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-ink">Analytics</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Weekly focus time" value={formatMinutes(weeklyFocusMinutes)} />
        <StatCard label="Tasks completed" value={String(weeklyTasksCompleted)} />
        <StatCard label="Completion rate" value={`${Math.min(100, Math.max(0, completionRate))}%`} />
        <StatCard label="Avg. focus session" value={formatMinutes(avgSession)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-ink-muted">Focus time by day</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fullWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatMinutes(Number(v))} contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="focusMinutes" stroke="#2b7de9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-ink-muted">Tasks completed by day</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fullWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="tasksCompleted" fill="#1a9e6f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-ink-muted">Planned vs actual time</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fullWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatMinutes(Number(v))} contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="plannedMinutes" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Planned" />
              <Bar dataKey="actualMinutes" fill="#2b7de9" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
          <p className="mb-3 text-sm font-medium text-ink-muted">Project distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={projectDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {projectDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3">
            {projectDistribution.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-accent-50 p-5 dark:bg-accent-900/20">
        <p className="mb-2 text-sm font-semibold text-accent-800 dark:text-accent-200">Insights</p>
        <ul className="flex flex-col gap-1.5 text-sm text-accent-800/90 dark:text-accent-200/90">
          <li>• You tend to complete the most tasks on {mostProductiveDay.label === 'Today' ? "days like today" : mostProductiveDay.label}.</li>
          <li>• Your plans run about {Math.max(0, avgPlannedRatio)}% longer than the time you actually spend.</li>
          <li>• Average focus session is {formatMinutes(avgSession)} — right in a sustainable range.</li>
        </ul>
      </div>
    </div>
  );
}
