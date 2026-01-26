--
-- PostgreSQL database dump
--

\restrict JytB9xIhVahYv0WqcdW1fUqo0omzRw5eIugdTo2pWGmh5uzIAENCgvbTcXb9gS2

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: academic_sessions; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2025-II', 'current session', '2025-12-04', '2026-05-30', true, 'regular');
INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2025-S', 'upcoming session (summer)', '2026-06-01', '2026-07-31', false, 'summer');
INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2026-I', 'next session (regular)', '2026-08-01', '2026-12-03', false, 'regular');
INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2024-I', 'Spring 2024', '2024-01-01', '2024-05-30', false, 'regular');
INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2024-II', 'Fall 2024', '2024-08-01', '2024-12-15', false, 'regular');
INSERT INTO public.academic_sessions (session_id, name, start_date, end_date, is_current, session_type) VALUES ('2025-I', 'Spring 2025', '2025-01-01', '2025-05-30', false, 'regular');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (15, '2023csb1106+s1@iitrpr.ac.in', 'STUDENT', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (16, '2023csb1106+i1@iitrpr.ac.in', 'INSTRUCTOR', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (17, '2023csb1106+i2@iitrpr.ac.in', 'INSTRUCTOR', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (18, '2023csb1106+i3@iitrpr.ac.in', 'INSTRUCTOR', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (19, '2023csb1106+a1@iitrpr.ac.in', 'ADVISOR', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (20, '2023csb1106+admin@iitrpr.ac.in', 'ADMIN', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');
INSERT INTO public.users (id, email, role, is_active, created_at, updated_at) VALUES (21, '2023csb1106+s2@iitrpr.ac.in', 'STUDENT', true, '2026-01-25 13:03:50.598295', '2026-01-25 13:03:50.598295');


--
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.instructors (instructor_id, email, dept, created_at) VALUES ('i1', '2023csb1106+i1@iitrpr.ac.in', 'CSE', '2026-01-25 13:03:50.642125');
INSERT INTO public.instructors (instructor_id, email, dept, created_at) VALUES ('i2', '2023csb1106+i2@iitrpr.ac.in', 'EE', '2026-01-25 13:03:50.642125');
INSERT INTO public.instructors (instructor_id, email, dept, created_at) VALUES ('i3', '2023csb1106+i3@iitrpr.ac.in', 'ME', '2026-01-25 13:03:50.642125');
INSERT INTO public.instructors (instructor_id, email, dept, created_at) VALUES ('a1', '2023csb1106+a1@iitrpr.ac.in', 'CSE', '2026-01-25 13:03:50.642125');


--
-- Data for Name: slots; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (1, 'Slot A', 'Mon,Wed,Thu', NULL, NULL, '2026-01-25 13:03:50.713797');
INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (2, 'Slot B', 'Mon,Wed,Thu', NULL, NULL, '2026-01-25 13:03:50.713797');
INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (3, 'Slot C', 'Mon,Wed,Thu', NULL, NULL, '2026-01-25 13:03:50.713797');
INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (4, 'Slot D', 'Unknown', NULL, NULL, '2026-01-25 13:03:50.713797');
INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (5, 'Slot E', 'Unknown', NULL, NULL, '2026-01-25 13:03:50.713797');
INSERT INTO public.slots (slot_id, timings, day_of_week, start_time, end_time, created_at) VALUES (6, 'Slot F', 'Unknown', NULL, NULL, '2026-01-25 13:03:50.713797');


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('CS201', 'Data Structures', 4, 1, 'i1', NULL, 'Offered', NULL, NULL, '3-1-2-6-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('CS202', 'Analysis and Design of Algorithms', 3, 2, 'i1', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('CS203', 'Digital Logic Design', 4, 3, 'i1', NULL, 'Offered', NULL, NULL, '3-1-2-6-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('CS301', 'Database Management Systems', 4, 4, 'i1', NULL, 'Offered', NULL, NULL, '3-0-2-7-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('CS303', 'Operating Systems', 4, 5, 'i1', NULL, 'Offered', NULL, NULL, '3-0-2-7-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('EE201', 'Signals and Systems', 3, 2, 'i2', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('EE203', 'Digital Circuits', 3, 3, 'i2', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('EE205', 'Electromechanics', 3, 1, 'i2', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('EE207', 'Control Engineering', 3, 4, 'i2', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('EE301', 'Analog Circuits', 3, 5, 'i2', NULL, 'Offered', NULL, NULL, '3-1-0-5-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('MEL101', 'Continuum Mechanics', 4, 3, 'i3', NULL, 'Offered', NULL, NULL, '3-1-0-8-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('MEL201', 'Fluid Mechanics', 4, 1, 'i3', NULL, 'Offered', NULL, NULL, '3-1-0-8-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('MEL202', 'Manufacturing with Metallic Materials', 3, 2, 'i3', NULL, 'Offered', NULL, NULL, '3-0-0-6-3', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('MEL301', 'Heat and Mass Transfer', 4, 5, 'i3', NULL, 'Offered', NULL, NULL, '3-1-2-6-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');
INSERT INTO public.courses (course_id, title, credits, slot_id, instructor_id, type, status, capacity, classroom, ltp, capa_cutoff, prereqs, open_for, created_at, updated_at) VALUES ('MEL302', 'Manufacturing Processes', 4, 4, 'i3', NULL, 'Offered', NULL, NULL, '3-0-2-7-4', NULL, NULL, NULL, '2026-01-25 13:03:50.731922', '2026-01-25 13:03:50.731922');


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.students (email, entry_no, fa_id, batch, "group", created_at) VALUES ('2023csb1106+s1@iitrpr.ac.in', '2023CSB1106', 'i1', 2023, 'A', '2026-01-25 13:03:50.677657');
INSERT INTO public.students (email, entry_no, fa_id, batch, "group", created_at) VALUES ('2023csb1106+s2@iitrpr.ac.in', '2023CSB1112', 'i1', 2023, 'B', '2026-01-25 13:03:50.677657');


--
-- Data for Name: course_feedback; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.departments (dept_code, name) VALUES ('CSE', 'Computer Science and Engineering');
INSERT INTO public.departments (dept_code, name) VALUES ('EE', 'Electrical Engineering');
INSERT INTO public.departments (dept_code, name) VALUES ('ME', 'Mechanical Engineering');
INSERT INTO public.departments (dept_code, name) VALUES ('CE', 'Civil Engineering');
INSERT INTO public.departments (dept_code, name) VALUES ('MATH', 'Mathematics');
INSERT INTO public.departments (dept_code, name) VALUES ('PHY', 'Physics');
INSERT INTO public.departments (dept_code, name) VALUES ('HSS', 'Humanities and Social Sciences');
INSERT INTO public.departments (dept_code, name) VALUES ('CHEM', 'Chemistry');


--
-- Data for Name: course_offerings; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.course_offerings (id, course_id, session_id, offering_dept, section, slot_id, status, enrolment_count, created_at, updated_at) VALUES (36, 'MEL101', '2025-II', 'CSE', NULL, 3, 'Offered', 0, '2026-01-26 15:09:43.861306', '2026-01-26 15:09:43.861306');


--
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.course_instructors (id, offering_id, instructor_id, is_coordinator, created_at) VALUES (10, 36, 'i3', true, '2026-01-26 15:09:43.861306');


--
-- Data for Name: crediting_categorization; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: faculty_advisors; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.faculty_advisors (email, ins_id, created_at) VALUES ('2023csb1106+a1@iitrpr.ac.in', 'a1', '2026-01-25 13:03:50.665083');


--
-- Data for Name: pending_course_offerings; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.pending_course_offerings (id, course_id, session_id, offering_dept, slot_id, proposed_by, instructor_ids, status, created_at, updated_at) VALUES (12, 'MEL101', '2025-II', 'CSE', 3, '2023csb1106+i3@iitrpr.ac.in', '{}', 'Approved', '2026-01-26 15:08:21.513713', '2026-01-26 15:09:43.861306');


--
-- Data for Name: student_courses; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (27, '2023csb1106+s1@iitrpr.ac.in', 'CS201', '2024-I', 'Completed', 'A', 10.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (28, '2023csb1106+s1@iitrpr.ac.in', 'CS202', '2024-I', 'Completed', 'A-', 9.00, 3, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (29, '2023csb1106+s1@iitrpr.ac.in', 'EE201', '2024-I', 'Completed', 'B+', 8.00, 3, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (30, '2023csb1106+s1@iitrpr.ac.in', 'MEL101', '2024-I', 'Completed', 'A', 10.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (31, '2023csb1106+s1@iitrpr.ac.in', 'CS203', '2024-II', 'Completed', 'A+', 10.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (32, '2023csb1106+s1@iitrpr.ac.in', 'CS301', '2024-II', 'Completed', 'A', 10.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (33, '2023csb1106+s1@iitrpr.ac.in', 'EE203', '2024-II', 'Completed', 'B', 8.00, 3, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (34, '2023csb1106+s1@iitrpr.ac.in', 'MEL201', '2024-II', 'Completed', 'A-', 9.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (35, '2023csb1106+s1@iitrpr.ac.in', 'CS303', '2025-I', 'Completed', 'A', 10.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (36, '2023csb1106+s1@iitrpr.ac.in', 'EE205', '2025-I', 'Completed', 'B+', 8.00, 3, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (37, '2023csb1106+s1@iitrpr.ac.in', 'EE207', '2025-I', 'Completed', 'A-', 9.00, 3, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (38, '2023csb1106+s1@iitrpr.ac.in', 'MEL302', '2025-I', 'Completed', 'B', 8.00, 4, '2026-01-25 13:31:13.090842', '2026-01-25 13:31:13.090842');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (39, '2023csb1106+s2@iitrpr.ac.in', 'CS201', '2024-I', 'Completed', 'B+', 8.00, 4, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (40, '2023csb1106+s2@iitrpr.ac.in', 'EE201', '2024-I', 'Completed', 'A', 10.00, 3, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (41, '2023csb1106+s2@iitrpr.ac.in', 'MEL202', '2024-I', 'Completed', 'B', 8.00, 3, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (42, '2023csb1106+s2@iitrpr.ac.in', 'CS202', '2024-II', 'Completed', 'A-', 9.00, 3, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (43, '2023csb1106+s2@iitrpr.ac.in', 'CS203', '2024-II', 'Completed', 'B+', 8.00, 4, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (44, '2023csb1106+s2@iitrpr.ac.in', 'EE203', '2024-II', 'Completed', 'A', 10.00, 3, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (45, '2023csb1106+s2@iitrpr.ac.in', 'CS301', '2025-I', 'Completed', 'A', 10.00, 4, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (46, '2023csb1106+s2@iitrpr.ac.in', 'EE205', '2025-I', 'Completed', 'A-', 9.00, 3, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (47, '2023csb1106+s2@iitrpr.ac.in', 'MEL301', '2025-I', 'Completed', 'B+', 8.00, 4, '2026-01-25 13:33:26.814574', '2026-01-25 13:33:26.814574');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (84, '2023csb1106+s1@iitrpr.ac.in', 'MEL101', '2025-II', 'PENDING_INSTRUCTOR', NULL, NULL, NULL, '2026-01-26 10:07:20.971817', '2026-01-26 10:07:20.971817');
INSERT INTO public.student_courses (id, student_email, course_id, semester, status, grade, grade_points, credits_earned, created_at, updated_at) VALUES (85, '2023csb1106+s2@iitrpr.ac.in', 'MEL101', '2025-II', 'PENDING_INSTRUCTOR', NULL, NULL, NULL, '2026-01-26 12:09:45.714761', '2026-01-26 12:09:45.714761');


--
-- Data for Name: student_payments; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: student_records; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Name: course_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.course_feedback_id_seq', 1, false);


--
-- Name: course_instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.course_instructors_id_seq', 10, true);


--
-- Name: course_offerings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.course_offerings_id_seq', 36, true);


--
-- Name: crediting_categorization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.crediting_categorization_id_seq', 8, true);


--
-- Name: pending_course_offerings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pending_course_offerings_id_seq', 12, true);


--
-- Name: slots_slot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.slots_slot_id_seq', 1, false);


--
-- Name: student_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.student_courses_id_seq', 85, true);


--
-- Name: student_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.student_payments_id_seq', 1, true);


--
-- Name: student_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.student_records_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- PostgreSQL database dump complete
--

\unrestrict JytB9xIhVahYv0WqcdW1fUqo0omzRw5eIugdTo2pWGmh5uzIAENCgvbTcXb9gS2
