import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createApplication, getMyApplication } from '../controllers/applicationController.js';

const router = Router();

router.post('/', authenticate, createApplication);
router.get('/me', authenticate, getMyApplication);

export default router;
