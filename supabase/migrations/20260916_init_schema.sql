-- RABT (رَبْط) — Hifz Early-Warning Retention Engine Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  week_start_day int default 0, -- 0 = Sunday
  created_at timestamptz default now()
);

-- Memorized Pages Ledger
create table if not exists memorized_pages (
  user_id uuid references auth.users on delete cascade,
  page_number int check (page_number between 1 and 604),
  memorized_at timestamptz default now(),
  primary key (user_id, page_number)
);

-- Session Logs enum and table
do $$ begin
  create type session_type as enum ('memorize', 'revise', 'recite');
exception
  when duplicate_object then null;
end $$;

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type session_type not null,
  logged_at timestamptz default now(),
  notes text
);

-- Session Items (Relational Page Mapping)
create table if not exists session_pages (
  session_id uuid references study_sessions on delete cascade,
  page_number int check (page_number between 1 and 604),
  stumbled boolean default false,
  primary key (session_id, page_number)
);

-- Indexes for Fast Aggregation
create index if not exists idx_session_pages_page on session_pages(page_number);
create index if not exists idx_study_sessions_user_type_date
  on study_sessions(user_id, type, logged_at desc);

-- Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table memorized_pages enable row level security;
alter table study_sessions enable row level security;
alter table session_pages enable row level security;

-- RLS Policies for authenticated users
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own memorized pages" on memorized_pages for select using (auth.uid() = user_id);
create policy "Users can insert own memorized pages" on memorized_pages for insert with check (auth.uid() = user_id);
create policy "Users can delete own memorized pages" on memorized_pages for delete using (auth.uid() = user_id);

create policy "Users can view own sessions" on study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can delete own sessions" on study_sessions for delete using (auth.uid() = user_id);

create policy "Users can view own session pages" on session_pages for select using (
  exists (select 1 from study_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "Users can insert own session pages" on session_pages for insert with check (
  exists (select 1 from study_sessions s where s.id = session_id and s.user_id = auth.uid())
);
