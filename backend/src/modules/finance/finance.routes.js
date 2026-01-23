
import express from 'express';
import { authMiddleware as authenticateToken } from '../../middlewares/auth.middleware.js';
import { makePayment, getHistory } from './finance.controller.js';

const router = express.Router();

router.post('/payments', authenticateToken, makePayment);
router.get('/history', authenticateToken, getHistory);

export default router;
