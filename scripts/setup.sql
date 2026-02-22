-- ============================================
-- PORTFOLIO DATABASE SETUP
-- Run this in Supabase Dashboard SQL Editor
-- https://app.supabase.com/project/_/sql/new
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. POSTS TABLE
-- ============================================
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  content text,
  image_url text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

drop policy if exists "Public can read published posts" on posts;
drop policy if exists "Admin can do everything on posts" on posts;

create policy "Public can read published posts"
  on posts for select
  using (published = true);

create policy "Admin can do everything on posts"
  on posts for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  link text,
  tech_stack text[],
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

drop policy if exists "Public can read all projects" on projects;
drop policy if exists "Admin can do everything on projects" on projects;

create policy "Public can read all projects"
  on projects for select
  using (true);

create policy "Admin can do everything on projects"
  on projects for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- ============================================
-- 3. PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text,
  headline text,
  bio text,
  avatar_url text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Public can read profiles" on profiles;
drop policy if exists "Admin can do everything on profiles" on profiles;

create policy "Public can read profiles"
  on profiles for select
  using (true);

create policy "Admin can do everything on profiles"
  on profiles for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- Initial Seed (if empty)
insert into profiles (full_name, headline, bio)
select 'Your Name', 'Fullstack Engineer', 'Building digital experiences...'
where not exists (select 1 from profiles);

-- ============================================
-- 4. WORK EXPERIENCES TABLE
-- ============================================
create table if not exists work_experiences (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  role text not null,
  description text,
  start_date date not null,
  end_date date,
  current boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table work_experiences enable row level security;

drop policy if exists "Public can read work_experiences" on work_experiences;
drop policy if exists "Admin can do everything on work_experiences" on work_experiences;

create policy "Public can read work_experiences"
  on work_experiences for select
  using (true);

create policy "Admin can do everything on work_experiences"
  on work_experiences for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- ============================================
-- 5. SITE CONFIG TABLE
-- ============================================
create table if not exists site_config (
  id uuid primary key default uuid_generate_v4(),
  site_name text default 'My Portfolio',
  site_description text,
  logo_text text,
  logo_image text,
  primary_color text default '#4f46e5',
  secondary_color text default '#ec4899',
  accent_color text default '#10b981',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table site_config enable row level security;

drop policy if exists "Public can read site_config" on site_config;
drop policy if exists "Admin can do everything on site_config" on site_config;

create policy "Public can read site_config"
  on site_config for select
  using (true);

create policy "Admin can do everything on site_config"
  on site_config for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- Initial Seed (if empty)
insert into site_config (site_name, logo_text)
select 'My Portfolio', 'PORTFOLIO'
where not exists (select 1 from site_config);

-- ============================================
-- 6. TECH STACKS TABLE
-- ============================================
create table if not exists tech_stacks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon_class text not null default 'devicon-devicon-plain',
  color text not null default '#61DAFB',
  category text not null default 'Other',
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tech_stacks enable row level security;

drop policy if exists "Public can read tech_stacks" on tech_stacks;
drop policy if exists "Admin can do everything on tech_stacks" on tech_stacks;

create policy "Public can read tech_stacks"
  on tech_stacks for select
  using (true);

create policy "Admin can do everything on tech_stacks"
  on tech_stacks for all
  using (auth.role() = 'service_role' or auth.uid() = '9a3239b3-494d-4d61-9ee1-81e337cc0015'::uuid);

-- Initial Seed for tech stacks (if empty)
insert into tech_stacks (name, icon_class, color, category, display_order)
select * from (values
  ('React', 'devicon-react-original colored', '#61DAFB', 'Frontend', 1),
  ('Next.js', 'devicon-nextjs-plain', '#000000', 'Frontend', 2),
  ('TypeScript', 'devicon-typescript-plain colored', '#3178C6', 'Language', 3),
  ('Node.js', 'devicon-nodejs-plain colored', '#339933', 'Backend', 4),
  ('PostgreSQL', 'devicon-postgresql-plain colored', '#4169E1', 'Database', 5),
  ('Tailwind CSS', 'devicon-tailwindcss-original colored', '#38BDF8', 'Frontend', 6)
) as v(name, icon_class, color, category, display_order)
where not exists (select 1 from tech_stacks);

-- ============================================
-- ✅ DONE!
-- ============================================
