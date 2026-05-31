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
