import pool from '../config/db.js';

export const createOrUpdateStudentRecord = async (recordData) => {
  const {
    studentEmail,
    semester,
    sgpa,
    creditsCompleted = 0,
    creditsExceeded = 0,
    creditsExceededApproved = false,
    minorStatus,
    additionalCourses,
    internshipStatus
  } = recordData;

  const result = await pool.query(
    `INSERT INTO student_records (student_email, semester, sgpa, credits_completed, 
                                  credits_exceeded, credits_exceeded_approved, 
                                  minor_status, additional_courses, internship_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (student_email, semester) 
     DO UPDATE SET 
       sgpa = EXCLUDED.sgpa,
       credits_completed = EXCLUDED.credits_completed,
       credits_exceeded = EXCLUDED.credits_exceeded,
       credits_exceeded_approved = EXCLUDED.credits_exceeded_approved,
       minor_status = EXCLUDED.minor_status,
       additional_courses = EXCLUDED.additional_courses,
       internship_status = EXCLUDED.internship_status,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [studentEmail, semester, sgpa, creditsCompleted, creditsExceeded, 
     creditsExceededApproved, minorStatus, additionalCourses, internshipStatus]
  );
  return result.rows[0];
};

export const getStudentRecord = async (studentEmail, semester) => {
  const result = await pool.query(
    `SELECT * FROM student_records 
     WHERE student_email = $1 AND semester = $2`,
    [studentEmail, semester]
  );
  return result.rows[0];
};

export const getAllStudentRecords = async (studentEmail) => {
  const result = await pool.query(
    `SELECT * FROM student_records 
     WHERE student_email = $1 
     ORDER BY semester DESC`,
    [studentEmail]
  );
  return result.rows;
};

