import pool from '../config/db.js';

/**
 * List all departments
 */
export const listDepartments = async () => {
    const result = await pool.query(
        `SELECT dept_code, name
     FROM departments
     ORDER BY name`
    );
    return result.rows;
};

/**
 * Get department by code
 */
export const getDepartmentByCode = async (deptCode) => {
    const result = await pool.query(
        `SELECT dept_code, name
     FROM departments
     WHERE dept_code = $1`,
        [deptCode]
    );
    return result.rows[0] || null;
};

/**
 * Create a new department
 */
export const createDepartment = async (deptCode, name) => {
    const result = await pool.query(
        `INSERT INTO departments (dept_code, name)
     VALUES ($1, $2)
     ON CONFLICT (dept_code) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
        [deptCode, name]
    );
    return result.rows[0];
};
