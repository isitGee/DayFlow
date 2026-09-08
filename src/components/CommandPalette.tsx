import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { CalendarDays, Inbox, Plus, Search, Settings, Sparkles, Sun, Target, Timer } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTaskStore } from '../store/taskStore';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const startFocus = useUIStore((s) => s.startFocus);
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useTaskStore((s) => s.projects);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const staticCommands: Command[] = [
    { id: 'new-task', label: 'Create task', icon: Plus, action: () => setQuickAddOpen(true) },
    { id: 'go-today', label: 'Go to Today', icon: Sun, action: () => navigate('/app/today') },
    { id: 'go-inbox', label: 'Go to Inbox', icon: Inbox, action: () => navigate('/app/inbox') },
    { id: 'go-calendar', label: 'Go to Calendar', icon: CalendarDays, action: () => navigate('/app/calendar') },
    { id: 'go-goals', label: 'Go to Goals', icon: Target, action: () => navigate('/app/goals') },
    { id: 'go-analytics', label: 'Go to Analytics', icon: Sparkles, action: () => navigate('/app/analytics') },
    { id: 'go-settings', label: 'Open settings', icon: Settings, action: () => navigate('/app/settings') },
  ];

  const taskCommands: Command[] = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'completed' && t.status !== 'archived')
        .slice(0, 8)
        .map((t) => ({
          id: `focus-${t.id}`,
          label: t.title,
          hint: projects.find((p) => p.id === t.projectId)?.name,
          icon: Timer,
          action: () => startFocus(t.id),
        })),
    [tasks, projects, startFocus]
  );

  const all = [...staticCommands, ...taskCommands];
  const filtered = query.trim()
    ? all.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : all;

  function run(cmd: Command) {
    cmd.action();
    setOpen(false);
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-raised animate-slide-up">
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
          <Search className="h-4 w-4 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && filtered[activeIndex]) {
                run(filtered[activeIndex]);
              }
            }}
            placeholder="Search tasks or run a command…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-faint">No matches</p>}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => run(cmd)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                i === activeIndex ? 'bg-accent-50 text-accent-800 dark:bg-accent-900/30 dark:text-accent-200' : 'text-ink hover:bg-surface-sunken'
              }`}
            >
              <cmd.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{cmd.label}</span>
              {cmd.hint && <span className="text-xs text-ink-faint">{cmd.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
