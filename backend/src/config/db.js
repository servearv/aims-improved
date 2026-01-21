import pkg from 'pg';
const { Pool } = pkg;

// 1. Create the pool with connection retry configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin_pass',
  database: process.env.DB_NAME || 'aims_db',
  ssl: false,
  // Connection retry settings
  connectionTimeoutMillis: 10000,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on('error', (err) => {
  console.error("❌ Postgres pool error:", err.message);
  // Don't exit on pool errors - let retry logic handle it
});

/**
 * Wait for database to be ready with retries
 */
export async function waitForDatabase(maxRetries = 30, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database is ready');
      return true;
    } catch (err) {
      if (i < maxRetries - 1) {
        console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ Database connection failed after retries');
        throw err;
      }
    }
  }
}

// 2. Named Export (Fixes admin.service.js)
export { pool };

// 3. Default Export (Fixes otp.model.js)
export default pool;
