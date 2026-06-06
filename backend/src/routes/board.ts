import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getPosts,
  getPost,
  incrementView,
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/boardController.js';

const router = Router();

// 게시글 목록
router.get('/:boardType/posts', optionalAuth, getPosts);

// 게시글 작성
router.post('/:boardType/posts', authenticate, (req, res, next) => {
  upload.array('files', 5)(req as any, res, (err: any) => {
    if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
    next();
  });
}, createPost);

// 게시글 상세
router.get('/posts/:postId', optionalAuth, getPost);

// 조회수 증가
router.patch('/posts/:postId/view', optionalAuth, incrementView);

// 게시글 수정
router.put('/posts/:postId', authenticate, (req, res, next) => {
  upload.array('files', 5)(req as any, res, (err: any) => {
    if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
    next();
  });
}, updatePost);

// 게시글 삭제
router.delete('/posts/:postId', authenticate, deletePost);

// 댓글 작성
router.post('/posts/:postId/comments', authenticate, createComment);

// 댓글 수정
router.put('/comments/:commentId', authenticate, updateComment);

// 댓글 삭제
router.delete('/comments/:commentId', authenticate, deleteComment);

export default router;