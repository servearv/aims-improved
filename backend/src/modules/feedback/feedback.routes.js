import express from 'express';
import { authMiddleware as authenticateToken } from '../../middlewares/auth.middleware.js';
import { submitFeedback } from './feedback.controller.js';

const router = express.Router();

router.post('/courses/:courseId/feedback', authenticateToken, submitFeedback);

export default router;
