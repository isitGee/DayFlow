# DAYFLOW

**Plan less. Do more. Finish your day with intention.**

DAYFLOW is a daily planning and focus app for people juggling school, work,
side projects, and everything in between. Instead of an endless to-do list,
it helps you choose what matters, build a realistic plan around the time you
actually have, work on one thing at a time, and reflect on how the day went.

Lifecycle: **Capture → Plan → Schedule → Focus → Complete → Reflect**

## Features

- **Today page** — greeting, live daily capacity meter (green/yellow/red),
  today's top 3 priorities (drag to reorder, or drag directly onto the
  timeline to schedule), and a vertical timeline with a live "now"
  indicator, drag-to-reschedule (including across days in Calendar view),
  and resize.
- **Quick add** with a lightweight natural-language parser
  (`"Study networking for two hours tomorrow morning"`) — no AI key required.
- **Focus mode** — distraction-free full-screen timer with pause/resume/add
  time/complete, plus a real Pomodoro mode (auto-alternating work/break
  phases with toast notifications when Settings → Pomodoro is enabled).
- **Inbox** — capture now, organize later, with a one-click "Plan my inbox".
- **Calendar** — Day / 3-Day / Week views built on the same timeline engine;
  drag a task from one day's column to another to reschedule it.
- **Projects & Goals** — progress bars, task rollups, daily/weekly/monthly goals.
- **Analytics** — focus time, completion rate, planned-vs-actual, and project
  distribution charts with a few plain-language insights.
- **End-of-day shutdown & review** — see what's done, decide what moves to
  tomorrow, and answer three short reflection prompts.
- **Notifications** — upcoming/starting/overdue task alerts (in-app feed +
  optional real browser notifications), toggled in Settings.
- **Command palette** (`⌘K` / `Ctrl+K`), keyboard shortcuts (`N`, `T`, `I`,
  `C`, `G`), light/dark theme, and a fully responsive mobile layout with
  bottom nav + floating quick-capture.
- **Full onboarding** — welcome → focus areas → working hours → planning
  preference → first task → live preview of your first generated plan.
- **Demo mode by default** — the whole app works with realistic sample data
  and browser-local storage, no backend required. Optionally connect a real
  Supabase project (auth + Postgres) — see below.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS (custom design tokens, class-based dark mode)
- Zustand (with `persist` for local/demo storage)
- React Router
- date-fns
- Recharts (analytics)
- lucide-react (icons)
- Supabase (auth + Postgres) — schema included, optional

## Getting started

```bash
npm install
npm run dev
```

The app runs immediately in **local demo mode**: everything is generated
from realistic sample data and stored in `localStorage` via Zustand. No
environment variables are required to explore the product.

## Environment variables

Copy `.env.example` to `.env` and fill in values only if you want to connect
a real backend:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AI_PROVIDER=
```

- Leaving `VITE_SUPABASE_URL` empty keeps the app in demo mode
  (`src/hooks/useAuth.tsx` checks this).
- Leaving `VITE_AI_PROVIDER` empty keeps `src/services/aiService.ts` on its
  local, deterministic implementation (natural language parsing, priority
  suggestions, schedule suggestions, task breakdowns, day summaries).

## Supabase setup (optional)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or via
   `supabase db push`). It creates `profiles`, `projects`, `tasks`,
   `subtasks`, `calendar_events`, `scheduled_blocks`, `daily_plans`,
   `daily_reviews`, `weekly_goals`, `time_entries`, `notifications`, and
   `settings`, all with Row Level Security scoped to `auth.uid()`.
3. Add your project URL and anon key to `.env`.
4. That's it — `src/lib/supabaseClient.ts` detects the env vars and switches
   the app out of demo mode automatically:
   - `src/hooks/useAuth.tsx` starts using real email/password + Google OAuth
     via `src/services/authService.ts` instead of the localStorage stub.
   - `src/store/taskStore.ts` loads tasks/projects from Postgres on sign-in
     (`loadRemote`) and mirrors every local mutation to
     `src/services/taskService.ts` in the background, so the UI never waits
     on the network and still works offline-first.
   - Goals, calendar events, daily reviews, and notifications are modeled in
     the schema but still read/write local state only — wiring them up means
     adding the equivalent fetch/mirror functions to their respective
     stores/services following the same pattern as `taskStore`.

## Development commands

```bash
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint      # lint the project
```

## Architecture

```
src/
  components/
    ui/          Button, Modal, Badge, Progress, EmptyState, Toast
    layout/      Sidebar, TopBar, mobile nav, AppLayout
    tasks/       TaskCard, QuickAddModal, TaskDetailModal
    planner/     DailyCapacity, PrioritiesList, Timeline, FocusMode, DailyReviewModal
  pages/         Landing, Login, Onboarding, Today, Inbox, Calendar, Projects,
                 ProjectDetail, Goals, Analytics, Settings
  services/      aiService, scheduleService, notificationService (pure/local,
                 provider-agnostic — swap the implementation, not the callers)
  store/         taskStore, uiStore, plannerStore (Zustand, persisted)
  hooks/         useAuth, useTheme, useKeyboardShortcuts
  lib/           utils, demoData, nlpParser, analyticsDemo
  types/         shared TypeScript types
supabase/
  migrations/    SQL schema + RLS policies
```

The scheduling and AI logic is intentionally decoupled from the UI:
`scheduleService.ts` is pure functions (workload math, overload detection,
"what to move" suggestions) and `aiService.ts` exposes a small
`AIServiceProvider` interface with a local mock implementation. Both can be
extended or swapped without changing any component.

## Roadmap

- Calendar events (`calendar_events`) aren't synced to Supabase yet — same
  pattern as `taskStore`/`goalStore` would apply
- Notifications only fire while the tab is open; a service worker would let
  them fire in the background
- Multi-session scheduling for large tasks
- Recurring tasks and recurring goals
- A real AI provider behind `AIServiceProvider` (schedule generation, task
  breakdown, natural-language parsing with actual language understanding)
- More automated tests, including component-level coverage for Focus Mode's
  Pomodoro phase transitions

## Product philosophy

A productive day isn't about fitting as many tasks as possible into a
schedule — it's about choosing what matters and building a realistic plan
around the time you actually have. DAYFLOW optimizes for sustainable
productivity: breaks, buffer time, and a clean shutdown are treated as
first-class parts of the product, not afterthoughts.
