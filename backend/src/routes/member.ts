import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { getMyProfile, updateProfile, updateProfileImage, getMyPosts, getMyComments, getMemberProfile, getMemberStats } from '../controllers/profileController.js';

const router = Router();

// 홈 화면 통계  
router.get('/stats', getMemberStats);

// 내 프로필 조회 (프로필 이미지포함)
router.get('/me', authenticate, getMyProfile);

// 내 프로필 수정
router.post('/me', authenticate, updateProfile);

// 내 프로필 이미지 수정
router.post('/me/profile-image', authenticate, (req, res, next) => {
  uploadImage.single('profileImage')(req as any, res, (err: any) => {
    if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
    next();
  });
}, updateProfileImage);

// 내 게시글 조회
router.get('/me/posts', authenticate, getMyPosts);

// 내 댓글 조회
router.get('/me/comments', authenticate, getMyComments);

// 특정 멤버 프로필 조회
router.get('/:memberId', authenticate, getMemberProfile);


export default router;