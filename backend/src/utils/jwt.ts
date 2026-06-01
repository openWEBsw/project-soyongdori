import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const JWT_ACCESS_EXPIRE = (process.env.JWT_ACCESS_EXPIRE || '15m') as SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRE = (process.env.JWT_REFRESH_EXPIRE || '7d') as SignOptions['expiresIn'];

export interface AccessPayload {
    memberId: string;
    position: string | null;
}

// Access token 발급
export function generateAccessToken(payload: AccessPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRE });
}

// Refresh token 발급
export function generateRefreshToken(memberId: string): string {
    return jwt.sign({ memberId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
}

export function verifyAccessToken(token: string): AccessPayload | null {
    try { return jwt.verify(token, JWT_SECRET) as AccessPayload; }
    catch { return null; }
}

export function verifyRefreshToken(token: string): { memberId: string } | null {
    try { return jwt.verify(token, JWT_REFRESH_SECRET) as { memberId: string }; }
    catch { return null; }
}