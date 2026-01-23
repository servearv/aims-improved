import express from 'express';
import { getAdviseesHandler, getAdviseeProgressHandler, getPendingRequestsHandler } from './advisor.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requireAnyRole } from '../../middlewares/rbac.middleware.js';
import { Roles } from '../../config/roles.js';

const router = express.Router();

// Get list of advisees (advisor only)
router.get('/advisees',
    authMiddleware,
    requireAnyRole([Roles.ADVISOR, Roles.ADMIN]),
    getAdviseesHandler
);

// Get specific advisee's academic progress
router.get('/advisees/:email/progress',
    authMiddleware,
    requireAnyRole([Roles.ADVISOR, Roles.ADMIN]),
    getAdviseeProgressHandler
);

// Get pending registration requests for advisees
router.get('/pending-requests',
    authMiddleware,
    requireAnyRole([Roles.ADVISOR, Roles.ADMIN]),
    getPendingRequestsHandler
);

export default router;
