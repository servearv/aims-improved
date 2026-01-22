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
