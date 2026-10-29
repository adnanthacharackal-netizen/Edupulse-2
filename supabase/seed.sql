-- ============================================================================
-- EduPulse Student Hub - Seed Data
-- Run this in your Supabase SQL Editor after running schema.sql
-- ============================================================================

-- 1. Insert Initial Academic Courses
insert into public.courses (code, name, department, credits, faculty_name)
values
  ('CS 301', 'Database Management Systems', 'Computer Science', 4, 'Prof. Michael Chang'),
  ('CS 310', 'Data Structures & Algorithms', 'Computer Science', 4, 'Dr. Evelyn Reed'),
  ('MATH 240', 'Linear Algebra & Applications', 'Mathematics', 3, 'Prof. Sophia Bennett'),
  ('CS 335', 'Web Applications Engineering', 'Computer Science', 4, 'Sarah Jenkins, M.Sc.'),
  ('HUM 120', 'Technical Communication & Ethics', 'Humanities', 3, 'Dr. Robert Vance')
on conflict (code) do nothing;

-- 2. Insert Timetable Schedule Entries
insert into public.timetable_entries (course_code, course_name, day_of_week, time, room, instructor, type)
values
  ('CS 301', 'Database Management Systems', 'Monday', '09:00 AM - 10:15 AM', 'Science Hall 304', 'Prof. Michael Chang', 'Lecture'),
  ('MATH 240', 'Linear Algebra & Applications', 'Monday', '10:30 AM - 11:45 AM', 'Lecture Hall A-12', 'Prof. Sophia Bennett', 'Lecture'),
  ('CS 310', 'Data Structures & Algorithms', 'Monday', '01:30 PM - 03:00 PM', 'Computing Lab B', 'Dr. Evelyn Reed', 'Lab & Practical'),
  ('CS 301', 'Database Management Systems', 'Tuesday', '09:00 AM - 10:15 AM', 'Science Hall 304', 'Prof. Michael Chang', 'Lecture'),
  ('CS 310', 'Data Structures & Algorithms', 'Tuesday', '10:30 AM - 12:00 PM', 'Computing Lab B', 'Dr. Evelyn Reed', 'Lab & Practical'),
  ('MATH 240', 'Linear Algebra & Applications', 'Tuesday', '01:30 PM - 02:45 PM', 'Lecture Hall A-12', 'Prof. Sophia Bennett', 'Lecture'),
  ('CS 335', 'Web Applications Engineering', 'Tuesday', '03:15 PM - 04:45 PM', 'Innovation Center 102', 'Sarah Jenkins, M.Sc.', 'Workshop'),
  ('HUM 120', 'Technical Communication & Ethics', 'Wednesday', '10:00 AM - 11:30 AM', 'Humanities Block 201', 'Dr. Robert Vance', 'Seminar'),
  ('CS 335', 'Web Applications Engineering', 'Wednesday', '01:00 PM - 03:30 PM', 'Innovation Center 102', 'Sarah Jenkins, M.Sc.', 'Lab & Practical'),
  ('CS 301', 'Database Management Systems', 'Thursday', '09:00 AM - 10:15 AM', 'Science Hall 304', 'Prof. Michael Chang', 'Lecture'),
  ('CS 310', 'Data Structures & Algorithms', 'Thursday', '11:00 AM - 12:30 PM', 'Lecture Hall B-10', 'Dr. Evelyn Reed', 'Tutorial'),
  ('MATH 240', 'Linear Algebra & Applications', 'Thursday', '02:00 PM - 03:15 PM', 'Lecture Hall A-12', 'Prof. Sophia Bennett', 'Lecture'),
  ('CS 335', 'Web Applications Engineering', 'Friday', '09:30 AM - 11:00 AM', 'Innovation Center 102', 'Sarah Jenkins, M.Sc.', 'Workshop'),
  ('HUM 120', 'Technical Communication & Ethics', 'Friday', '01:30 PM - 03:00 PM', 'Humanities Block 201', 'Dr. Robert Vance', 'Seminar');

-- 3. Insert Initial Campus Announcements
insert into public.announcements (title, category, excerpt, content, is_urgent, author)
values
  (
    'Mid-Term Examination Schedule & Room Allocations Released',
    'Exams',
    'The official timetable for Mid-Term Exams (Fall 2026) is now published. Please verify your course codes and reporting halls.',
    'Mid-Term examinations will commence on October 26, 2026. Hall tickets will be issued through EduPulse by next Wednesday. All students must present their physical student ID cards upon entering exam centers. If you notice any overlapping schedules, submit an appeal immediately.',
    true,
    'Office of the Academic Registrar'
  ),
  (
    'Annual Tech Symposium & Hackathon Registrations Open',
    'Campus Life',
    'Join 48 hours of collaborative coding, AI workshops, and prize pools over $5,000. Team registrations close next Monday.',
    'The 2026 HackQuest invites teams of 2 to 4 students across all engineering branches. Tracks include Generative AI, Distributed Systems, and EdTech Innovation. Mentors from Google, Microsoft, and AWS will be on campus.',
    false,
    'Computer Science Student Society'
  ),
  (
    'Campus Library Extended Hours During Midterm Week',
    'Academic',
    'Starting this Monday, the Central Library and Quiet Study Pods will remain open 24/7. Student ID required for entry after 10:00 PM.',
    'To support students during exam preparation, the 3rd floor silent reading zones and group study rooms will operate without curfew. Complimentary coffee will be served at the ground floor cafe between midnight and 3:00 AM.',
    false,
    'University Central Library'
  ),
  (
    'Guest Speaker Session: Scaling Distributed Systems with AWS',
    'Career',
    'Principal Cloud Architect David Lin will hold an interactive Q&A session on cloud distributed systems in Auditorium 2.',
    'David Lin (Principal Architect, AWS) shares practical architecture patterns for high-throughput microservices, real-time message queues, and fault tolerance. Refreshments provided after the Q&A session.',
    false,
    'Career Development Center'
  );


-- 4. Sample Academic Calendar Events
insert into public.calendar_events (title, type, date, start_time, end_time, location, course_code, description, student_id)
select
  'CS 301: Midterm Exam Part I',
  'exam',
  '2026-11-04'::date,
  '10:00 AM',
  '11:30 AM',
  'Auditorium Hall B',
  'CS 301',
  'Covers relational algebra, SQL optimization, and indexing (Chapters 1-6).',
  id
from public.profiles
limit 1;
