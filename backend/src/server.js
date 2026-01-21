import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initDatabase } from './config/init-db.js';

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize database schema
    await initDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`AIMS backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
