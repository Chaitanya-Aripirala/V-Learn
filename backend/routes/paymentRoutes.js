import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMentorEarnings,
  getStudentPayments,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/mentor/earnings', protect, getMentorEarnings);
router.get('/student/history', protect, getStudentPayments);
router.post('/webhook', handleWebhook);

export default router;
