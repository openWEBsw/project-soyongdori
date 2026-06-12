import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const toBigInt = (val: string): bigint => BigInt(val);
const toStr = (val: string | string[]): string => Array.isArray(val) ? val[0] : val;

const PUBLIC_BOARDS = ['free', 'notice'];

const FULL_ACCESS_POSITIONS = ['vice_leader', 'leader', 'super_admin'];
const BUDGET_WRITE_POSITIONS = ['treasurer', ...FULL_ACCESS_POSITIONS];
const LEAD_WRITE_POSITIONS = ['planning_lead', ...BUDGET_WRITE_POSITIONS];
const MEMBER_WRITE_POSITIONS = ['member', 'planning_member', ...LEAD_WRITE_POSITIONS];

function canWriteBoard(boardType: string, position: string | undefined): boolean {
  if (!position) return false;
  if (boardType === 'notice') return ['leader', 'super_admin'].includes(position);
  if (boardType === 'free' || boardType === 'photo') return MEMBER_WRITE_POSITIONS.includes(position);
  if (boardType === 'resource' || boardType === 'planning') return LEAD_WRITE_POSITIONS.includes(position);
  if (boardType === 'budget') return BUDGET_WRITE_POSITIONS.includes(position);
  return false;
}

export const getPosts = async (req: AuthRequest, res: Response) => {
  const boardType = toStr(req.params.boardType);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const year = new Date().getFullYear();
  const search = (req.query.search as string | undefined)?.trim();
  const searchField = (req.query.searchField as string) || 'title';

  if (!PUBLIC_BOARDS.includes(boardType) && !req.memberId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
  }

  try {
    const board = await prisma.board.findFirst({
      where: { type: boardType as any, year },
    });

    if (!board) {
      return res.status(404).json({ error: { code: 'BOARD_NOT_FOUND', message: '게시판을 찾을 수 없습니다' } });
    }

    const searchCondition = search
      ? searchField === 'content'
        ? { content: { contains: search } }
        : searchField === 'author'
        ? { author: { name: { contains: search } } }
        : { title: { contains: search } }
      : {};

    const baseWhere = { boardId: board.id, deletedAt: null, isHidden: false, ...searchCondition };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: baseWhere,
        include: {
          author: { select: { id: true, name: true, part: true, cohort: true, profileImageUrl: true } },
          _count: { select: { comments: true } },
          attachments: { where: { mimeType: { startsWith: 'image/' } }, take: 1, select: { filePath: true } },
        },
        orderBy: [{ isNotice: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where: baseWhere }),
    ]);

    return res.json({
      data: {
        posts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

// 홈 화면 공지 미리보기 - 최근 공지글 3개
export const getRecentNotices = async (req: AuthRequest, res: Response) => {
  const year = new Date().getFullYear();

  try {
    const board = await prisma.board.findFirst({
      where: { type: 'notice', year },
    });

    if (!board) {
      return res.json({ data: [] });
    }

    const posts = await prisma.post.findMany({
      where: { boardId: board.id, deletedAt: null, isHidden: false },
      select: {
        id: true,
        title: true,
        content: true,
        viewCount: true,
        createdAt: true,
      },
      orderBy: [{ isNotice: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    });

    return res.json({ data: posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  const postId = toStr(req.params.postId);

  try {
    const post = await prisma.post.findFirst({
      where: { id: toBigInt(postId), deletedAt: null, isHidden: false },
      include: {
        board: { select: { type: true } },
        author: { select: { name: true, part: true, cohort: true, profileImageUrl: true } },
        comments: {
          where: { deletedAt: null },
          include: { author: { select: { name: true, part: true, cohort: true, profileImageUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: '게시글을 찾을 수 없습니다' } });
    }

    if (!PUBLIC_BOARDS.includes(post.board.type) && !req.memberId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    return res.json({ data: post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const incrementView = async (req: AuthRequest, res: Response) => {
  const postId = toStr(req.params.postId);
  try {
    await prisma.post.update({
      where: { id: toBigInt(postId) },
      data: { viewCount: { increment: 1 } },
    });
    return res.json({ data: { ok: true } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  const boardType = toStr(req.params.boardType);
  const body = req.body ?? {};
  const title = (body.title as string | undefined)?.trim();
  const content = (body.content as string | undefined)?.trim();
  const memFiles = (req.files as Express.Multer.File[]) || [];
  const year = new Date().getFullYear();

  if (!title || !content) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '제목과 내용을 입력해주세요' } });
  }

  if (!canWriteBoard(boardType, req.memberPosition)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: '해당 게시판에 글쓰기 권한이 없습니다' } });
  }

  try {
    const board = await prisma.board.findFirst({
      where: { type: boardType as any, year },
    });

    if (!board) {
      return res.status(404).json({ error: { code: 'BOARD_NOT_FOUND', message: '게시판을 찾을 수 없습니다' } });
    }

    const savedFiles = await Promise.all(memFiles.map(async f => {
      const originalname = Buffer.from(f.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalname);
      const filename = `${crypto.randomBytes(12).toString('hex')}${ext}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), f.buffer);
      return { filename, originalname, size: f.size, mimetype: f.mimetype };
    }));

    const post = await prisma.post.create({
      data: {
        boardId: board.id,
        authorId: req.memberId!,
        title,
        content,
        attachments: savedFiles.length > 0 ? {
          create: savedFiles.map(f => ({
            fileName: f.filename,
            originalFileName: f.originalname,
            fileSize: f.size,
            mimeType: f.mimetype,
            filePath: `/uploads/${f.filename}`,
          })),
        } : undefined,
      },
      include: { attachments: true },
    });

    return res.status(201).json({ data: post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const postId = toStr(req.params.postId);
  const { title, content } = req.body;
  const memFiles = (req.files as Express.Multer.File[]) || [];

  let deleteIds: bigint[] = [];
  try {
    const raw = req.body.deleteAttachmentIds;
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      deleteIds = Array.isArray(parsed) ? parsed.map((id: string) => BigInt(id)) : [];
    }
  } catch {}

  try {
    const post = await prisma.post.findFirst({
      where: { id: toBigInt(postId), deletedAt: null },
    });

    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: '게시글을 찾을 수 없습니다' } });
    }

    if (post.authorId !== req.memberId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다' } });
    }

    if (deleteIds.length > 0) {
      const toDelete = await prisma.postAttachment.findMany({
        where: { id: { in: deleteIds }, postId: toBigInt(postId) },
      });
      await Promise.all(toDelete.map(att =>
        fs.promises.unlink(path.join(uploadsDir, att.fileName)).catch(() => {})
      ));
      await prisma.postAttachment.deleteMany({
        where: { id: { in: deleteIds }, postId: toBigInt(postId) },
      });
    }

    const savedFiles = await Promise.all(memFiles.map(async f => {
      const originalname = Buffer.from(f.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalname);
      const filename = `${crypto.randomBytes(12).toString('hex')}${ext}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), f.buffer);
      return { filename, originalname, size: f.size, mimetype: f.mimetype };
    }));

    const updated = await prisma.post.update({
      where: { id: toBigInt(postId) },
      data: {
        title,
        content,
        attachments: savedFiles.length > 0 ? {
          create: savedFiles.map(f => ({
            fileName: f.filename,
            originalFileName: f.originalname,
            fileSize: f.size,
            mimeType: f.mimetype,
            filePath: `/uploads/${f.filename}`,
          })),
        } : undefined,
      },
      include: { attachments: true },
    });

    return res.json({ data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const postId = toStr(req.params.postId);

  try {
    const post = await prisma.post.findFirst({
      where: { id: toBigInt(postId), deletedAt: null },
    });

    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: '게시글을 찾을 수 없습니다' } });
    }

    if (post.authorId !== req.memberId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다' } });
    }

    await prisma.post.update({
      where: { id: toBigInt(postId) },
      data: { deletedAt: new Date() },
    });

    return res.json({ data: { message: '게시글이 삭제됐습니다' } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const postId = toStr(req.params.postId);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '댓글 내용을 입력해주세요' } });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId: toBigInt(postId),
        authorId: req.memberId!,
        content,
      },
    });

    return res.status(201).json({ data: comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  const commentId = toStr(req.params.commentId);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '댓글 내용을 입력해주세요' } });
  }

  try {
    const comment = await prisma.comment.findFirst({
      where: { id: toBigInt(commentId), deletedAt: null },
    });

    if (!comment) {
      return res.status(404).json({ error: { code: 'COMMENT_NOT_FOUND', message: '댓글을 찾을 수 없습니다' } });
    }

    if (comment.authorId !== req.memberId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다' } });
    }

    const updated = await prisma.comment.update({
      where: { id: toBigInt(commentId) },
      data: { content },
    });

    return res.json({ data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const commentId = toStr(req.params.commentId);

  try {
    const comment = await prisma.comment.findFirst({
      where: { id: toBigInt(commentId), deletedAt: null },
    });

    if (!comment) {
      return res.status(404).json({ error: { code: 'COMMENT_NOT_FOUND', message: '댓글을 찾을 수 없습니다' } });
    }

    if (comment.authorId !== req.memberId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다' } });
    }

    await prisma.comment.update({
      where: { id: toBigInt(commentId) },
      data: { deletedAt: new Date() },
    });

    return res.json({ data: { message: '댓글이 삭제됐습니다' } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};