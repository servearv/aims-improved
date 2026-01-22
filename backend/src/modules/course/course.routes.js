import express from 'express';
import { getAllCourses, getCourseById, createCourseHandler, updateCourseHandler, enrollInCourse, getCourseEnrollmentsHandler, enrollBatchHandler, getRegistrationRequests, updateRegistrationStatusHandler } from './course.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAnyRole } from '../../middlewares/rbac.middleware.js';
import { Roles } from '../../config/roles.js';

const router = express.Router();

// Get all courses (public for authenticated users)
router.get('/', authMiddleware, getAllCourses);

// Get course by ID
router.get('/:courseId', authMiddleware, getCourseById);

// Enroll in course
router.post('/enroll', authMiddleware, enrollInCourse);

// Batch Enroll
router.post('/:courseId/enroll-batch',
  authMiddleware,
  requireAnyRole([Roles.INSTRUCTOR, Roles.ADMIN]),
  enrollBatchHandler
);

// Get registration requests (for advisors/instructors to approve)
router.get('/requests',
  authMiddleware,
  requireAnyRole([Roles.INSTRUCTOR, Roles.ADVISOR, Roles.ADMIN]),
  getRegistrationRequests
);

// Update registration status
router.patch('/requests/:id',
  authMiddleware,
  requireAnyRole([Roles.INSTRUCTOR, Roles.ADVISOR, Roles.ADMIN]),
  updateRegistrationStatusHandler
);

// Get course enrollments (instructor/admin only)
router.get('/:courseId/enrollments',
  authMiddleware,
  requireAnyRole([Roles.INSTRUCTOR, Roles.ADMIN]),
  getCourseEnrollmentsHandler
);

// Create course (admin/instructor only)
router.post('/',
  authMiddleware,
  requireAnyRole([Roles.ADMIN, Roles.INSTRUCTOR]),
  createCourseHandler
);

// Update course (admin/instructor only)
router.put('/:courseId',
  authMiddleware,
  requireAnyRole([Roles.ADMIN, Roles.INSTRUCTOR]),
  updateCourseHandler
);

export default router;

