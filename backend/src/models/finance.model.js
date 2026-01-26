
import pool from '../config/db.js';

export const createPayment = async ({ studentEmail, sessionId, amount, bank, transactionNo, transactionDate, proofUrl }) => {
    const result = await pool.query(
        `INSERT INTO student_payments 
         (student_email, session_id, amount, bank, transaction_no, transaction_date, proof_url, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', CURRENT_TIMESTAMP)
         RETURNING *`,
        [studentEmail, sessionId, amount, bank, transactionNo, transactionDate, proofUrl]
    );
    return result.rows[0];
};

export const getPaymentHistory = async (studentEmail) => {
    const result = await pool.query(
        `SELECT * FROM student_payments 
         WHERE student_email = $1 
         ORDER BY created_at DESC`,
        [studentEmail]
    );
    return result.rows;
};
