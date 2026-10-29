-- ============================================================================
-- EduPulse Student Hub - Complete Database Schema & Row Level Security (RLS)
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Enable pgcrypto extension for UUID generation if not already active
create extension if not exists "pgcrypto";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Table: public.profiles
-- Linked 1:1 with auth.users. Contains role ('student', 'staff', 'admin').
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'staff', 'admin')) default 'student',
  full_name text not null,
  student_id text unique,
  email text not null,
  avatar_url text,
  major text,
  department text,
  semester text,
  year text,
  gpa numeric(3,2) default 0.00,
  academic_advisor text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: public.courses
-- University catalog of academic subjects
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department text,
  credits integer not null default 3 check (credits > 0),
  faculty_name text,
  created_at timestamp with time zone default now()
);

-- Table: public.enrollments
-- Associates students with registered courses
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  semester text not null default 'Fall 2026',
  status text not null check (status in ('active', 'completed', 'dropped')) default 'active',
  enrolled_at timestamp with time zone default now(),
  unique (student_id, course_id, semester)
);

-- Table: public.attendance_records
-- Daily attendance logs. Private to each student; managed only by staff.
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  session_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'excused')),
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  unique (student_id, course_id, session_date)
);

-- Table: public.assignments
-- Academic tasks, quizzes, and project milestones published by staff
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  notes text,
  due_date timestamp with time zone not null,
  priority text not null check (priority in ('High', 'Medium', 'Low')) default 'Medium',
  points integer not null default 100 check (points > 0),
  submission_type text not null default 'File Upload (PDF/ZIP)',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Table: public.assignment_submissions
-- Student coursework submissions. Private to the submitting student and staff.
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_content text,
  status text not null check (status in ('submitted', 'graded', 'returned')) default 'submitted',
  grade numeric(5,2),
  feedback text,
  submitted_at timestamp with time zone default now(),
  unique (assignment_id, student_id)
);

-- Table: public.timetable_entries
-- Weekly timetable schedule entries for classes, labs, and workshops
create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  course_code text not null,
  course_name text not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  time text not null,
  room text not null,
  instructor text not null,
  type text not null check (type in ('Lecture', 'Lab & Practical', 'Tutorial', 'Workshop', 'Seminar')) default 'Lecture',
  created_at timestamp with time zone default now()
);

-- Table: public.announcements
-- Campus bulletins and notices published strictly by authorized staff
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Exams', 'Academic', 'Campus Life', 'Career', 'Facility')) default 'Academic',
  excerpt text not null,
  content text,
  is_urgent boolean not null default false,
  author text not null,
  published_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- Function to check whether the current caller has 'staff' or 'admin' role
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- Function to automatically create a public.profiles row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    student_id,
    avatar_url,
    major
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'student_id', 'STU-' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
    coalesce(new.raw_user_meta_data->>'major', 'B.S. Computer Science')
  );
  return new;
end;
$$;

-- Trigger to execute handle_new_user on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.announcements enable row level security;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- --- PROFILES POLICIES ---
-- 1. Anyone authenticated can read their own profile, staff can read all profiles
create policy "Read profiles policy"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_staff());

