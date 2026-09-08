import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, LayoutGrid, Sparkles, Sun, Timer } from 'lucide-react';
import { Button } from '../components/ui/Button';

const STEPS = [
  { title: 'Capture', desc: 'Get everything out of your head and into one place, without deciding anything yet.' },
  { title: 'Plan', desc: 'Pick what actually matters today and see how much time you realistically have.' },
  { title: 'Focus', desc: 'Work on one thing at a time with a distraction-free timer built for depth.' },
  { title: 'Reflect', desc: 'Close the day on purpose — see what worked, and carry the rest forward.' },
];

const FEATURES = [
  { icon: Sun, title: 'Daily planning', desc: 'A single screen that tells you exactly what today is for.' },
  { icon: CalendarCheck, title: 'Smart scheduling', desc: 'Fit tasks around your calendar without overloading yourself.' },
  { icon: Timer, title: 'Focus mode', desc: 'One task, one timer, zero distractions.' },
  { icon: LayoutGrid, title: 'Projects', desc: 'Group related work and watch it move forward.' },
  { icon: Sparkles, title: 'Analytics', desc: 'Understand your patterns instead of just your to-do list.' },
  { icon: CheckCircle2, title: 'Reflection', desc: 'A calm shutdown ritual so unfinished work stops following you home.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-sunken text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 13.5 9.5 19 20 5" stroke="#2b7de9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[15px] font-bold tracking-tight">DAYFLOW</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink">Log in</Link>
          <Link to="/login">
            <Button variant="primary" size="sm">Start planning</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-14 pt-10 text-center sm:pt-16">
        <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
          Plan less. Do more. Finish your day with intention.
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          Plan your day.<br />Actually finish it.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">
          DAYFLOW helps you turn everything you need to do into a realistic plan you can actually follow.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button variant="primary" size="lg">Start planning</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">See how it works</Button>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-raised">
          <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-overloaded/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-caution/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-healthy/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-sunken p-4">
              <p className="text-xs text-ink-faint">Daily capacity</p>
              <p className="mt-1 text-lg font-semibold">78% planned</p>
              <div className="mt-2 h-2 rounded-full bg-border-subtle">
                <div className="h-2 w-[78%] rounded-full bg-healthy" />
              </div>
            </div>
            <div className="rounded-xl bg-surface-sunken p-4 sm:col-span-2">
              <p className="text-xs text-ink-faint">Today's priorities</p>
              <div className="mt-2 flex flex-col gap-1.5 text-sm">
                <span>◻ Finish database assignment · 🎓 University</span>
                <span>◻ Build GeePlays redesign · 💻 Development</span>
                <span>◻ Study networking · 🎓 University</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white">{i + 1}</span>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-soft">
              <f.icon className="h-5 w-5 text-accent-600" />
              <p className="mt-3 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14 text-center">
        <p className="text-xl font-medium italic text-ink-muted">
          "The first planner that made me feel realistic instead of behind."
        </p>
        <p className="mt-2 text-sm text-ink-faint">— an early DAYFLOW user</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h2 className="text-2xl font-semibold">Ready to plan a day you can actually finish?</h2>
        <Link to="/login" className="mt-5 inline-block">
          <Button variant="primary" size="lg">Start planning</Button>
        </Link>
      </section>

      <footer className="border-t border-border-subtle px-6 py-8 text-center text-sm text-ink-faint">
        © {new Date().getFullYear()} DAYFLOW. Built for sustainable productivity.
      </footer>
    </div>
  );
}
