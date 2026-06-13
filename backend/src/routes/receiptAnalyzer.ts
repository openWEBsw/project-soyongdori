import { Router } from 'express';
import { authenticate, requireLevel } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import getReceiptAnalyze from '../controllers/receiptAnalyzerController.js';
const router = Router();

router.post('/analyze', authenticate, requireLevel(6), (req, res, next) => {
    upload.array('files', 20)(req as any, res, (err: any) => {
        if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
        next();
    });
}, getReceiptAnalyze);

export default router;