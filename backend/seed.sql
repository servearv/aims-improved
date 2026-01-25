-- Clear existing data
TRUNCATE TABLE users, instructors, faculty_advisors, students, slots, courses, student_courses, course_offerings CASCADE;

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
('i2', '2023csb1106+i2@iitrpr.ac.in', 'EE'),
('i3', '2023csb1106+i3@iitrpr.ac.in', 'ME'),
('a1', '2023csb1106+a1@iitrpr.ac.in', 'CSE')
ON CONFLICT (instructor_id) DO NOTHING;

-- Faculty Advisors
INSERT INTO faculty_advisors (email, ins_id) VALUES
('2023csb1106+a1@iitrpr.ac.in', 'a1')
ON CONFLICT (email) DO NOTHING;

-- Students
INSERT INTO students (email, entry_no, fa_id, batch, "group") VALUES
('2023csb1106+s1@iitrpr.ac.in', '2023CSB1106', 'a1', 2023, 'A'),
('2023csb1106+s2@iitrpr.ac.in', '2023CSB1112', 'a1', 2023, 'B')
ON CONFLICT (email) DO NOTHING;

-- Slots (A-F)
-- Schema uses slot_id SERIAL, so we typically can't force text IDs easily without changing schema.
-- HOWEVER, we can just insert them and know their IDs if we reset sequences, OR distinct them by 'name' if schema allows.
-- Schema: slot_id (int), timings (varchar).
-- I'll use IDs 1-6 for A-F and put the details in 'timings' or add a description.
-- Actually the user code "Slot A" implies a name.
-- Let's check schema again: "timings VARCHAR(100)".
-- I will put "Slot A: Mon 9-10..." in timings. 
-- Wait, the logic requires strict slot checking. I should probably add a logic mapping slot_id to "A", "B" etc.
-- But for now I'll just insert them in order so 1=A, 2=B, etc.
INSERT INTO slots (slot_id, timings, day_of_week) VALUES
(1, 'Slot A', 'Mon,Wed,Thu'), -- A
(2, 'Slot B', 'Mon,Wed,Thu'), -- B
(3, 'Slot C', 'Mon,Wed,Thu'), -- C
(4, 'Slot D', 'Unknown'),       -- D
(5, 'Slot E', 'Unknown'),       -- E
(6, 'Slot F', 'Unknown')        -- F
ON CONFLICT (slot_id) DO UPDATE SET timings = EXCLUDED.timings;

-- Departments
INSERT INTO departments (dept_code, name) VALUES
('CSE', 'Computer Science and Engineering'),
('EE', 'Electrical Engineering'),
('ME', 'Mechanical Engineering')
ON CONFLICT (dept_code) DO NOTHING;

-- Courses (Real Data)
-- Format: L-T-P-S-C. Schema has ltp (varchar) and credits (int).
-- I will store full format in 'ltp' column like '3-1-2-6-4'.
-- Slot mapping: The user associates courses with slots via catalog. Schema has course.slot_id.
-- I'll map A=1, B=2, C=3, D=4, E=5, F=6.

INSERT INTO courses (course_id, title, credits, slot_id, instructor_id, ltp, status) VALUES
-- CSE
('CS201', 'Data Structures', 4, 1, 'i1', '3-1-2-6-4', 'Offered'),
('CS202', 'Analysis and Design of Algorithms', 3, 2, 'i1', '3-1-0-5-3', 'Offered'),
('CS203', 'Digital Logic Design', 4, 3, 'i1', '3-1-2-6-4', 'Offered'),
('CS301', 'Database Management Systems', 4, 4, 'i1', '3-0-2-7-4', 'Offered'),
('CS303', 'Operating Systems', 4, 5, 'i1', '3-0-2-7-4', 'Offered'),

-- EE
('EE201', 'Signals and Systems', 3, 2, 'i2', '3-1-0-5-3', 'Offered'),
('EE203', 'Digital Circuits', 3, 3, 'i2', '3-1-0-5-3', 'Offered'),
('EE205', 'Electromechanics', 3, 1, 'i2', '3-1-0-5-3', 'Offered'),
('EE207', 'Control Engineering', 3, 4, 'i2', '3-1-0-5-3', 'Offered'),
('EE301', 'Analog Circuits', 3, 5, 'i2', '3-1-0-5-3', 'Offered'),

-- ME
('MEL101', 'Continuum Mechanics', 4, 3, 'i3', '3-1-0-8-4', 'Offered'),
('MEL201', 'Fluid Mechanics', 4, 1, 'i3', '3-1-0-8-4', 'Offered'),
('MEL202', 'Manufacturing with Metallic Materials', 3, 2, 'i3', '3-0-0-6-3', 'Offered'),
('MEL301', 'Heat and Mass Transfer', 4, 5, 'i3', '3-1-2-6-4', 'Offered'),
('MEL302', 'Manufacturing Processes', 4, 4, 'i3', '3-0-2-7-4', 'Offered')
ON CONFLICT (course_id) DO UPDATE SET 
    title = EXCLUDED.title, 
    ltp = EXCLUDED.ltp, 
    slot_id = EXCLUDED.slot_id, 
    credits = EXCLUDED.credits;

-- Current Academic Session
INSERT INTO academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES
('2025-II', 'Current Session', '2025-01-01', '2025-05-30', true, 'regular')
ON CONFLICT (session_id) DO NOTHING;

-- Offerings (Map all courses to current session so they are visible/approverd)
-- Status: OFFERED (Approved)
INSERT INTO course_offerings (course_id, session_id, offering_dept, section, slot_id, status) VALUES
('CS201', '2025-II', 'CSE', 'A', 1, 'Offered'),
('CS202', '2025-II', 'CSE', 'A', 2, 'Offered'),
('CS203', '2025-II', 'CSE', 'A', 3, 'Offered'),
('CS301', '2025-II', 'CSE', 'A', 4, 'Offered'),
('CS303', '2025-II', 'CSE', 'A', 5, 'Offered'),
('EE201', '2025-II', 'EE', 'A', 2, 'Offered'),
('EE203', '2025-II', 'EE', 'A', 3, 'Offered'),
('EE205', '2025-II', 'EE', 'A', 1, 'Offered'),
('EE207', '2025-II', 'EE', 'A', 4, 'Offered'),
('EE301', '2025-II', 'EE', 'A', 5, 'Offered'),
('MEL101', '2025-II', 'ME', 'A', 3, 'Offered'),
('MEL201', '2025-II', 'ME', 'A', 1, 'Offered'),
('MEL202', '2025-II', 'ME', 'A', 2, 'Offered'),
('MEL301', '2025-II', 'ME', 'A', 5, 'Offered'),
('MEL302', '2025-II', 'ME', 'A', 4, 'Offered')
ON CONFLICT (course_id, session_id, section) DO NOTHING;

