import pool from '../config/db.js';

export const createSlot = async ({ timings, dayOfWeek, startTime, endTime }) => {
  const result = await pool.query(
    `INSERT INTO slots (timings, day_of_week, start_time, end_time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [timings, dayOfWeek, startTime, endTime]
  );
  return result.rows[0];
};

export const findSlotById = async (slotId) => {
  const result = await pool.query(
    `SELECT * FROM slots WHERE slot_id = $1`,
    [slotId]
  );
  return result.rows[0];
};

export const listSlots = async () => {
  const result = await pool.query(
    `SELECT * FROM slots ORDER BY day_of_week, start_time`
  );
  return result.rows;
};

