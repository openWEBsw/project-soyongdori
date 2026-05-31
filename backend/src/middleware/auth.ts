import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  memberId?: bigint;
  memberPosition?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      memberId: string;
      position: string;
    };
    req.memberId = BigInt(decoded.memberId);
    req.memberPosition = decoded.position;
    next();
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다' } });
  }
};