-- 2. Users can update their own profile (name, avatar, advisor), but role cannot be self-escalated
create policy "Update own profile policy"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_staff())
  with check (
    -- Non-staff users cannot change their role to staff/admin
    (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
    or public.is_staff()
  );

-- --- COURSES POLICIES ---
-- 1. All authenticated students and staff can view courses
create policy "All authenticated can view courses"
  on public.courses for select
  to authenticated
  using (true);

-- 2. Only staff can create, update or delete courses
create policy "Staff manage courses"
  on public.courses for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- ENROLLMENTS POLICIES ---
-- 1. Students can only see their own enrollments, staff can see all
create policy "View enrollments policy"
  on public.enrollments for select
  to authenticated
  using (student_id = auth.uid() or public.is_staff());

-- 2. Only staff can manage enrollments
create policy "Staff manage enrollments"
  on public.enrollments for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- ATTENDANCE RECORDS POLICIES ---
-- CRITICAL REQUIREMENT: Students can only view their own attendance records.
-- ONLY authorized staff can record or edit attendance.
create policy "Students view own attendance, staff view all"
  on public.attendance_records for select
  to authenticated
  using (student_id = auth.uid() or public.is_staff());

create policy "Staff insert attendance records"
  on public.attendance_records for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff update attendance records"
  on public.attendance_records for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "Staff delete attendance records"
  on public.attendance_records for delete
  to authenticated
  using (public.is_staff());

-- --- ASSIGNMENTS POLICIES ---
-- 1. All authenticated users can view assignments
create policy "All authenticated view assignments"
  on public.assignments for select
  to authenticated
  using (true);

-- 2. Only staff can create, edit, or delete assignments
create policy "Staff manage assignments"
  on public.assignments for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- ASSIGNMENT SUBMISSIONS POLICIES ---
-- CRITICAL REQUIREMENT: Students only see their own private submissions.
-- Staff can view all submissions for grading.
create policy "Students view own submissions, staff view all"
  on public.assignment_submissions for select
  to authenticated
  using (student_id = auth.uid() or public.is_staff());

-- Students can insert their own submissions
create policy "Students insert own submissions"
  on public.assignment_submissions for insert
  to authenticated
  with check (student_id = auth.uid());

-- Students can update their own submissions (or staff can grade them)
create policy "Students update own submission or staff grades"
  on public.assignment_submissions for update
  to authenticated
  using (student_id = auth.uid() or public.is_staff())
  with check (student_id = auth.uid() or public.is_staff());

-- --- TIMETABLE ENTRIES POLICIES ---
-- 1. All authenticated users can view timetable schedules
create policy "All authenticated view timetable"
  on public.timetable_entries for select
  to authenticated
  using (true);

-- 2. Only staff can manage timetable entries
create policy "Staff manage timetable"
  on public.timetable_entries for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- ANNOUNCEMENTS POLICIES ---
-- CRITICAL REQUIREMENT: Only authorized staff can publish announcements.
-- All authenticated students can read announcements.
create policy "All authenticated view announcements"
  on public.announcements for select
  to authenticated
  using (true);

create policy "Staff insert announcements"
  on public.announcements for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff update announcements"
  on public.announcements for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "Staff delete announcements"
  on public.announcements for delete
  to authenticated
  using (public.is_staff());


-- ============================================================================
-- 6. STUDENT PRODUCTIVITY MODULES (TASKS, NOTES, CALENDAR, REMINDERS, PREFERENCES)
-- ============================================================================

-- Table: public.tasks
-- Personal study tasks and daily to-do lists
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  course_code text not null default 'General',
  due_date date,
  priority text not null check (priority in ('Urgent', 'High', 'Medium', 'Low')) default 'Medium',
  completed boolean not null default false,
  category text not null check (category in ('Study', 'Homework', 'Project', 'Reading', 'Review', 'General')) default 'Study',
  created_at timestamp with time zone default now()
);

-- Table: public.notes
-- Subject-wise study notes and markdown cheat sheets
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_code text not null default 'General',
  title text not null,
  content text not null default '',
  tags text[] default array[]::text[],
  pinned boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: public.calendar_events
-- Academic events, study sessions, exam dates, and milestones
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null check (type in ('exam', 'assignment', 'class', 'study', 'reminder')) default 'study',
  date date not null,
  start_time text,
  end_time text,
  location text,
  course_code text,
  description text,
  created_at timestamp with time zone default now()
);

-- Table: public.custom_reminders
-- Standalone academic reminders and custom alarms
create table if not exists public.custom_reminders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Study',
  date date not null,
  time text not null,
  enabled boolean not null default true,
  sound boolean not null default true,
  repeat text not null check (repeat in ('Never', 'Daily', 'Weekly')) default 'Never',
  notes text,
  created_at timestamp with time zone default now()
);

-- Table: public.user_notification_preferences
-- Individual student notification and reminder preferences
create table if not exists public.user_notification_preferences (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  sound_enabled boolean not null default true,
  browser_notifications_enabled boolean not null default false,
  auto_overdue_alerts boolean not null default true,
  default_intervals text[] not null default array['1d', '2h', '30m', 'due']::text[],
  daily_digest_time text not null default '08:00',
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- 7. RLS POLICIES FOR PRODUCTIVITY MODULES
-- ============================================================================

alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.calendar_events enable row level security;
alter table public.custom_reminders enable row level security;
alter table public.user_notification_preferences enable row level security;

-- TASKS POLICIES
create policy "Students manage own tasks"
  on public.tasks for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- NOTES POLICIES
create policy "Students manage own notes"
  on public.notes for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- CALENDAR EVENTS POLICIES
create policy "Students manage own calendar events"
  on public.calendar_events for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- CUSTOM REMINDERS POLICIES
create policy "Students manage own custom reminders"
  on public.custom_reminders for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- NOTIFICATION PREFERENCES POLICIES
create policy "Students manage own notification preferences"
  on public.user_notification_preferences for all
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
