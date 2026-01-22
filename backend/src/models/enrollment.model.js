import pool from '../config/db.js';

export const enrollStudent = async ({ studentEmail, courseId, semester, status = 'Enrolled' }) => {
  // Check if course exists
  const courseCheck = await pool.query('SELECT 1 FROM courses WHERE course_id = $1', [courseId]);
  if (courseCheck.rowCount === 0) throw new Error('Course not found');

  // Check if student exists
  const studentCheck = await pool.query('SELECT 1 FROM students WHERE email = $1', [studentEmail]);
  if (studentCheck.rowCount === 0) throw new Error('Student not found');

  const result = await pool.query(
    `INSERT INTO student_courses (student_email, course_id, semester, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_email, course_id, semester) 
     DO UPDATE SET status = $4, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [studentEmail, courseId, semester, status]
  );
  return result.rows[0];
};

export const enrollBatch = async ({ courseId, batch, semester, status = 'Enrolled' }) => {
  const result = await pool.query(
    `INSERT INTO student_courses (student_email, course_id, semester, status)
     SELECT email, $1, $2, $3 FROM students WHERE batch = $4
     ON CONFLICT (student_email, course_id, semester) DO NOTHING
     RETURNING *`,
    [courseId, semester, status, batch]
  );
  return result.rows;
};

export const updateEnrollment = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.grade !== undefined) {
    fields.push(`grade = $${paramCount++}`);
    values.push(updates.grade);
  }
  if (updates.gradePoints !== undefined) {
    fields.push(`grade_points = $${paramCount++}`);
    values.push(updates.gradePoints);
  }
  if (updates.creditsEarned !== undefined) {
    fields.push(`credits_earned = $${paramCount++}`);
    values.push(updates.creditsEarned);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE student_courses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const findEnrollment = async (studentEmail, courseId, semester) => {
  const result = await pool.query(
    `SELECT sc.*, c.title as course_title, c.credits as course_credits
     FROM student_courses sc
     JOIN courses c ON sc.course_id = c.course_id
     WHERE sc.student_email = $1 AND sc.course_id = $2 AND sc.semester = $3`,
    [studentEmail, courseId, semester]
  );
  return result.rows[0];
};

export const getStudentEnrollments = async (studentEmail, semester = null) => {
  let query = `SELECT sc.*, c.title as course_title, c.credits as course_credits, c.type as course_type
               FROM student_courses sc
               JOIN courses c ON sc.course_id = c.course_id
               WHERE sc.student_email = $1`;
  const params = [studentEmail];

  if (semester) {
    query += ` AND sc.semester = $2`;
    params.push(semester);
  }

  query += ` ORDER BY sc.semester DESC, c.course_id`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const getCourseEnrollments = async (courseId, semester = null) => {
  let query = `SELECT sc.*, s.entry_no, s.batch, s."group"
               FROM student_courses sc
               JOIN students s ON sc.student_email = s.email
               WHERE sc.course_id = $1`;
  const params = [courseId];

  if (semester) {
    query += ` AND sc.semester = $2`;
    params.push(semester);
  }

  query += ` ORDER BY s.entry_no`;

  const result = await pool.query(query, params);
  return result.rows;
};

