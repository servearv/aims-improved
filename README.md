# AIMS - Academic Information Management System

A comprehensive university management system with frontend and backend services.

## Project Structure

- **frontend/**: React + TypeScript frontend application
- **backend/**: Node.js + Express backend API
- **java_backend/**: Java Spring Boot backend (alternative)

## Quick Start

### Using Docker Compose (Recommended)

1. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Build and start all services:
```bash
docker-compose up --build
```

   Or run in detached mode:
```bash
docker-compose up -d --build
```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Database**: localhost:5432

4. Check logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
```

5. Stop services:
```bash
docker-compose down
```

**Note**: The database schema will be automatically initialized on first startup. In development mode (NODE_ENV=development), OTPs will be logged to the console for testing.

### Manual Setup

#### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (copy from `.env.example`)

4. Start the backend:
```bash
npm run dev
```

The backend will automatically initialize the database schema on first run.

#### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm run dev
```

## Backend API Endpoints

### Authentication
- `POST /auth/otp/request` - Request OTP for login
- `POST /auth/otp/verify` - Verify OTP and get JWT token
- `GET /health` - Health check

### Admin (requires authentication)
- `POST /admin/users` - Create new user (ADMIN only)

## Database Schema

The database schema is automatically initialized on server startup. See `backend/schema.sql` for the schema definition.

### Default Users

If `DEFAULT_ADMIN_EMAIL` is set in the environment, a default admin user will be created on first run.

To create additional users, use the admin API endpoint (requires admin authentication) or insert directly into the database.

## Docker Setup

✅ Frontend Dockerfile with multi-stage build (Nginx)  
✅ Backend Dockerfile with automatic schema initialization  
✅ Docker Compose configuration for all services  
✅ Proper networking and service dependencies  
✅ Environment variable configuration  
✅ Removed unnecessary files and configurations

## Features Fixed

✅ Fixed OTP model parameter passing issues  
✅ Fixed admin service User model references  
✅ Fixed RBAC middleware function names  
✅ Created database schema initialization  
✅ Made mailer verification optional  
✅ Fixed Role imports  
✅ Added backend API client utilities  
✅ Added automatic database initialization  
✅ Added development mode OTP logging  

## Development Notes

- In development mode, OTPs are logged to the console for testing
- Email sending is optional - if SMTP is not configured, the backend will still work
- The frontend uses client-side OTP by default, but can be configured to use the backend API
