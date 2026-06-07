import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/calendarController.js';

const router = Router();

router.get('/events', optionalAuth, getEvents);    // 조회: 비회원도 OK
router.post('/events', authenticate, createEvent);  // 생성: 로그인 필수
router.patch('/events/:eventId', authenticate, updateEvent);  // 수정: 로그인 필수
router.delete('/events/:eventId', authenticate, deleteEvent);  // 삭제: 로그인 필수

export default router;