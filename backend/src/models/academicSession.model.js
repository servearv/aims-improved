import pool from '../config/db.js';

/**
 * List all academic sessions
 */
export const listSessions = async () => {
    const result = await pool.query(
        `SELECT session_id, name, start_date, end_date, is_current, session_type
     FROM academic_sessions
     ORDER BY start_date DESC`
    );
    return result.rows;
};

/**
 * Get the current academic session
 */
export const getCurrentSession = async () => {
    const result = await pool.query(
        `SELECT session_id, name, start_date, end_date, is_current, session_type
     FROM academic_sessions
     WHERE is_current = true
     LIMIT 1`
    );
    return result.rows[0] || null;
};

/**
 * Get session by ID
 */
export const getSessionById = async (sessionId) => {
    const result = await pool.query(
        `SELECT session_id, name, start_date, end_date, is_current, session_type
     FROM academic_sessions
     WHERE session_id = $1`,
        [sessionId]
    );
    return result.rows[0] || null;
};

/**
 * Create a new academic session
 */
export const createSession = async (sessionData) => {
    const { sessionId, name, startDate, endDate, isCurrent, sessionType } = sessionData;

    const result = await pool.query(
        `INSERT INTO academic_sessions (session_id, name, start_date, end_date, is_current, session_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [sessionId, name, startDate, endDate, isCurrent || false, sessionType]
    );
    return result.rows[0];
};

/**
 * Set a session as current and unset others
 */
export const setCurrentSession = async (sessionId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Unset current flag for all sessions
        await client.query('UPDATE academic_sessions SET is_current = false');

        // Set current flag for the specified session
        const result = await client.query(
            'UPDATE academic_sessions SET is_current = true WHERE session_id = $1 RETURNING *',
            [sessionId]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
