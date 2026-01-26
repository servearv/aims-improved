import pool from '../config/db.js';

export const createStudent = async ({ email, entryNo, faId, batch, group }) => {
  const result = await pool.query(
    `INSERT INTO students (email, entry_no, fa_id, batch, "group")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [email, entryNo, faId, batch, group]
  );
  return result.rows[0];
};

export const findStudentByEmail = async (email) => {
  const result = await pool.query(
    `SELECT s.*, u.role, u.is_active 
     FROM students s
     JOIN users u ON s.email = u.email
     WHERE s.email = $1`,
    [email]
  );
  return result.rows[0];
};

export const findStudentByEntryNo = async (entryNo) => {
  const result = await pool.query(
    `SELECT s.*, u.role, u.is_active 
     FROM students s
     JOIN users u ON s.email = u.email
     WHERE s.entry_no = $1`,
    [entryNo]
  );
  return result.rows[0];
};

export const listStudents = async (filters = {}) => {
  let query = `SELECT s.*, u.role, u.is_active 
               FROM students s
               JOIN users u ON s.email = u.email
               WHERE 1=1`;
  const params = [];
  let paramCount = 1;

  if (filters.batch) {
    query += ` AND s.batch = $${paramCount++}`;
    params.push(filters.batch);
  }
  if (filters.faId) {
    query += ` AND s.fa_id = $${paramCount++}`;
    params.push(filters.faId);
  }
  if (filters.group) {
    query += ` AND s."group" = $${paramCount++}`;
    params.push(filters.group);
  }

  query += ` ORDER BY s.entry_no`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateStudent = async (email, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.faId !== undefined) {
    fields.push(`fa_id = $${paramCount++}`);
    values.push(updates.faId);
  }
  if (updates.batch !== undefined) {
    fields.push(`batch = $${paramCount++}`);
    values.push(updates.batch);
  }
  if (updates.group !== undefined) {
    fields.push(`"group" = $${paramCount++}`);
    values.push(updates.group);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(email);

  const result = await pool.query(
    `UPDATE students SET ${fields.join(', ')} WHERE email = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const getStudentTimetable = async (email) => {
  const result = await pool.query(
    `SELECT c.course_id as code, c.title, c.type, c.classroom as room,
            s.day_of_week, s.start_time, s.end_time, s.timings
     FROM student_courses sc
     JOIN courses c ON sc.course_id = c.course_id
     LEFT JOIN slots s ON c.slot_id = s.slot_id
     WHERE sc.student_email = $1 
       AND sc.status IN ('Enrolled', 'Approved')
       AND s.day_of_week IS NOT NULL`,
    [email]
  );
  return result.rows;
};

