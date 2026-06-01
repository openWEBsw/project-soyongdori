import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const signup = async (req: Request, res: Response) => {
  console.log('signup called', req.body);
  const { email, password, name, studentId, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email, password, name required' } });
  }

  try {
    const exists = await prisma.member.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: { code: 'EMAIL_DUPLICATE', message: 'email already exists' } });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const member = await prisma.member.create({
      data: { email, passwordHash, name, studentId, phone },
      select: { id: true, email: true, name: true, status: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('signup error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'server error' } });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email and password required' } });
  }

  try {
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } });
    }
    if (member.status === 'inactive') {
      return res.status(403).json({ error: { code: 'INACTIVE_ACCOUNT', message: 'account inactive' } });
    }
    const isMatch = await bcrypt.compare(password, member.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } });
    }
    const token = jwt.sign(
      { memberId: member.id.toString(), position: member.position },
      JWT_SECRET,
      { expiresIn: '15m' } // Access token 만료시간 15분으로 변경
    );
    await prisma.member.update({
      where: { id: member.id },
      data: { approvedAt: member.approvedAt ?? new Date() },
    });
    return res.json({
      data: {
        token,
        member: {
          id: member.id.toString(),
          email: member.email,
          name: member.name,
          position: member.position,
          status: member.status,
        },
      },
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'server error' } });
  }
};
