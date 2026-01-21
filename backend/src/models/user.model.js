import pool from '../config/db.js';

export const createUser = async ({ email, role }) => {
  const result = await pool.query(
    `INSERT INTO users (email, role)
     VALUES ($1, $2)
     RETURNING *`,
    [email, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const listUsers = async () => {
  const result = await pool.query(`SELECT * FROM users ORDER BY id`);
  return result.rows;
};

export const deactivateUser = async (id) => {
  const result = await pool.query(
    `UPDATE users SET is_active = false WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
