import { usePlannerStore } from '../store/plannerStore';
import { useUIStore } from '../store/uiStore';
import { useTaskStore } from '../store/taskStore';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
      <p className="mb-4 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, isDemoMode, signOut } = useAuth();
  const settings = usePlannerStore((s) => s.settings);
  const updateSettings = usePlannerStore((s) => s.updateSettings);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const resetDemoData = useTaskStore((s) => s.resetDemoData);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>

      <Section title="Profile">
        <label className="mb-1 block text-xs font-medium text-ink-muted">Display name</label>
        <input
          value={settings.name}
          onChange={(e) => updateSettings({ name: e.target.value })}
          placeholder={user?.name || 'Your name'}
          className="w-full max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
        />
        {!isDemoMode && (
          <p className="mt-1.5 text-xs text-ink-faint">Leave blank to use the name on your account ({user?.name}). Set this to show a different name instead.</p>
        )}
      </Section>

      <Section title="Working hours">
        <div className="flex items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Start</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, start: e.target.value } })}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
            />
          </div>
          <span className="mt-5 text-ink-faint">–</span>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">End</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => updateSettings({ workingHours: { ...settings.workingHours, end: e.target.value } })}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Used to calculate your available time and daily capacity.</p>
      </Section>

      <Section title="Appearance">
        <div className="flex gap-2">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize',
                theme === t ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : 'border-border text-ink-muted'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Planning preference">
        <div className="flex gap-2">
          {(['manual', 'assisted', 'automatic'] as const).map((p) => (
            <button
              key={p}
              onClick={() => updateSettings({ planningPreference: p })}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize',
                settings.planningPreference === p ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' : 'border-border text-ink-muted'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Pomodoro">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Enable Pomodoro suggestions</span>
          <button
            onClick={() => updateSettings({ pomodoro: { ...settings.pomodoro, enabled: !settings.pomodoro.enabled } })}
            className={cn('h-6 w-11 rounded-full transition-colors', settings.pomodoro.enabled ? 'bg-accent-600' : 'bg-surface-sunken')}
          >
            <span className={cn('block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform', settings.pomodoro.enabled && 'translate-x-5')} />
          </button>
        </div>
        {settings.pomodoro.enabled && (
          <div className="mt-3 flex gap-2">
            {[
              { work: 25, break: 5 },
              { work: 50, break: 10 },
            ].map((preset) => (
              <button
                key={preset.work}
                onClick={() => updateSettings({ pomodoro: { ...settings.pomodoro, work: preset.work, break: preset.break } })}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm',
                  settings.pomodoro.work === preset.work ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30' : 'border-border text-ink-muted'
                )}
              >
                {preset.work}/{preset.break}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Notifications">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-muted">Browser notifications</p>
            <p className="text-xs text-ink-faint">Upcoming tasks, task start times, and overdue items.</p>
          </div>
          <button
            onClick={async () => {
              if (!settings.notificationsEnabled && typeof Notification !== 'undefined') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                  pushToast({ message: 'Notifications were blocked in your browser settings.' });
                  return;
                }
              }
              updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
            }}
            className={cn('h-6 w-11 shrink-0 rounded-full transition-colors', settings.notificationsEnabled ? 'bg-accent-600' : 'bg-surface-sunken')}
          >
            <span className={cn('block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform', settings.notificationsEnabled && 'translate-x-5')} />
          </button>
        </div>
      </Section>

      {isDemoMode ? (
        <Section title="Demo data">
          <p className="mb-3 text-sm text-ink-muted">
            DAYFLOW is running in local demo mode — everything is stored in your browser. Reset if things get messy.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              resetDemoData();
              pushToast({ message: 'Demo data reset.' });
            }}
          >
            Reset demo data
          </Button>
        </Section>
      ) : (
        <Section title="Account">
          <p className="mb-3 text-sm text-ink-muted">Signed in with a real DAYFLOW account. Your data is stored in your own database, not this browser.</p>
          <Button variant="secondary" onClick={() => signOut()}>Sign out</Button>
        </Section>
      )}
    </div>
  );
}
