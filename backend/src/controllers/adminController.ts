import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';
import { positionToLevel } from '../utils/permission.js';

// 회원 직책 enum 
const VALID_POSITIONS = [
    'member',
    'planning_member',
    'planning_leader',
    'treasurer',
    'vice_leader',
    'leader',
    'super_admin',
] as const;
type Position = typeof VALID_POSITIONS[number];

const VALID_STATUSES = ['pending', 'active', 'inactive'] as const;
type Status = typeof VALID_STATUSES[number];

// 1. 회원 목록 조회 (level≥5)
//    query: ?search=이름or이메일&status=active&position=member
export const listMembers = async (req: AuthRequest, res: Response) => {
    const search = (req.query.search as string | undefined) ?? '';
    const status = req.query.status as Status | undefined;
    const position = req.query.position as Position | undefined;

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (position && VALID_POSITIONS.includes(position)) where.position = position;

    try {
        const members = await prisma.member.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                studentId: true,
                phone: true,
                part: true,
                position: true,
                cohort: true,
                isCohortLead: true,
                status: true,
                approvedAt: true,
                createdAt: true,
            },
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        });
        return res.json({ data: members });
    } catch (e) {
        console.error('listMembers error:', e);
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: '서버 오류' }
        });
    }
};

// 2. 회원 직책 변경 (level≥6, 단 자기보다 낮은 레벨 대상만 + 자기 레벨 이하 직책만 부여)
export const updatePosition = async (req: AuthRequest, res: Response) => {
    const targetId = BigInt(req.params.id);
    const { position } = req.body ?? {};
    const myLevel = positionToLevel(req.memberPosition);

    if (!position || !VALID_POSITIONS.includes(position)) {
        return res.status(400).json({
            error: { code: 'VALIDATION_ERROR', message: '잘못된 직책입니다.' }
        });
    }

    try {
        const target = await prisma.member.findUnique({
            where: { id: targetId },
            select: { id: true, position: true },
        });
        if (!target) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다.' }
            });
        }

        const targetLevel = positionToLevel(target.position);
        const newLevel = positionToLevel(position);

        // 자기보다 높거나 같은 레벨은 못 건드림
        if (targetLevel >= myLevel) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: '자기 이상 직책의 회원은 변경할 수 없습니다.' }
            });
        }
        // 자기 레벨 이상의 직책 부여 금지
        if (newLevel >= myLevel) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: '자기 이상 직책으로 변경할 수 없습니다.' }
            });
        }

        const updated = await prisma.member.update({
            where: { id: targetId },
            data: { position: position as Position },
            select: { id: true, name: true, position: true, status: true },
        });
        return res.json({ data: updated });
    } catch (e) {
        console.error('updatePosition error:', e);
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: '서버 오류' }
        });
    }
};

// 3. 회원 활성/비활성 상태 변경 
export const updateStatus = async (req: AuthRequest, res: Response) => {
    const targetId = BigInt(req.params.id);
    const { status } = req.body ?? {};
    const myLevel = positionToLevel(req.memberPosition);

    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            error: { code: 'VALIDATION_ERROR', message: '잘못된 상태입니다.' }
        });
    }

    try {
        const target = await prisma.member.findUnique({
            where: { id: targetId },
            select: { id: true, position: true },
        });
        if (!target) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다.' }
            });
        }

        if (positionToLevel(target.position) >= myLevel) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: '자기 이상 직책의 회원은 변경할 수 없습니다.' }
            });
        }

        const updated = await prisma.member.update({
            where: { id: targetId },
            data: { status: status as Status },
            select: { id: true, name: true, position: true, status: true },
        });
        return res.json({ data: updated });
    } catch (e) {
        console.error('updateStatus error:', e);
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: '서버 오류' }
        });
    }
};
