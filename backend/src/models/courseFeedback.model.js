import pool from '../config/db.js';

export const createFeedback = async ({
    courseId,
    studentEmail,
    feedbackType,
    instructorId,
    ratings,
    comments
}) => {
    const result = await pool.query(
        `INSERT INTO course_feedback 
     (course_id, student_email, feedback_type, instructor_id, ratings, comments, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     RETURNING *`,
        [courseId, studentEmail, feedbackType, instructorId, JSON.stringify(ratings), comments]
    );
    return result.rows[0];
};

export const checkFeedbackExists = async (courseId, studentEmail, feedbackType, instructorId) => {
    const result = await pool.query(
        `SELECT 1 FROM course_feedback 
     WHERE course_id = $1 AND student_email = $2 AND feedback_type = $3 AND instructor_id = $4`,
        [courseId, studentEmail, feedbackType, instructorId]
    );
    return result.rows.length > 0;
};
