import pool from "../config/db.js";

export const saveOtp = async ({ email, otpHash, expiresAt }) => {
  await pool.query(`
    INSERT INTO email_verifications (email, otp_hash, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (email)
    DO UPDATE SET otp_hash = $2, expires_at = $3, attempts = 0
  `, [email, otpHash, expiresAt]);
};

export const findOtp = async (email) => {
  const res = await pool.query(
    `SELECT * FROM email_verifications WHERE email = $1`,
    [email]
  );
  return res.rows[0];
};

export const deleteOtp = async (email) => {
  await pool.query(
    `DELETE FROM email_verifications WHERE email = $1`,
    [email]
  );
};

export const incrementAttempts = async (email) => {
  await pool.query(
    `UPDATE email_verifications SET attempts = attempts + 1 WHERE email = $1`,
    [email]
  );
};
