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

export const listUsers = async (filters = {}) => {
  let query = `SELECT * FROM users WHERE 1=1`;
  const params = [];
  let paramCount = 1;

  if (filters.role && filters.role !== 'ALL') {
    query += ` AND role = $${paramCount++}`;
    params.push(filters.role);
  }

  if (filters.search) {
    query += ` AND (email ILIKE $${paramCount} OR id::text ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateUser = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.role !== undefined) {
    fields.push(`role = $${paramCount++}`);
    values.push(updates.role);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(updates.is_active);
  }

  if (fields.length === 0) return null;

  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteUser = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
