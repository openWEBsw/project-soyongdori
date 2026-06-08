import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import getReceiptAnalyze from '../controllers/receiptAnalyzerController.js';

const router = Router();

router.post('/analyze', authenticate, getReceiptAnalyze);

export default router;