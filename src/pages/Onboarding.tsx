import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlannerStore } from '../store/plannerStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const FOCUS_AREAS = ['University', 'Work', 'Personal projects', 'Fitness', 'Life organization', 'Multiple things'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { signInDemo } = useAuth();
  const updateSettings = usePlannerStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState<string[]>([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('18:00');

  function toggleArea(a: string) {
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function finish() {
    updateSettings({ workingHours: { start, end } });
    signInDemo();
    navigate('/app/today');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-raised p-7 shadow-raised">
        <div className="mb-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
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
            <Button variant="primary" className="mt-6 w-full justify-center" onClick={finish}>Show me my first plan</Button>
          </div>
        )}
      </div>
    </div>
  );
}
