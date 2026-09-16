-- RABT (رَبْط) — Authentication & Instrumentation Profile Configuration Migration

-- 1. Enums
do $$ begin
  create type mushaf_layout as enum ('madinah_604', 'indopak_848');
exception
  when duplicate_object then null;
end $$;

-- 2. Update Profiles Table
alter table profiles
  add column if not exists mushaf_layout mushaf_layout default 'madinah_604',
  add column if not exists timezone text default 'UTC',
  add column if not exists day_cutoff_hour int default 3 check (day_cutoff_hour between 0 and 12),
  add column if not exists stale_warning_days int default 14,
  add column if not exists stale_critical_days int default 28,
  add column if not exists default_daily_revision_pages int default 5;

-- 3. Automatic Profile Creation on User Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, timezone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and re-create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table memorized_pages enable row level security;
alter table study_sessions enable row level security;
alter table session_pages enable row level security;

-- 5. Updated RLS Policies
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

drop policy if exists "Users manage own memorized pages" on memorized_pages;
create policy "Users manage own memorized pages"
  on memorized_pages for all using (auth.uid() = user_id);

drop policy if exists "Users manage own study sessions" on study_sessions;
create policy "Users manage own study sessions"
  on study_sessions for all using (auth.uid() = user_id);

drop policy if exists "Users manage own session pages" on session_pages;
create policy "Users manage own session pages"
  on session_pages for all using (
    exists (
      select 1 from study_sessions
      where study_sessions.id = session_pages.session_id
      and study_sessions.user_id = auth.uid()
    )
  );
