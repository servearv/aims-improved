import pool from '../config/db.js';

export const createCourse = async (courseData) => {
  const {
    courseId,
    title,
    credits,
    slotId,
    instructorId,
    type,
    status = 'Offered',
    capacity,
    classroom,
    ltp,
    capaCutoff,
    prereqs = [],
    openFor = []
  } = courseData;

  const result = await pool.query(
    `INSERT INTO courses (course_id, title, credits, slot_id, instructor_id, type, status, 
                          capacity, classroom, ltp, capa_cutoff, prereqs, open_for)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [courseId, title, credits, slotId, instructorId, type, status, capacity,
      classroom, ltp, capaCutoff, prereqs, openFor]
  );
  return result.rows[0];
};

export const findCourseById = async (courseId) => {
  const result = await pool.query(
    `SELECT c.*, 
            i.instructor_id, i.email as instructor_email, i.dept as instructor_dept,
            s.timings, s.day_of_week, s.start_time, s.end_time
     FROM courses c
     LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
     LEFT JOIN slots s ON c.slot_id = s.slot_id
     WHERE c.course_id = $1`,
    [courseId]
  );
  return result.rows[0];
};

export const listCourses = async (filters = {}) => {
  let query = `SELECT c.*, 
                      i.instructor_id, i.email as instructor_email, i.dept as instructor_dept,
                      s.timings, s.day_of_week, s.start_time, s.end_time
               FROM courses c
               LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
               LEFT JOIN slots s ON c.slot_id = s.slot_id
               WHERE 1=1`;
  const params = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND c.status = $${paramCount++}`;
    params.push(filters.status);
  }
  if (filters.instructorId) {
    query += ` AND c.instructor_id = $${paramCount++}`;
    params.push(filters.instructorId);
  }
  if (filters.type) {
    query += ` AND c.type = $${paramCount++}`;
    params.push(filters.type);
  }
  // New filters implementation
  if (filters.code) {
    query += ` AND c.course_id ILIKE $${paramCount++}`;
    params.push(`%${filters.code}%`);
  }
  if (filters.title) {
    query += ` AND c.title ILIKE $${paramCount++}`;
    params.push(`%${filters.title}%`);
  }
  if (filters.department) {
    // Filter by instructor's department
    query += ` AND i.dept ILIKE $${paramCount++}`;
    params.push(`%${filters.department}%`);
  }
  if (filters.ltp) {
    query += ` AND c.ltp ILIKE $${paramCount++}`;
    params.push(`%${filters.ltp}%`);
  }

  query += ` ORDER BY c.course_id`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateCourse = async (courseId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  const updateFields = {
    title: 'title',
    credits: 'credits',
    slotId: 'slot_id',
    instructorId: 'instructor_id',
    type: 'type',
    status: 'status',
    capacity: 'capacity',
    classroom: 'classroom',
    ltp: 'ltp',
    capaCutoff: 'capa_cutoff',
    prereqs: 'prereqs',
    openFor: 'open_for'
  };

  for (const [key, dbField] of Object.entries(updateFields)) {
    if (updates[key] !== undefined) {
      fields.push(`${dbField} = $${paramCount++}`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(courseId);

  const result = await pool.query(
    `UPDATE courses SET ${fields.join(', ')} WHERE course_id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

