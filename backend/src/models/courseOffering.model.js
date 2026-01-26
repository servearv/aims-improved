import pool from '../config/db.js';

/**
 * Create a new course offering
 */
export const createOffering = async (data) => {
    const { courseId, sessionId, offeringDept, section, slotId, status } = data;

    const result = await pool.query(
        `INSERT INTO course_offerings (course_id, session_id, offering_dept, section, slot_id, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [courseId, sessionId, offeringDept, section || null, slotId || null, status || 'Proposed']
    );
    return result.rows[0];
};

/**
 * Get offering by ID with full details
 */
export const getOfferingById = async (id) => {
    const result = await pool.query(
        `SELECT co.*, 
            c.title, c.credits, c.ltp, c.type as course_type,
            d.name as dept_name,
            s.timings as slot_timings,
            asess.name as session_name, asess.start_date, asess.end_date
     FROM course_offerings co
     JOIN courses c ON co.course_id = c.course_id
     LEFT JOIN departments d ON co.offering_dept = d.dept_code
     LEFT JOIN slots s ON co.slot_id = s.slot_id
     LEFT JOIN academic_sessions asess ON co.session_id = asess.session_id
     WHERE co.id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;

    // Get instructors for this offering
    const instructors = await getOfferingInstructors(id);
    // Get crediting categories
    const crediting = await getOfferingCrediting(id);

    return {
        ...result.rows[0],
        instructors,
        crediting
    };
};

/**
 * List course offerings with filters
 */
export const listOfferings = async (filters = {}) => {
    let query = `SELECT co.*, 
                      c.title, c.credits, c.ltp, c.type as course_type,
                      d.name as dept_name,
                      s.timings as slot_timings,
                      asess.name as session_name
               FROM course_offerings co
               JOIN courses c ON co.course_id = c.course_id
               LEFT JOIN departments d ON co.offering_dept = d.dept_code
               LEFT JOIN slots s ON co.slot_id = s.slot_id
               LEFT JOIN academic_sessions asess ON co.session_id = asess.session_id
               WHERE 1=1`;

    const params = [];
    let paramCount = 1;

    if (filters.sessionId) {
        query += ` AND co.session_id = $${paramCount++}`;
        params.push(filters.sessionId);
    }
    if (filters.deptCode) {
        query += ` AND co.offering_dept = $${paramCount++}`;
        params.push(filters.deptCode);
    }
    if (filters.status) {
        query += ` AND co.status = $${paramCount++}`;
        params.push(filters.status);
    }
    if (filters.courseId) {
        query += ` AND co.course_id ILIKE $${paramCount++}`;
        params.push(`%${filters.courseId}%`);
    }
    if (filters.title) {
        query += ` AND c.title ILIKE $${paramCount++}`;
        params.push(`%${filters.title}%`);
    }
    if (filters.instructorId) {
        query += ` AND EXISTS (
            SELECT 1 FROM course_instructors ci 
            JOIN instructors i ON ci.instructor_id = i.instructor_id 
            WHERE ci.offering_id = co.id 
            AND (ci.instructor_id ILIKE $${paramCount} OR i.email ILIKE $${paramCount} OR i.dept ILIKE $${paramCount})
        )`;
        params.push(`%${filters.instructorId}%`);
        paramCount++;
    }
    if (filters.ltp) {
        query += ` AND c.ltp ILIKE $${paramCount++}`;
        params.push(`%${filters.ltp}%`);
    }

    query += ` ORDER BY co.created_at DESC`;

    const result = await pool.query(query, params);

    // Get instructors for each offering
    const offerings = await Promise.all(result.rows.map(async (offering) => {
        const instructors = await getOfferingInstructors(offering.id);
        return { ...offering, instructors };
    }));

    return offerings;
};

/**
 * Update a course offering
 */
export const updateOffering = async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const updateFields = {
        courseId: 'course_id',
        sessionId: 'session_id',
        offeringDept: 'offering_dept',
        section: 'section',
        slotId: 'slot_id',
        status: 'status',
        enrolmentCount: 'enrolment_count'
    };

    for (const [key, dbField] of Object.entries(updateFields)) {
        if (updates[key] !== undefined) {
            fields.push(`${dbField} = $${paramCount++}`);
            values.push(updates[key]);
        }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
        `UPDATE course_offerings SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
    );
    return result.rows[0];
};

/**
 * Delete a course offering
 */
export const deleteOffering = async (id) => {
    const result = await pool.query(
        `DELETE FROM course_offerings WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
};

// ============= Instructor Management =============

/**
 * Get instructors for an offering
 */
export const getOfferingInstructors = async (offeringId) => {
    const result = await pool.query(
        `SELECT ci.*, i.email, i.dept
     FROM course_instructors ci
     JOIN instructors i ON ci.instructor_id = i.instructor_id
     WHERE ci.offering_id = $1
     ORDER BY ci.is_coordinator DESC, ci.id`,
        [offeringId]
    );
    return result.rows;
};

/**
 * Add instructor to offering
 */
export const addInstructor = async (offeringId, instructorId, isCoordinator = false) => {
    const result = await pool.query(
        `INSERT INTO course_instructors (offering_id, instructor_id, is_coordinator)
     VALUES ($1, $2, $3)
     ON CONFLICT (offering_id, instructor_id) DO UPDATE SET is_coordinator = $3
     RETURNING *`,
        [offeringId, instructorId, isCoordinator]
    );
    return result.rows[0];
};

/**
 * Remove instructor from offering
 */
export const removeInstructor = async (offeringId, instructorId) => {
    const result = await pool.query(
        `DELETE FROM course_instructors WHERE offering_id = $1 AND instructor_id = $2 RETURNING *`,
        [offeringId, instructorId]
    );
    return result.rows[0];
};

/**
 * Update instructor coordinator status
 */
export const updateInstructorCoordinator = async (offeringId, instructorId, isCoordinator) => {
    const result = await pool.query(
        `UPDATE course_instructors SET is_coordinator = $3 
     WHERE offering_id = $1 AND instructor_id = $2 RETURNING *`,
        [offeringId, instructorId, isCoordinator]
    );
    return result.rows[0];
};

// ============= Crediting Categorization =============

/**
 * Get crediting categories for an offering
 */
export const getOfferingCrediting = async (offeringId) => {
    const result = await pool.query(
        `SELECT cc.*, d.name as dept_name
     FROM crediting_categorization cc
     LEFT JOIN departments d ON cc.department = d.dept_code
     WHERE cc.offering_id = $1
     ORDER BY cc.id`,
        [offeringId]
    );
    return result.rows;
};

/**
 * Add crediting category
 */
export const addCrediting = async (offeringId, data) => {
    const { degree, department, category, entryYears } = data;
    const result = await pool.query(
        `INSERT INTO crediting_categorization (offering_id, degree, department, category, entry_years)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [offeringId, degree, department, category, entryYears]
    );
    return result.rows[0];
};

/**
 * Remove crediting category
 */
export const removeCrediting = async (creditId) => {
    const result = await pool.query(
        `DELETE FROM crediting_categorization WHERE id = $1 RETURNING *`,
        [creditId]
    );
    return result.rows[0];
};

// ============= Course Lookup =============

/**
 * Search courses for lookup/autocomplete
 */
export const searchCourses = async (query) => {
    const result = await pool.query(
        `SELECT course_id, title, credits, ltp, type
     FROM courses
     WHERE course_id ILIKE $1 OR title ILIKE $1
     ORDER BY course_id
     LIMIT 20`,
        [`%${query}%`]
    );
    return result.rows;
};

/**
 * Search instructors for lookup/autocomplete
 */
export const searchInstructors = async (query) => {
    const result = await pool.query(
        `SELECT i.instructor_id, i.email, i.dept, u.role
     FROM instructors i
     JOIN users u ON i.email = u.email
     WHERE i.email ILIKE $1 OR i.instructor_id ILIKE $1 OR i.dept ILIKE $1
     ORDER BY i.email
     LIMIT 20`,
        [`%${query}%`]
    );
    return result.rows;
};
