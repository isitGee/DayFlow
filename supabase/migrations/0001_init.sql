-- DAYFLOW initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- profiles ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  working_hours_start time not null default '09:00',
  working_hours_end time not null default '18:00',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  planning_preference text not null default 'assisted' check (planning_preference in ('manual', 'assisted', 'automatic')),
  pomodoro_work_minutes int not null default 25,
  pomodoro_break_minutes int not null default 5,
  pomodoro_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- projects ------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default '📁',
  color text not null default '#2b7de9',
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists projects_user_id_idx on projects (user_id);

-- tasks -----------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references projects (id) on delete set null,
  goal_id uuid,
  title text not null,
  description text,
  status text not null default 'inbox' check (status in ('inbox', 'planned', 'scheduled', 'in_progress', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  estimated_minutes int not null default 30,
  actual_minutes int not null default 0,
  due_date date,
  scheduled_date date,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  tags text[] not null default '{}',
  notes text,
  is_priority_today boolean not null default false,
  priority_order int,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists tasks_user_id_idx on tasks (user_id);
create index if not exists tasks_scheduled_date_idx on tasks (scheduled_date);
create index if not exists tasks_project_id_idx on tasks (project_id);
create index if not exists tasks_status_idx on tasks (status);

-- subtasks ----------------------------------------------------------------
create table if not exists subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists subtasks_task_id_idx on subtasks (task_id);

-- calendar_events (external, synced) ---------------------------------------
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  source text not null default 'external' check (source in ('external', 'dayflow')),
  location text,
  created_at timestamptz not null default now()
);
create index if not exists calendar_events_user_id_idx on calendar_events (user_id);

-- scheduled_blocks (materialized schedule, separate from task due/scheduled fields
-- to support multi-session tasks and manual timeline adjustments) ------------
create table if not exists scheduled_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references tasks (id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists scheduled_blocks_user_id_idx on scheduled_blocks (user_id);

-- daily_plans ---------------------------------------------------------------
create table if not exists daily_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  available_minutes int not null default 480,
  planned_minutes int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- daily_reviews ---------------------------------------------------------------
create table if not exists daily_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  biggest_win text,
  what_got_in_the_way text,
  move_to_tomorrow text,
  planned_minutes int not null default 0,
  actual_minutes int not null default 0,
  completed_count int not null default 0,
  total_count int not null default 0,
  focus_minutes int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- weekly_goals ---------------------------------------------------------------
create table if not exists weekly_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  period text not null default 'weekly' check (period in ('daily', 'weekly', 'monthly')),
  target_date date not null,
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);
create index if not exists weekly_goals_user_id_idx on weekly_goals (user_id);

-- time_entries (focus session log) -------------------------------------------
create table if not exists time_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references tasks (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  minutes int,
  created_at timestamptz not null default now()
);
create index if not exists time_entries_user_id_idx on time_entries (user_id);
create index if not exists time_entries_task_id_idx on time_entries (task_id);

-- notifications ---------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('upcoming_task', 'task_starting', 'break', 'daily_planning_reminder', 'end_of_day_review', 'overdue_task')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_id_idx on notifications (user_id);

-- settings (freeform key/value overrides, e.g. notification toggles) --------
create table if not exists settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security ----------------------------------------------------------
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table calendar_events enable row level security;
alter table scheduled_blocks enable row level security;
alter table daily_plans enable row level security;
alter table daily_reviews enable row level security;
alter table weekly_goals enable row level security;
alter table time_entries enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;

create policy "Individuals can manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Individuals can manage their own projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage subtasks of their own tasks" on subtasks
  for all using (exists (select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()))
  with check (exists (select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()));

create policy "Individuals can manage their own calendar events" on calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own scheduled blocks" on scheduled_blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own daily plans" on daily_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own daily reviews" on daily_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own goals" on weekly_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own time entries" on time_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own notifications" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Individuals can manage their own settings" on settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
