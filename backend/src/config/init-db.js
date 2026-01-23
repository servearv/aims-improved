import pool, { waitForDatabase } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database schema
 */
export async function initDatabase() {
  try {
    // Wait for database to be ready first
    await waitForDatabase();

    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Database schema initialized successfully');

    // Check if we need to seed the database
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCheck.rows[0].count);

    if (userCount === 0) {
      // Run seed.sql if no users exist
      const seedPath = path.join(__dirname, '../../seed.sql');
      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seed);
        console.log('✅ Database seeded successfully');
      }
    } else {
      console.log(`ℹ️ Database already has ${userCount} users, skipping seed`);
    }

    // Create default admin if specified and doesn't exist
    if (process.env.DEFAULT_ADMIN_EMAIL) {
      const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', [process.env.DEFAULT_ADMIN_EMAIL]);
      if (adminCheck.rowCount === 0) {
        const rolesModule = await import('../config/roles.js');
        await pool.query(
          'INSERT INTO users (email, role, is_active) VALUES ($1, $2, true) ON CONFLICT (email) DO NOTHING',
          [process.env.DEFAULT_ADMIN_EMAIL, rolesModule.Roles.ADMIN]
        );
        console.log(`✅ Created default admin user: ${process.env.DEFAULT_ADMIN_EMAIL}`);
      }
    }
  } catch (err) {
    // If schema already exists, that's fine
    if (err.code === '42P07' || err.message.includes('already exists')) {
      console.log('ℹ️ Database tables already exist');
    } else {
      console.error('❌ Database initialization failed:', err.message);
      throw err;
    }
  }
}


