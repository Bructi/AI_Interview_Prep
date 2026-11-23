-- ==============================================================================
-- Supabase Schema Setup for AI-Powered Interview Preparation & Learning Assistant
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/iynwnntruwtdozsgjjbc/sql/new
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables FIRST (so relation exists before policy definition)

-- Users Profile table
create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  profile_image_url text default '',
  title text default 'Senior Full-Stack Engineer',
  bio text default 'Passionate engineer specialized in scalable cloud architectures, high-performance distributed systems, and real-time APIs.',
  location text default 'San Francisco, CA',
  skills text[] default array['JavaScript', 'TypeScript', 'React', 'Node.js', 'Distributed Systems', 'Go', 'Supabase'],
  target_role text default 'Senior Full-Stack Engineer',
  experience_level text default 'Senior',
  github_url text default 'https://github.com',
  linkedin_url text default 'https://linkedin.com',
  portfolio_url text default '',
  theme_preference text default 'dark',
  streak_count integer default 7,
  xp integer default 450,
  level text default 'Senior Architect',
  sessions_completed integer default 4,
  questions_answered integer default 28,
  last_active_date timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessions table
create table if not exists public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  role text not null,
  experience text not null,
  topics_to_focus text[] default array[]::text[],
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Questions table
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  question text not null,
  answer text default '',
  is_pinned boolean default false,
  note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents table
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  original_name text not null,
  file_name text not null,
  file_path text not null,
  file_type text default 'pdf',
  file_size integer default 0,
  text_content text default '',
  summary text default '',
  page_count integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes table
create table if not exists public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flashcard Decks table
create table if not exists public.flashcard_decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  title text not null,
  cards jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quizzes table
create table if not exists public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  title text not null,
  questions jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS) on each table
alter table public.user_profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.questions enable row level security;
alter table public.documents enable row level security;
alter table public.notes enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.quizzes enable row level security;

-- 4. Policies (Safely drop and recreate now that tables exist)
drop policy if exists "Allow public access user_profiles" on public.user_profiles;
drop policy if exists "Allow public access sessions" on public.sessions;
drop policy if exists "Allow public access questions" on public.questions;
drop policy if exists "Allow public access documents" on public.documents;
drop policy if exists "Allow public access notes" on public.notes;
drop policy if exists "Allow public access flashcard_decks" on public.flashcard_decks;
drop policy if exists "Allow public access quizzes" on public.quizzes;

create policy "Allow public access user_profiles" on public.user_profiles for all using (true) with check (true);
create policy "Allow public access sessions" on public.sessions for all using (true) with check (true);
create policy "Allow public access questions" on public.questions for all using (true) with check (true);
create policy "Allow public access documents" on public.documents for all using (true) with check (true);
create policy "Allow public access notes" on public.notes for all using (true) with check (true);
create policy "Allow public access flashcard_decks" on public.flashcard_decks for all using (true) with check (true);
create policy "Allow public access quizzes" on public.quizzes for all using (true) with check (true);

-- 5. Grant Schema and Table permissions to API roles
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- 6. Storage Bucket for PDF & Document Uploads
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- Storage policies
drop policy if exists "Allow public uploads documents" on storage.objects;
drop policy if exists "Allow public reads documents" on storage.objects;
drop policy if exists "Allow public updates documents" on storage.objects;

create policy "Allow public uploads documents" on storage.objects for insert with check (bucket_id = 'documents');
create policy "Allow public reads documents" on storage.objects for select using (bucket_id = 'documents');
create policy "Allow public updates documents" on storage.objects for update using (bucket_id = 'documents');

-- 7. Force PostgREST to reload schema cache
notify pgrst, 'reload schema';
