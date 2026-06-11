import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { positionToLevel } from '../utils/permission.js';
import { ServiceError } from '../services/calendarService.js';
import * as adminService from '../services/adminService.js';

const handleError = (e: unknown, res: Response) => {
    if (e instanceof ServiceError) {
        return res.status(e.status).json({ error: { code: e.code, message: e.message } });
    }
    console.error(e);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
};

// 회원 목록 조회
export const listMembers = async (req: AuthRequest, res: Response) => {
    try {
        const members = await adminService.listMembers({
            search: (req.query.search as string) ?? '',
            status: req.query.status as string | undefined,
            position: req.query.position as string | undefined,
        });
        return res.json({ data: members });
    } catch (e) {
        return handleError(e, res);
    }
};

// 직책 변경
export const updatePosition = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await adminService.updatePosition({
            targetId: BigInt(req.params.id as string),
            position: req.body?.position,
            myLevel: positionToLevel(req.memberPosition),
        });
        return res.json({ data: updated });
    } catch (e) {
        return handleError(e, res);
    }
};

// 상태 변경
export const updateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await adminService.updateStatus({
            targetId: BigInt(req.params.id as string),
            status: req.body?.status,
            myLevel: positionToLevel(req.memberPosition),
        });
        return res.json({ data: updated });
    } catch (e) {
        return handleError(e, res);
    }
};
