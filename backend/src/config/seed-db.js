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
        let seedSql = fs.readFileSync(seedPath, 'utf8');

        // Filter out psql meta-commands (lines starting with \) as they cannot be executed via pg driver
        seedSql = seedSql
            .split('\n')
            .filter(line => !line.trim().startsWith('\\'))
            .join('\n');

        // Truncate all tables before seeding to allow re-running
        console.log('🧹 Clearing existing data...');
        await pool.query(`
            TRUNCATE TABLE 
                student_payments,
                student_records,
                course_feedback,
                student_courses,
                course_instructors,
                course_offerings,
                pending_course_offerings,
                crediting_categorization,
                email_verifications,
                courses,
                slots,
                students,
                faculty_advisors,
                instructors,
                departments,
                academic_sessions,
                users
            RESTART IDENTITY CASCADE
        `);

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
