-- AI Life & Growth OS — схема MVP (ТЗ v3.2, раздел «Архитектура и модель данных»).
-- Регион Supabase: EU. Время — UTC, часовой пояс — в profiles. Каждая таблица: user_id + RLS «только своё».

create extension if not exists pgcrypto;

-- ---------- типы ----------
create type goal_type        as enum ('project', 'state', 'result', 'obligation');
create type task_type        as enum ('step', 'habit', 'appointment', 'obligation', 'purchase');
create type task_size        as enum ('S', 'M', 'L');
create type task_status      as enum ('planned', 'done', 'waiting', 'cancelled');
create type milestone_status as enum ('active', 'achieved_otherwise', 'changed', 'cancelled');
create type habit_period     as enum ('day', 'week', 'month', 'by_appointment');
create type money_status     as enum ('confirmed', 'expected', 'hypothesis');
create type money_kind       as enum ('income', 'expense');
create type money_owner      as enum ('personal', 'project');
create type fin_category     as enum ('direct_income', 'potential_income', 'project_resources',
                                      'earning_potential', 'asset_management', 'loss_prevention',
                                      'non_financial', 'unknown');
create type pause_reason     as enum ('ill', 'vacation', 'external');

-- ---------- таблицы ----------
create table profiles (
  user_id        uuid primary key references auth.users on delete cascade,
  telegram_id    bigint unique,
  language       text not null default 'ru',
  timezone       text not null default 'Europe/London',
  base_currency  char(3) not null default 'EUR',
  morning_time   time not null default '08:30',
  review_weekday smallint not null default 7 check (review_weekday between 1 and 7),
  consent_at     timestamptz,
  created_at     timestamptz not null default now()
);

create table areas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  position   smallint not null default 0,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

create table goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  area_id      uuid references areas on delete set null,
  title        text not null,
  type         goal_type not null,
  start_date   date,
  deadline     date,
  target_value numeric,               -- для цели-результата, в базовой валюте
  category     fin_category not null default 'unknown',
  is_weekly_main boolean not null default false,
  archived_at  timestamptz,
  deleted_at   timestamptz,           -- корзина 30 дней
  created_at   timestamptz not null default now()
);

create table milestones (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  goal_id      uuid not null references goals on delete cascade,
  title        text not null,
  weight       numeric not null check (weight >= 0 and weight <= 1),
  status       milestone_status not null default 'active',
  close_reason text,
  position     smallint not null default 0,
  -- закрыть этап вручную без причины невозможно
  constraint close_needs_reason check (status = 'active' or length(trim(coalesce(close_reason, ''))) > 0)
);

create table habits (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users on delete cascade,
  goal_id  uuid not null references goals on delete cascade,
  title    text not null,
  norm     numeric not null check (norm >= 0),
  period   habit_period not null,
  rrule    text,                    -- RRULE для напоминаний
  weight   numeric not null default 1,
  active   boolean not null default true,
  ended_at date
);

create table tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  title         text not null,
  area_id       uuid references areas on delete set null,
  goal_id       uuid references goals on delete set null,       -- основная цель
  milestone_id  uuid references milestones on delete set null,
  habit_id      uuid references habits on delete set null,
  type          task_type not null default 'step',
  size          task_size not null default 'M',
  status        task_status not null default 'planned',
  due_at        timestamptz,
  done_at       timestamptz,
  extra_hours   numeric not null default 0,
  postponed     smallint not null default 0,
  waiting_for   text,
  source        text not null default 'web',                    -- web | bot_text | bot_voice | csv
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- v3.2: у дополнительной цели тоже есть этап
create table task_goals (
  task_id      uuid not null references tasks on delete cascade,
  goal_id      uuid not null references goals on delete cascade,
  milestone_id uuid references milestones on delete set null,
  user_id      uuid not null references auth.users on delete cascade,
  primary key (task_id, goal_id)
);

create table task_dependencies (
  task_id    uuid not null references tasks on delete cascade,
  depends_on uuid not null references tasks on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  primary key (task_id, depends_on),
  check (task_id <> depends_on)
);

create table check_ins (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users on delete cascade,
  day      date not null,
  habit_id uuid references habits on delete cascade,  -- null = только оценка энергии
  count    smallint not null default 1,
  energy   smallint check (energy between 1 and 5)
);

create table pauses (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users on delete cascade,
  habit_id uuid references habits on delete cascade,  -- null = все привычки
  start_day date not null,
  end_day   date not null check (end_day >= start_day),
  reason   pause_reason not null
);

create table money (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  goal_id     uuid references goals on delete set null,
  day         date not null,
  amount      numeric not null check (amount >= 0),
  currency    char(3) not null,
  rate_to_base numeric not null default 1,   -- курс на дату записи
  status      money_status not null,
  kind        money_kind not null,
  owner       money_owner not null default 'personal',
  note        text
);

create table money_tasks (
  money_id uuid not null references money on delete cascade,
  task_id  uuid not null references tasks on delete cascade,
  user_id  uuid not null references auth.users on delete cascade,
  primary key (money_id, task_id)
);

-- v3.2: вклад, зафиксированный в момент отметки
create table contributions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  task_id    uuid not null references tasks on delete cascade,
  goal_id    uuid not null references goals on delete cascade,
  delta      numeric not null,
  before_pct numeric not null,
  after_pct  numeric not null,
  at         timestamptz not null default now()
);

create table progress_snapshots (
  user_id  uuid not null references auth.users on delete cascade,
  goal_id  uuid not null references goals on delete cascade,
  day      date not null,
  plan_pct numeric,
  pace_pct numeric,
  regularity numeric,
  primary key (goal_id, day)
);

create table change_log (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  actor      text not null check (actor in ('user', 'ai', 'system')),
  entity     text not null,
  entity_id  uuid not null,
  before     jsonb,
  after      jsonb,
  undone_at  timestamptz,
  at         timestamptz not null default now()
);

create table ai_suggestions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  input       text not null,
  output      jsonb,
  confidence  numeric,
  zone        text check (zone in ('high', 'medium', 'low')),
  decision    text check (decision in ('applied', 'accepted', 'corrected', 'rejected', 'pending')),
  model       text,
  cost_usd    numeric,
  created_at  timestamptz not null default now()
);

-- v3.2: очередь напоминаний с повтором (pg_cron кладёт в pgmq, Edge Function отправляет)
create table reminders (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users on delete cascade,
  task_id   uuid references tasks on delete cascade,
  send_at   timestamptz not null,
  kind      text not null,          -- appointment_1d | appointment_2h | deadline_90d | deadline_30d | deadline_7d | morning | review
  attempts  smallint not null default 0,
  sent_at   timestamptz,
  failed_at timestamptz
);

create table bot_link_codes (
  code       text primary key,
  user_id    uuid not null references auth.users on delete cascade,
  expires_at timestamptz not null default now() + interval '10 minutes'
);

-- ---------- индексы ----------
create index on tasks (user_id, status, due_at);
create index on tasks (milestone_id);
create index on task_goals (milestone_id);
create index on check_ins (user_id, day);
create index on money (user_id, goal_id, status);
create index on reminders (send_at) where sent_at is null and failed_at is null;

-- ---------- RLS «только своё» ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','areas','goals','milestones','habits','tasks','task_goals','task_dependencies',
                           'check_ins','pauses','money','money_tasks','contributions','progress_snapshots',
                           'change_log','ai_suggestions','reminders','bot_link_codes']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy own_rows on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
