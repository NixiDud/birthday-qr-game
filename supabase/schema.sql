-- NELAID ŠO VĒL, KAMĒR NEESAM GATAVI.
-- Tas ir drafts nākamajam solim.

create table if not exists players (
  id uuid primary key,
  name text not null,
  secret_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists task_attempts (
  id bigint generated always as identity primary key,
  player_id uuid not null references players(id) on delete cascade,
  task_code text not null check (task_code in ('QR1','QR2','QR3','QR4','QR5','QR6')),
  elapsed_seconds integer,
  bonus_seconds integer default 0,
  answer_text text,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  unique (player_id, task_code)
);

create table if not exists secret_code_pool (
  id bigint generated always as identity primary key,
  code text not null unique,
  leading_digit integer not null,
  order_index integer not null unique,
  is_active boolean not null default true
);
