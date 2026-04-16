-- MTR Pro Series — Supabase Database Schema
-- Run this in Supabase SQL Editor to initialize the database

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  display_name  text,
  avatar_url    text,
  role          text default 'learner',        -- learner | instructor | admin
  persona       text,                          -- newcomer | practitioner | specialist | expert
  company       text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ─── Lesson Progress ──────────────────────────────────────────────────────────
create table lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  lesson_id       text not null,               -- e.g. "LES-1.1.1"
  program_slug    text not null,
  track_slug      text not null,
  module_slug     text not null,
  lesson_slug     text not null,
  completed       boolean default false,
  video_watched   boolean default false,
  quiz_passed     boolean default false,
  quiz_score      integer,                     -- 0–100
  time_spent_sec  integer default 0,
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;
create policy "Users can manage own lesson progress" on lesson_progress
  for all using (auth.uid() = user_id);

-- ─── Module Progress ──────────────────────────────────────────────────────────
create table module_progress (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  module_id          text not null,             -- e.g. "MOD-1.1"
  program_slug       text not null,
  track_slug         text not null,
  module_slug        text not null,
  lessons_total      integer not null,
  lessons_completed  integer default 0,
  completed          boolean default false,
  completed_at       timestamptz,
  unique (user_id, module_id)
);

alter table module_progress enable row level security;
create policy "Users can manage own module progress" on module_progress
  for all using (auth.uid() = user_id);

-- ─── Track Progress ───────────────────────────────────────────────────────────
create table track_progress (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  track_id            text not null,            -- e.g. "TRK-1"
  program_slug        text not null,
  track_slug          text not null,
  modules_total       integer not null,
  modules_completed   integer default 0,
  lessons_total       integer not null,
  lessons_completed   integer default 0,
  percent_complete    integer default 0,
  completed           boolean default false,
  completed_at        timestamptz,
  unique (user_id, track_id)
);

alter table track_progress enable row level security;
create policy "Users can manage own track progress" on track_progress
  for all using (auth.uid() = user_id);

-- ─── Program Progress ─────────────────────────────────────────────────────────
create table program_progress (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  program_id          text not null,            -- e.g. "PROG-1"
  program_slug        text not null,
  tracks_total        integer not null,
  tracks_completed    integer default 0,
  percent_complete    integer default 0,
  completed           boolean default false,
  assessment_passed   boolean default false,
  completed_at        timestamptz,
  unique (user_id, program_id)
);

alter table program_progress enable row level security;
create policy "Users can manage own program progress" on program_progress
  for all using (auth.uid() = user_id);

-- ─── Assessment Attempts ──────────────────────────────────────────────────────
create table assessment_attempts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  assessment_id   text not null,               -- lesson_id or "PROG-1-CERT" etc.
  assessment_type text not null,               -- lesson_quiz | module | track_capstone | program_cert
  score           integer not null,            -- 0–100
  passed          boolean not null,
  answers         jsonb,                       -- array of {question_id, selected, correct}
  time_taken_sec  integer,
  attempt_number  integer default 1,
  attempted_at    timestamptz default now()
);

alter table assessment_attempts enable row level security;
create policy "Users can view own attempts" on assessment_attempts
  for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on assessment_attempts
  for insert with check (auth.uid() = user_id);

-- ─── Badge Awards ─────────────────────────────────────────────────────────────
create table badge_awards (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  badge_id        text not null,               -- e.g. "mtr-foundations"
  badge_title     text not null,
  badge_type      text not null,               -- program | master | specialization
  credential_id   text unique,                 -- e.g. "MTRP-2026-001234"
  awarded_at      timestamptz default now(),
  expires_at      timestamptz,                 -- awarded_at + 18 months
  renewed_at      timestamptz,
  open_badge_url  text,
  unique (user_id, badge_id)
);

alter table badge_awards enable row level security;
create policy "Users can view own badges" on badge_awards
  for select using (auth.uid() = user_id);

-- ─── Triggers: auto-create profile on signup ──────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Functions: progress rollup ───────────────────────────────────────────────
create or replace function update_module_progress(
  p_user_id uuid, p_module_id text
) returns void as $$
declare
  completed_count integer;
  total_count     integer;
begin
  select count(*) into total_count
  from lesson_progress
  where user_id = p_user_id and module_id = p_module_id;  -- simplified

  select count(*) into completed_count
  from lesson_progress
  where user_id = p_user_id and module_id = p_module_id and completed = true;

  update module_progress
  set lessons_completed = completed_count,
      completed = (completed_count >= total_count and total_count > 0),
      completed_at = case when completed_count >= total_count then now() else null end
  where user_id = p_user_id and module_id = p_module_id;
end;
$$ language plpgsql security definer;
