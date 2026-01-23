-- Clear existing data
TRUNCATE TABLE users, instructors, faculty_advisors, students, slots, courses, student_courses CASCADE;

-- Users
INSERT INTO users (email, role, is_active) VALUES
('2023csb1106+s1@iitrpr.ac.in', 'STUDENT', true),
('2023csb1106+i1@iitrpr.ac.in', 'INSTRUCTOR', true),
('2023csb1106+i2@iitrpr.ac.in', 'INSTRUCTOR', true),
('2023csb1106+i3@iitrpr.ac.in', 'INSTRUCTOR', true),
('2023csb1106+a1@iitrpr.ac.in', 'ADVISOR', true),
('2023csb1106+admin@iitrpr.ac.in', 'ADMIN', true),
('2023csb1106+s2@iitrpr.ac.in', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;

-- Instructors
INSERT INTO instructors (instructor_id, email, dept) VALUES
('i1', '2023csb1106+i1@iitrpr.ac.in', 'CSE'),
('i2', '2023csb1106+i2@iitrpr.ac.in', 'CSE'),
('i3', '2023csb1106+i3@iitrpr.ac.in', 'Physics'),
('a1', '2023csb1106+a1@iitrpr.ac.in', 'ME')
ON CONFLICT (instructor_id) DO NOTHING;

-- Faculty Advisors
INSERT INTO faculty_advisors (email, ins_id) VALUES
('2023csb1106+a1@iitrpr.ac.in', 'a1')
ON CONFLICT (email) DO NOTHING;

-- Students
INSERT INTO students (email, entry_no, fa_id, batch, "group") VALUES
('2023csb1106+s1@iitrpr.ac.in', '2023CSB1103', 'a1', 2023, 'A'),
('2023csb1106+s2@iitrpr.ac.in', '2023CSB1112', 'a1', 2023, 'B')
ON CONFLICT (email) DO NOTHING;

-- Slots
INSERT INTO slots (slot_id, timings) VALUES
(1, 'Mon, Wed 10:00 AM'),
(2, 'Tue, Thu 11:30 AM'),
(3, 'Mon, Wed 02:00 PM'),
(4, 'Fri 09:00 AM')
ON CONFLICT (slot_id) DO NOTHING;

-- Courses
INSERT INTO courses (course_id, title, credits, slot_id, instructor_id, type, ltp, status) VALUES
('CS101', 'Intro to Programming', 4, 1, 'i1', 'Core', '3-0-2', 'Offered'),
('CS201', 'Data Structures', 4, 2, 'i2', 'Core', '3-1-0', 'Offered'),
('MA102', 'Linear Algebra', 3, 3, 'i1', 'Core', '3-0-0', 'Offered'),
('PH101', 'Physics I', 4, 4, 'i3', 'Core', '3-0-2', 'Offered')
ON CONFLICT (course_id) DO NOTHING;

-- Student Courses (Requests/Enrollments)
INSERT INTO student_courses (student_email, course_id, semester, status) VALUES
('2023csb1106+s1@iitrpr.ac.in', 'CS201', '2024-II', 'Pending_Instructor'),
('2023csb1106+s2@iitrpr.ac.in', 'CS101', '2024-II', 'Pending_Advisor'),
('2023csb1106+s1@iitrpr.ac.in', 'PH101', '2024-II', 'Approved')
ON CONFLICT (student_email, course_id, semester) DO UPDATE SET status = EXCLUDED.status;

-- Academic Sessions
INSERT INTO academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES
('2025-II', 'current session', '2025-12-04', '2026-05-30', true, 'regular'),
('2025-S', 'upcoming session (summer)', '2026-06-01', '2026-07-31', false, 'summer'),
('2026-I', 'next session (regular)', '2026-08-01', '2026-12-03', false, 'regular')
ON CONFLICT (session_id) DO NOTHING;

-- Departments
INSERT INTO departments (dept_code, name) VALUES
('CSE', 'Computer Science and Engineering'),
('EE', 'Electrical Engineering'),
('ME', 'Mechanical Engineering'),
('CE', 'Civil Engineering'),
('MATH', 'Mathematics'),
('PHY', 'Physics'),
('HSS', 'Humanities and Social Sciences'),
('CHEM', 'Chemistry')
ON CONFLICT (dept_code) DO NOTHING;

-- Course Offerings (sample offerings for current session)
INSERT INTO course_offerings (course_id, session_id, offering_dept, section, status, enrolment_count) VALUES
('CS101', '2025-II', 'CSE', 'A', 'Enrolling', 45),
('CS201', '2025-II', 'CSE', 'A', 'Enrolling', 30),
('MA102', '2025-II', 'MATH', 'A', 'Offered', 120),
('PH101', '2025-II', 'PHY', 'A', 'Enrolling', 85)
ON CONFLICT (course_id, session_id, section) DO NOTHING;

-- Course Instructors (link offerings to instructors)
INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
SELECT co.id, 'i1', true FROM course_offerings co WHERE co.course_id = 'CS101' AND co.session_id = '2025-II'
ON CONFLICT (offering_id, instructor_id) DO NOTHING;

INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
SELECT co.id, 'i2', true FROM course_offerings co WHERE co.course_id = 'CS201' AND co.session_id = '2025-II'
ON CONFLICT (offering_id, instructor_id) DO NOTHING;

INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
SELECT co.id, 'i1', false FROM course_offerings co WHERE co.course_id = 'CS201' AND co.session_id = '2025-II'
ON CONFLICT (offering_id, instructor_id) DO NOTHING;

INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
SELECT co.id, 'i3', true FROM course_offerings co WHERE co.course_id = 'PH101' AND co.session_id = '2025-II'
ON CONFLICT (offering_id, instructor_id) DO NOTHING;

-- Crediting Categorization (sample)
INSERT INTO crediting_categorization (offering_id, degree, department, category, entry_years)
SELECT co.id, 'B.Tech', 'CSE', 'Programme Core', '2023,2024' 
FROM course_offerings co WHERE co.course_id = 'CS201' AND co.session_id = '2025-II'
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADDITIONAL SEED DATA FOR COMPLETE FUNCTIONALITY
-- =====================================================

-- Update slots with structured timing data (for timetable generation)
UPDATE slots SET day_of_week = 'Mon,Wed', start_time = '10:00', end_time = '11:00' WHERE slot_id = 1;
UPDATE slots SET day_of_week = 'Tue,Thu', start_time = '11:30', end_time = '12:30' WHERE slot_id = 2;
UPDATE slots SET day_of_week = 'Mon,Wed', start_time = '14:00', end_time = '15:00' WHERE slot_id = 3;
UPDATE slots SET day_of_week = 'Fri', start_time = '09:00', end_time = '10:00' WHERE slot_id = 4;

-- Add more slots for variety
INSERT INTO slots (slot_id, timings, day_of_week, start_time, end_time) VALUES
(5, 'Tue, Thu 02:00 PM', 'Tue,Thu', '14:00', '15:00'),
(6, 'Mon, Wed, Fri 09:00 AM', 'Mon,Wed,Fri', '09:00', '10:00'),
(7, 'Tue, Thu 09:00 AM', 'Tue,Thu', '09:00', '10:30'),
(8, 'Wed, Fri 03:00 PM', 'Wed,Fri', '15:00', '16:00')
ON CONFLICT (slot_id) DO NOTHING;

-- Update courses with capacity and classroom
UPDATE courses SET capacity = 60, classroom = 'LT-1' WHERE course_id = 'CS101';
UPDATE courses SET capacity = 50, classroom = 'LT-2' WHERE course_id = 'CS201';
UPDATE courses SET capacity = 150, classroom = 'LT-3' WHERE course_id = 'MA102';
UPDATE courses SET capacity = 80, classroom = 'LT-4' WHERE course_id = 'PH101';

-- Add more courses for richer testing
INSERT INTO courses (course_id, title, credits, slot_id, instructor_id, type, ltp, status, capacity, classroom) VALUES
('CS301', 'Database Systems', 4, 5, 'i2', 'Core', '3-0-2', 'Offered', 45, 'LT-5'),
('CS302', 'Operating Systems', 4, 6, 'i1', 'Core', '3-0-2', 'Offered', 50, 'LT-6'),
('EE101', 'Basic Electronics', 3, 7, 'i3', 'Elective', '3-0-0', 'Offered', 40, 'LT-7'),
('MA201', 'Probability & Statistics', 3, 8, 'i1', 'Core', '3-1-0', 'Offered', 120, 'LT-3')
ON CONFLICT (course_id) DO NOTHING;

-- Add grades to existing approved enrollment
UPDATE student_courses SET grade = 'A', grade_points = 10.0, credits_earned = 4, status = 'Completed'
WHERE student_email = '2023csb1106+s1@iitrpr.ac.in' AND course_id = 'PH101';

-- Add more enrollment history with grades (completed courses from previous semesters)
INSERT INTO student_courses (student_email, course_id, semester, status, grade, grade_points, credits_earned) VALUES
-- Student 1 - Previous semester completed courses
('2023csb1106+s1@iitrpr.ac.in', 'CS101', '2024-I', 'Completed', 'A+', 10.0, 4),
('2023csb1106+s1@iitrpr.ac.in', 'MA102', '2024-I', 'Completed', 'A', 10.0, 3),
('2023csb1106+s1@iitrpr.ac.in', 'EE101', '2024-I', 'Completed', 'B+', 8.0, 3),
-- Student 2 - Previous semester completed courses
('2023csb1106+s2@iitrpr.ac.in', 'CS101', '2024-I', 'Completed', 'B', 7.0, 4),
('2023csb1106+s2@iitrpr.ac.in', 'MA102', '2024-I', 'Completed', 'A', 10.0, 3),
('2023csb1106+s2@iitrpr.ac.in', 'PH101', '2024-I', 'Completed', 'A+', 10.0, 4)
ON CONFLICT (student_email, course_id, semester) DO UPDATE SET 
  status = EXCLUDED.status, 
  grade = EXCLUDED.grade, 
  grade_points = EXCLUDED.grade_points,
  credits_earned = EXCLUDED.credits_earned;

-- Add current semester enrollments
INSERT INTO student_courses (student_email, course_id, semester, status) VALUES
('2023csb1106+s1@iitrpr.ac.in', 'CS301', '2025-II', 'Approved'),
('2023csb1106+s1@iitrpr.ac.in', 'CS302', '2025-II', 'Approved'),
('2023csb1106+s2@iitrpr.ac.in', 'CS201', '2025-II', 'Approved'),
('2023csb1106+s2@iitrpr.ac.in', 'MA201', '2025-II', 'Pending_Instructor')
ON CONFLICT (student_email, course_id, semester) DO NOTHING;

-- Student Records (semester summaries for CGPA calculation)
INSERT INTO student_records (student_email, semester, sgpa, credits_completed) VALUES
('2023csb1106+s1@iitrpr.ac.in', '2024-I', 9.40, 10),
('2023csb1106+s1@iitrpr.ac.in', '2024-II', 10.00, 4),
('2023csb1106+s2@iitrpr.ac.in', '2024-I', 8.82, 11)
ON CONFLICT (student_email, semester) DO UPDATE SET 
  sgpa = EXCLUDED.sgpa, 
  credits_completed = EXCLUDED.credits_completed;

-- Add crediting for more courses
INSERT INTO crediting_categorization (offering_id, degree, department, category, entry_years)
SELECT co.id, 'B.Tech', 'CSE', 'Programme Core', '2023,2024' 
FROM course_offerings co WHERE co.course_id = 'CS101' AND co.session_id = '2025-II'
ON CONFLICT DO NOTHING;

INSERT INTO crediting_categorization (offering_id, degree, department, category, entry_years)
SELECT co.id, 'B.Tech', 'CSE', 'Programme Core', '2023,2024' 
FROM course_offerings co WHERE co.course_id = 'MA102' AND co.session_id = '2025-II'
ON CONFLICT DO NOTHING;

INSERT INTO crediting_categorization (offering_id, degree, department, category, entry_years)
SELECT co.id, 'B.Tech', 'PHY', 'Programme Core', '2023,2024' 
FROM course_offerings co WHERE co.course_id = 'PH101' AND co.session_id = '2025-II'
ON CONFLICT DO NOTHING;

