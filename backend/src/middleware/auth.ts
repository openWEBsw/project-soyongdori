import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import positionToLevel from '../utils/permission.js';

export interface AuthRequest extends Request {
  memberId?: bigint;
  memberPosition?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 헤더 없음 -> 막음
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      memberId: string;
      position: string;
    };
    req.memberId = BigInt(decoded.memberId); //성공
    req.memberPosition = decoded.position;
    next();
  } catch {
    //토큰 깨짐
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다' } });
  }
};

// 비회원도 조회 가능.
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 헤더 없음 -> 비회원으로 그냥 통과 
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      memberId: string;
      position: string;
    };
    req.memberId = BigInt(decoded.memberId);   // 성공 -> 회원 신원 심기
    req.memberPosition = decoded.position;
    next();
  } catch {
    // 토큰 깨짐 -> 비회원 취급해서 통과
    next();
  }
};

export const requireLevel = (min: number) => {
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (positionToLevel(req.memberPosition) < min) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: '권한이 없습니다.'
        }
      });
    }
    next();
  };
};