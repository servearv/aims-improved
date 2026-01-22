import express from 'express';
import { getStudentRecord, getStudentRecordById, getStudentCourses } from './student.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAnyRole } from '../../middlewares/rbac.middleware.js';
import { Roles } from '../../config/roles.js';

const router = express.Router();

// Get own student record
router.get('/record', authMiddleware, getStudentRecord);

// Get student courses (optionally filtered by semester)
router.get('/courses', authMiddleware, getStudentCourses);

// Get any student's record (admin only or self)
router.get('/record/:email', authMiddleware, getStudentRecordById);

export default router;

