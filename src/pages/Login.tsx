import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, signInDemo, isDemoMode, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'signup') {
      await signUp(email, password, name || email.split('@')[0]);
      setSubmitting(false);
      navigate('/onboarding');
      return;
    }
    await signIn(email, password);
    setSubmitting(false);
    navigate('/app/today');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-raised p-7 shadow-raised">
        <div className="mb-6 flex items-center justify-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 13.5 9.5 19 20 5" stroke="#2b7de9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-ink">DAYFLOW</span>
        </div>

        {isDemoMode ? (
          <div className="mb-5 rounded-lg bg-accent-50 px-3 py-2.5 text-xs text-accent-800 dark:bg-accent-900/20 dark:text-accent-200">
            Running in local demo mode — no Supabase project is configured, so any sign-in below just gets you into the app.
          </div>
        ) : (
          <div className="mb-4 flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${mode === 'signin' ? 'bg-accent-600 text-white' : 'text-ink-muted'}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${mode === 'signup' ? 'bg-accent-600 text-white' : 'text-ink-muted'}`}
            >
              Sign up
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-overloaded/10 px-3 py-2 text-xs text-overloaded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isDemoMode && mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
            />
          </div>
          <Button type="submit" variant="primary" className="mt-1 w-full justify-center" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Continue'}
          </Button>
        </form>

        {!isDemoMode && (
          <Button
            variant="secondary"
            className="mt-2 w-full justify-center"
            onClick={async () => {
              await signInWithGoogle();
            }}
          >
            Continue with Google
          </Button>
        )}

        <div className="my-4 flex items-center gap-2 text-xs text-ink-faint">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={() => {
            signInDemo();
            navigate('/onboarding');
          }}
        >
          Continue as demo user
        </Button>

        <p className="mt-5 text-center text-xs text-ink-faint">
          <Link to="/" className="hover:text-ink-muted">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
