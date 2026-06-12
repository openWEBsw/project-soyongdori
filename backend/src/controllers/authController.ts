import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

//회원가입
export const signup = async (req: Request, res: Response) => {
  console.log('signup called', req.body);
  const { email, password, name, studentId, phone, department } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'email, password, name required' } });
  }

  try {
    const exists = await prisma.member.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, error: { code: 'EMAIL_DUPLICATE', message: 'email already exists' } });
    }
    if (studentId) {
      const idExists = await prisma.member.findUnique({ where: { studentId } });
      if (idExists) {
        return res.status(409).json({ success: false, error: { code: 'STUDENT_ID_DUPLICATE', message: 'student id already exists' } });
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const member = await prisma.member.create({
      data: { email, passwordHash, name, studentId, phone, department, position: 'not_member' },
      select: { id: true, email: true, name: true, status: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('signup error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'server error' } });
  }
};


//로그인
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'email and password required' } });
  }

  try {
    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } });
    }
    if (member.status === 'inactive') {
      return res.status(403).json({ success: false, error: { code: 'INACTIVE_ACCOUNT', message: 'account inactive' } });
    }
    const isMatch = await bcrypt.compare(password, member.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } });
    }
    const accessToken = generateAccessToken({
      memberId: member.id.toString(),
      position: member.position,
    });
    const refreshToken = generateRefreshToken(member.id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return res.json({
      success: true,
      data: {
        token: accessToken,
        member: {
          id: member.id.toString(),
          email: member.email,
          name: member.name,
          position: member.position,
          status: member.status,
          profileImageUrl: member.profileImageUrl,
        },
      },
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'server error' } });
  }
};

//refresh
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: { code: 'MISSING_REFRESH_TOKEN', message: 'refresh token required' },
    });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'invalid refresh token' },
    });
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id: BigInt(payload.memberId) },
      select: { id: true, position: true, status: true },
    });
    if (!member || member.status === 'inactive') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'invalid refresh token' },
      });
    }

    const newAccessToken = generateAccessToken({
      memberId: member.id.toString(),
      position: member.position,
    });
    return res.json({ success: true, data: { token: newAccessToken } });
  } catch (error) {
    console.error('refresh error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'server error' },
    });
  }
};

// logout
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
  return res.json({ success: true });
};
