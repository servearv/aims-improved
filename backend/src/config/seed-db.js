import 'dotenv/config';
import pool, { waitForDatabase } from './db.js';
import { initDatabase } from './init-db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    try {
        // Wait for database to be ready first
        await waitForDatabase();

        // Ensure tables exist
        console.log('📦 Initializing schema...');
        await initDatabase();

        const seedPath = path.join(__dirname, '../../seed.sql');
        if (!fs.existsSync(seedPath)) {
            console.error('❌ Seed file not found at:', seedPath);
            process.exit(1);
        }
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('🌱 Seeding database...');
        await pool.query(seedSql);
        console.log('✅ Database seeded successfully');
        process.exit(0);

    } catch (err) {
        console.error('❌ Database seeding failed:', err.message);
        process.exit(1);
    }
}

seedDatabase();
