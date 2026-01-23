import express from 'express';
import {
    getDashboardStats,
    getStudentStats,
    getInstructorStats,
    getAdminStats
} from './dashboard.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAnyRole } from '../../middlewares/rbac.middleware.js';
import { Roles } from '../../config/roles.js';

const router = express.Router();

// Get dashboard stats for current user (any authenticated user)
router.get('/', authMiddleware, getDashboardStats);

// Get specific student stats (admin/advisor or self)
router.get('/student/:email',
    authMiddleware,
    getStudentStats
);

// Get specific instructor stats (admin or self)
router.get('/instructor/:email',
    authMiddleware,
    getInstructorStats
);

// Get admin dashboard stats (admin only)
router.get('/admin',
    authMiddleware,
    requireAnyRole([Roles.ADMIN]),
    getAdminStats
);

export default router;
