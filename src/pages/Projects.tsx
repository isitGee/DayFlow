import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Progress } from '../components/ui/Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const ICON_OPTIONS = ['🎓', '💻', '🎨', '🏃', '📚', '💼', '🧪', '🎵', '🌱', '✈️'];
const COLOR_OPTIONS = ['#2b7de9', '#1a9e6f', '#c98a12', '#8b5cf6', '#d64545', '#0891b2'];

export default function Projects() {
  const projects = useTaskStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const addProject = useTaskStore((s) => s.addProject);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    addProject({ name: name.trim(), icon, color, status: 'active', description: '' });
    setCreateOpen(false);
    setName('');
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Projects</h1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Create your first project." icon={<LayoutGrid className="h-5 w-5" />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const projectTasks = tasks.filter((t) => t.projectId === p.id);
            const done = projectTasks.filter((t) => t.status === 'completed').length;
            const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
            return (
              <Link
                key={p.id}
                to={`/app/projects/${p.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft transition-shadow hover:shadow-raised"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-semibold text-ink">{p.name}</span>
                </div>
                {p.description && <p className="text-sm text-ink-muted">{p.description}</p>}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-ink-faint">
                    <span>{pct}% complete</span>
                    <span>{done}/{projectTasks.length} tasks</span>
                  </div>
                  <Progress value={pct} barClassName="bg-[--project-color]" className="[--project-color:var(--p)]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New project">
        <div className="flex flex-col gap-4 p-5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
          />
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-muted">Icon</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg ${icon === i ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' : 'border-border'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-muted">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: color === c ? c : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>Create project</Button>
        </div>
      </Modal>
    </div>
  );
}
