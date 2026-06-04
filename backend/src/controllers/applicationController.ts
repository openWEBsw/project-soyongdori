import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

export const createApplication = async (req: AuthRequest, res: Response) => {
  const { part, motivation } = req.body;

  if (!part) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '파트를 선택해주세요' } });
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id: req.memberId! },
      select: { email: true, name: true, studentId: true, phone: true, applicationId: true },
    });

    if (!member) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다' } });
    }

    if (member.applicationId) {
      return res.status(409).json({ error: { code: 'ALREADY_APPLIED', message: '이미 입부신청을 완료했습니다' } });
    }

    const application = await prisma.joinApplication.create({
      data: {
        email: member.email,
        name: member.name,
        studentId: member.studentId,
        phone: member.phone,
        part: part as any,
        motivation: motivation || null,
        member: { connect: { id: req.memberId! } },
      },
    });

    return res.status(201).json({ data: application });
  } catch (error) {
    console.error('createApplication error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

export const getMyApplication = async (req: AuthRequest, res: Response) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.memberId! },
      select: {
        application: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다' } });
    }

    return res.json({ data: member.application });
  } catch (error) {
    console.error('getMyApplication error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};


// Admin

// 입부 신청 목록 (level≥6). query: ?status=pending (기본값)
export const listApplications = async (req: AuthRequest, res: Response) => {
  const status = (req.query.status as string | undefined) ?? 'pending';
  const valid = ['pending', 'approved', 'rejected'];

  const where: any = {};
  if (valid.includes(status)) where.status = status;

  try {
    const apps = await prisma.joinApplication.findMany({
      where,
      include: {
        member: { select: { id: true, name: true, email: true, status: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ data: apps });
  } catch (error) {
    console.error('listApplications error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

// 입부 신청 승인 — application.status='approved', member.status='active'+approvedAt
export const approveApplication = async (req: AuthRequest, res: Response) => {
  const appId = BigInt(req.params.id);

  try {
    const app = await prisma.joinApplication.findUnique({
      where: { id: appId },
      include: { member: { select: { id: true } } },
    });
    if (!app) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '신청을 찾을 수 없습니다.' } });
    }
    if (app.status !== 'pending') {
      return res.status(409).json({ error: { code: 'ALREADY_REVIEWED', message: '이미 처리된 신청입니다.' } });
    }

    const now = new Date();
    const [updatedApp] = await prisma.$transaction([
      prisma.joinApplication.update({
        where: { id: appId },
        data: { status: 'approved', reviewedBy: req.memberId!, reviewedAt: now },
      }),
      ...(app.member
        ? [prisma.member.update({
            where: { id: app.member.id },
            data: { status: 'active', approvedAt: now, position: 'member' },
          })]
        : []),
    ]);

    return res.json({ data: updatedApp });
  } catch (error) {
    console.error('approveApplication error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};

// 입부 신청 거절 — application.status='rejected', member.status='inactive'
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  const appId = BigInt(req.params.id);
  const { reviewNote } = req.body ?? {};

  try {
    const app = await prisma.joinApplication.findUnique({
      where: { id: appId },
      include: { member: { select: { id: true } } },
    });
    if (!app) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '신청을 찾을 수 없습니다.' } });
    }
    if (app.status !== 'pending') {
      return res.status(409).json({ error: { code: 'ALREADY_REVIEWED', message: '이미 처리된 신청입니다.' } });
    }

    const now = new Date();
    const [updatedApp] = await prisma.$transaction([
      prisma.joinApplication.update({
        where: { id: appId },
        data: { status: 'rejected', reviewedBy: req.memberId!, reviewedAt: now, reviewNote: reviewNote ?? null },
      }),
      ...(app.member
        ? [prisma.member.update({
            where: { id: app.member.id },
            data: { status: 'inactive' },
          })]
        : []),
    ]);

    return res.json({ data: updatedApp });
  } catch (error) {
    console.error('rejectApplication error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
  }
};