-- AIMS Database Schema
-- Run this to initialize the database tables

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verifications table (for OTP)
CREATE TABLE IF NOT EXISTS email_verifications (
    email VARCHAR(255) PRIMARY KEY,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
    instructor_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email),
    dept VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slots table (for course timings)
CREATE TABLE IF NOT EXISTS slots (
    slot_id SERIAL PRIMARY KEY,
    timings VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    course_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    slot_id INTEGER REFERENCES slots(slot_id),
    instructor_id VARCHAR(50) REFERENCES instructors(instructor_id),
    type VARCHAR(50), -- Core, Elective, Minor, Additional, etc.
    status VARCHAR(50) DEFAULT 'Offered', -- Offered, Withdrawn, Proposed
    capacity INTEGER,
    classroom VARCHAR(100),
    ltp VARCHAR(20), -- Lectures-Tutorials-Practicals-Self-study format
    capa_cutoff DECIMAL(4,2), -- CGPA cutoff for enrollment
    prereqs TEXT[], -- Array of prerequisite course IDs
    open_for TEXT[], -- Which batches/groups can enroll
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    email VARCHAR(255) PRIMARY KEY REFERENCES users(email),
    entry_no VARCHAR(50) UNIQUE NOT NULL,
    fa_id VARCHAR(50) REFERENCES instructors(instructor_id), -- Faculty Advisor
    batch INTEGER NOT NULL,
    "group" VARCHAR(20), -- Student group/section
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Advisors table (extends instructors)
CREATE TABLE IF NOT EXISTS faculty_advisors (
    email VARCHAR(255) PRIMARY KEY REFERENCES users(email),
    ins_id VARCHAR(50) NOT NULL REFERENCES instructors(instructor_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student course enrollments (current and past)
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL REFERENCES students(email),
    course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id),
    semester VARCHAR(20) NOT NULL, -- e.g., "2024-1" for Spring 2024, "2024-2" for Fall 2024
    status VARCHAR(50) DEFAULT 'Enrolled', -- Enrolled, Completed, Dropped, Withdrawn, Approved, Pending
    grade VARCHAR(10), -- A+, A, B+, B, C+, C, D, F, S, X, I, etc.
    grade_points DECIMAL(4,2), -- Numerical grade points
    credits_earned INTEGER, -- Credits earned (may differ from course credits if failed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_email, course_id, semester)
);

-- Student records for semester-wise tracking
CREATE TABLE IF NOT EXISTS student_records (
    id SERIAL PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL REFERENCES students(email),
    semester VARCHAR(20) NOT NULL,
    sgpa DECIMAL(4,2), -- Semester Grade Point Average
    credits_completed INTEGER DEFAULT 0,
    credits_exceeded INTEGER DEFAULT 0,
    credits_exceeded_approved BOOLEAN DEFAULT false,
    minor_status TEXT,
    additional_courses TEXT,
    internship_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_email, semester)
);

-- Academic Sessions table
CREATE TABLE IF NOT EXISTS academic_sessions (
    session_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    session_type VARCHAR(20) -- 'regular', 'summer'
);

-- Departments table  
CREATE TABLE IF NOT EXISTS departments (
    dept_code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

-- Course Offerings (links course to session with additional metadata)
CREATE TABLE IF NOT EXISTS course_offerings (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(course_id),
    session_id VARCHAR(20) REFERENCES academic_sessions(session_id),
    offering_dept VARCHAR(20) REFERENCES departments(dept_code),
    section VARCHAR(10),
    slot_id INTEGER REFERENCES slots(slot_id),
    status VARCHAR(20) DEFAULT 'Proposed', -- Proposed, Offered, Enrolling, Withdrawn
    enrolment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, session_id, section)
);

-- Course Instructors (multiple instructors per offering)
CREATE TABLE IF NOT EXISTS course_instructors (
    id SERIAL PRIMARY KEY,
    offering_id INTEGER REFERENCES course_offerings(id) ON DELETE CASCADE,
    instructor_id VARCHAR(50) REFERENCES instructors(instructor_id),
    is_coordinator BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(offering_id, instructor_id)
);

-- Crediting Categorization
CREATE TABLE IF NOT EXISTS crediting_categorization (
    id SERIAL PRIMARY KEY,
    offering_id INTEGER REFERENCES course_offerings(id) ON DELETE CASCADE,
    degree VARCHAR(50), -- B.Tech, M.Tech, PhD
    department VARCHAR(20) REFERENCES departments(dept_code),
    category VARCHAR(50), -- Programme Core, Programme Elec, Open Elec, etc.
    entry_years TEXT, -- e.g., "2019,2020"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_students_entry_no ON students(entry_no);
CREATE INDEX IF NOT EXISTS idx_students_fa ON students(fa_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_slot ON courses(slot_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_email);
CREATE INDEX IF NOT EXISTS idx_student_courses_course ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_semester ON student_courses(semester);
CREATE INDEX IF NOT EXISTS idx_student_records_student ON student_records(student_email);
CREATE INDEX IF NOT EXISTS idx_student_records_semester ON student_records(semester);
CREATE INDEX IF NOT EXISTS idx_course_offerings_session ON course_offerings(session_id);
CREATE INDEX IF NOT EXISTS idx_course_offerings_dept ON course_offerings(offering_dept);
CREATE INDEX IF NOT EXISTS idx_course_offerings_course ON course_offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_offering ON course_instructors(offering_id);
CREATE INDEX IF NOT EXISTS idx_crediting_cat_offering ON crediting_categorization(offering_id);

-- Pending Course Offerings (proposals from instructors awaiting admin approval)
CREATE TABLE IF NOT EXISTS pending_course_offerings (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id),
    session_id VARCHAR(20) NOT NULL,
    offering_dept VARCHAR(20) REFERENCES departments(dept_code),
    slot_id INTEGER REFERENCES slots(slot_id),
    proposed_by VARCHAR(255) NOT NULL REFERENCES users(email),
    instructor_ids TEXT[], -- Array of instructor IDs to add on approval
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_offerings_status ON pending_course_offerings(status);
CREATE INDEX IF NOT EXISTS idx_pending_offerings_proposed_by ON pending_course_offerings(proposed_by);

-- Course Feedback table
CREATE TABLE IF NOT EXISTS course_feedback (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(course_id),
    student_email VARCHAR(255) NOT NULL REFERENCES students(email),
    feedback_type VARCHAR(20) NOT NULL, -- 'MID_SEM', 'END_SEM'
    instructor_id VARCHAR(50)REFERENCES instructors(instructor_id),
    ratings JSONB, -- Stores question-answer pairs or structured ratings
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, student_email, feedback_type, instructor_id)
);

-- Student Payments table
CREATE TABLE IF NOT EXISTS student_payments (
    id SERIAL PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL REFERENCES students(email),
    session_id VARCHAR(50) NOT NULL, -- e.g. "2024-2025-II"
    amount DECIMAL(10,2) NOT NULL,
    bank VARCHAR(100),
    transaction_no VARCHAR(100),
    transaction_date DATE,
    proof_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Verified, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_email, session_id, transaction_no)
);

CREATE INDEX IF NOT EXISTS idx_course_feedback_course ON course_feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_student ON student_payments(student_email);
