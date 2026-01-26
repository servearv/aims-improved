import pool from '../config/db.js';

export const createInstructor = async ({ instructorId, email, dept }) => {
  const result = await pool.query(
    `INSERT INTO instructors (instructor_id, email, dept)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [instructorId, email, dept]
  );
  return result.rows[0];
};

export const findInstructorById = async (instructorId) => {
  const result = await pool.query(
    `SELECT i.*, u.role, u.is_active 
     FROM instructors i
     JOIN users u ON i.email = u.email
     WHERE i.instructor_id = $1`,
    [instructorId]
  );
  return result.rows[0];
};

export const findInstructorByEmail = async (email) => {
  const result = await pool.query(
    `SELECT i.*, u.role, u.is_active 
     FROM instructors i
     JOIN users u ON i.email = u.email
     WHERE i.email = $1`,
    [email]
  );
  return result.rows[0];
};

export const listInstructors = async (filters = {}) => {
  let query = `SELECT i.*, u.role, u.is_active 
               FROM instructors i
               JOIN users u ON i.email = u.email
               WHERE 1=1`;
  const params = [];
  let paramCount = 1;

  if (filters.dept) {
    query += ` AND i.dept = $${paramCount++}`;
    params.push(filters.dept);
  }

  query += ` ORDER BY i.instructor_id`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateInstructor = async (instructorId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.dept !== undefined) {
    fields.push(`dept = $${paramCount++}`);
    values.push(updates.dept);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email);
  }

  if (fields.length === 0) return null;

  values.push(instructorId);

  const result = await pool.query(
    `UPDATE instructors SET ${fields.join(', ')} WHERE instructor_id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

/**
 * Get all courses taught by an instructor
 * Includes courses where they are the primary instructor AND courses from offerings
 */
export const getInstructorCourses = async (email) => {
  // First get instructor_id from email
  const instructorResult = await pool.query(
    'SELECT instructor_id FROM instructors WHERE email = $1',
    [email]
  );

  if (instructorResult.rowCount === 0) {
    return [];
  }

  const instructorId = instructorResult.rows[0].instructor_id;

  // Get courses where this instructor is the primary instructor
  const coursesResult = await pool.query(
    `SELECT DISTINCT c.course_id as id, c.course_id as code, c.title as name, 
            c.credits, c.type, c.status, c.ltp, c.slot_id, s.timings as schedule
     FROM courses c
     LEFT JOIN slots s ON c.slot_id = s.slot_id
     WHERE c.instructor_id = $1
     
     UNION
     
     SELECT DISTINCT c.course_id as id, c.course_id as code, c.title as name, 
            c.credits, c.type, c.status, c.ltp, co.slot_id, s.timings as schedule
     FROM course_offerings co
     JOIN course_instructors ci ON co.id = ci.offering_id
     JOIN courses c ON co.course_id = c.course_id
     LEFT JOIN slots s ON co.slot_id = s.slot_id
     WHERE ci.instructor_id = $1
     
     ORDER BY code`,
    [instructorId]
  );

  return coursesResult.rows;
};
