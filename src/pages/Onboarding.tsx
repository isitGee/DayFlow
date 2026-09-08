import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Check, Sparkles } from 'lucide-react';
import { usePlannerStore } from '../store/plannerStore';
import { useTaskStore } from '../store/taskStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { DailyCapacity } from '../components/planner/DailyCapacity';
import { calculateWorkload } from '../services/scheduleService';
import { cn, formatMinutes } from '../lib/utils';
import type { Priority } from '../types';

const FOCUS_AREAS = ['University', 'Work', 'Personal projects', 'Fitness', 'Life organization', 'Multiple things'];
const PLANNING_PREFS: Array<{ value: 'manual' | 'assisted' | 'automatic'; label: string; desc: string }> = [
  { value: 'manual', label: 'Manual', desc: "I'll build my own schedule." },
  { value: 'assisted', label: 'Assisted', desc: 'Suggest priorities and timing, I decide.' },
  { value: 'automatic', label: 'Automatic', desc: 'Build my day for me when I ask.' },
];

const STEP_COUNT = 6;

export default function Onboarding() {
  const navigate = useNavigate();
  const { signInDemo, isDemoMode } = useAuth();
  const updateSettings = usePlannerStore((s) => s.updateSettings);
  const addTask = useTaskStore((s) => s.addTask);
  const tasks = useTaskStore((s) => s.tasks);
  const events = useTaskStore((s) => s.events);

  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState<string[]>([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('18:00');
  const [planningPreference, setPlanningPreference] = useState<'manual' | 'assisted' | 'automatic'>('assisted');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMinutes, setTaskMinutes] = useState(60);
  const [taskPriority, setTaskPriority] = useState<Priority>('high');
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  function toggleArea(a: string) {
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handleCreateFirstTask() {
    if (!taskTitle.trim()) {
      setStep(5);
      return;
    }
    const today = format(new Date(), 'yyyy-MM-dd');
    const task = addTask({
      title: taskTitle.trim(),
      priority: taskPriority,
      estimatedMinutes: taskMinutes,
      scheduledDate: today,
      isPriorityToday: true,
    });
    setCreatedTaskId(task.id);
    setStep(5);
  }

  function finish() {
    updateSettings({ workingHours: { start, end }, planningPreference });
    if (isDemoMode) signInDemo();
    navigate('/app/today');
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => t.scheduledDate === today);
  const previewWorkload = calculateWorkload(todayTasks, { start, end }, events);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-raised p-7 shadow-raised">
        <div className="mb-6 flex gap-1.5">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-accent-600' : 'bg-surface-sunken')} />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <h1 className="text-xl font-semibold text-ink">Welcome to DAYFLOW.</h1>
            <p className="mt-2 text-sm text-ink-muted">Let's build a day that actually fits.</p>
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={() => setStep(1)}>Get started</Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">What are you here for?</h2>
            <p className="mt-1 text-sm text-ink-muted">Pick as many as you'd like.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FOCUS_AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleArea(a)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm',
                    areas.includes(a) ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : 'border-border text-ink-muted'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">Typical working hours</h2>
            <p className="mt-1 text-sm text-ink-muted">We'll use this to figure out how much time you realistically have each day.</p>
            <div className="mt-4 flex items-center gap-3">
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink" />
              <span className="text-ink-faint">–</span>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink" />
            </div>
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={() => setStep(3)}>Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">How hands-on do you want DAYFLOW to be?</h2>
            <p className="mt-1 text-sm text-ink-muted">You can change this anytime in Settings.</p>
            <div className="mt-4 flex flex-col gap-2">
              {PLANNING_PREFS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlanningPreference(p.value)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left',
                    planningPreference === p.value ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' : 'border-border'
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-ink">{p.label}</span>
                    <span className="block text-xs text-ink-muted">{p.desc}</span>
                  </span>
                  {planningPreference === p.value && <Check className="h-4 w-4 shrink-0 text-accent-600" />}
                </button>
              ))}
            </div>
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={() => setStep(4)}>Continue</Button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">Create your first task</h2>
            <p className="mt-1 text-sm text-ink-muted">What's one thing you'd like to get done today?</p>
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder='e.g. "Finish database assignment"'
              className="mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">About how long?</label>
                <select
                  value={taskMinutes}
                  onChange={(e) => setTaskMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink"
                >
                  {[15, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>{formatMinutes(m)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setStep(5)}>Skip</Button>
              <Button variant="primary" className="flex-1 justify-center" onClick={handleCreateFirstTask}>Add it</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-600" />
              <h2 className="text-lg font-semibold text-ink">Here's your first plan.</h2>
            </div>
            <DailyCapacity workload={previewWorkload} />
            {createdTaskId && (
              <p className="mt-3 text-sm text-ink-muted">
                "{taskTitle}" is on your Today page, marked as a priority for today.
              </p>
            )}
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={finish}>Take me to my day</Button>
          </div>
        )}
      </div>
    </div>
  );
}
