import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { aiService } from '../../services/aiService';
import type { ParsedTaskDraft, Priority } from '../../types';
import { formatMinutes } from '../../lib/utils';

export function QuickAddModal() {
  const open = useUIStore((s) => s.quickAddOpen);
  const setOpen = useUIStore((s) => s.setQuickAddOpen);
  const pushToast = useUIStore((s) => s.pushToast);
  const addTask = useTaskStore((s) => s.addTask);
  const projects = useTaskStore((s) => s.projects);

  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ParsedTaskDraft | null>(null);
  const [projectId, setProjectId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    if (!open) {
      setInput('');
      setPreview(null);
      setProjectId('');
      setPriority('medium');
    }
  }, [open]);

  useEffect(() => {
    if (!input.trim()) {
      setPreview(null);
      return;
    }
    const handle = setTimeout(async () => {
      const parsed = await aiService.parseNaturalLanguageTask(input);
      setPreview(parsed);
    }, 200);
    return () => clearTimeout(handle);
  }, [input]);

  function handleSave() {
    if (!input.trim()) return;
    const title = preview?.title || input.trim();
    addTask({
      title,
      projectId: projectId || null,
      priority,
      estimatedMinutes: preview?.estimatedMinutes ?? 30,
      scheduledDate: preview?.scheduledDate ?? null,
      dueDate: preview?.dueDate ?? null,
    });
    pushToast({ message: `Added "${title}" to your day.` });
    setOpen(false);
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Quick add" className="max-w-xl">
      <div className="p-5">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder='Try "Study networking for two hours tomorrow morning"'
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
        />

        {preview && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent-50 px-3 py-2.5 text-sm text-accent-800 dark:bg-accent-900/20 dark:text-accent-200">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-medium">{preview.title}</span>
              <span className="ml-1.5 text-accent-700/80 dark:text-accent-300/80">
                {preview.estimatedMinutes ? `· ${formatMinutes(preview.estimatedMinutes)}` : ''}
                {preview.scheduledDate ? ` · ${format(new Date(preview.scheduledDate), 'MMM d')}` : ''}
                {preview.suggestedTimeOfDay ? ` · ${preview.suggestedTimeOfDay}` : ''}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink focus:border-accent-500 focus:outline-none"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink focus:border-accent-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3">
        <span className="text-xs text-ink-faint">Press Enter to add</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!input.trim()}>Add to day</Button>
        </div>
      </div>
    </Modal>
  );
}
