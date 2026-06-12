//TODO: member.ts 로 추후에 나누기

import { Router } from 'express';
import { authenticate, requireLevel } from '../middleware/auth.js';
import {
    listMembers,
    updatePosition,
    updateStatus,
    updatePart,
    updateCohort,
} from '../controllers/adminController.js';
import {
    listApplications,
    approveApplication,
    rejectApplication
} from '../controllers/applicationController.js'


const router = Router();
router.use(authenticate);

router.get('/members', requireLevel(5), listMembers);
router.patch('/member/:id/position', requireLevel(6), updatePosition);
<<<<<<< HEAD
router.patch('/member/:id/status', requireLevel(5), updateStatus);
=======
router.patch('/member/:id/status', requireLevel(6), updateStatus);
router.patch('/member/:id/part', requireLevel(6), updatePart);
router.patch('/member/:id/cohort', requireLevel(6), updateCohort);
>>>>>>> feature/insoo-home-style

router.get('/applications', requireLevel(6), listApplications);
router.post('/applications/:id/approve', requireLevel(6), approveApplication);
router.post('/applications/:id/reject', requireLevel(6), rejectApplication);

export default router;