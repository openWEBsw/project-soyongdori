import prisma from '../prisma/client.js';
import { positionToLevel } from '../utils/permission.js';
import { ServiceError } from './calendarService.js';

const VALID_POSITIONS = [
    'member', 'planning_member', 'planning_lead',
    'treasurer', 'vice_leader', 'leader', 'super_admin',
] as const;
type Position = typeof VALID_POSITIONS[number];

const VALID_STATUSES = ['pending', 'active', 'inactive'] as const;
type Status = typeof VALID_STATUSES[number];

// 회원 목록 조회
export const listMembers = async (params: {
    search: string;
    status?: string;
    position?: string;
}) => {
    const { search, status, position } = params;
    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    if (status && VALID_STATUSES.includes(status as Status)) where.status = status;
    if (position && VALID_POSITIONS.includes(position as Position)) where.position = position;

    return prisma.member.findMany({
        where,
        select: {
            id: true, email: true, name: true, studentId: true,
            phone: true, part: true, position: true, cohort: true,
            isCohortLead: true, status: true, approvedAt: true, createdAt: true,
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
};

// 직책 변경
export const updatePosition = async (params: {
    targetId: bigint;
    position: string;
    myLevel: number;
}) => {
    const { targetId, position, myLevel } = params;

    if (!position || !VALID_POSITIONS.includes(position as Position)) {
        throw new ServiceError(400, 'VALIDATION_ERROR', '잘못된 직책입니다.');
    }

    const target = await prisma.member.findUnique({
        where: { id: targetId },
        select: { id: true, position: true },
    });
    if (!target) throw new ServiceError(404, 'NOT_FOUND', '회원을 찾을 수 없습니다.');
    if (positionToLevel(target.position) >= myLevel)
        throw new ServiceError(403, 'FORBIDDEN', '자기 이상 직책의 회원은 변경할 수 없습니다.');
    if (positionToLevel(position) >= myLevel)
        throw new ServiceError(403, 'FORBIDDEN', '자기 이상 직책으로 변경할 수 없습니다.');

    return prisma.member.update({
        where: { id: targetId },
        data: { position: position as Position },
        select: { id: true, name: true, position: true, status: true },
    });
};

// 상태 변경
export const updateStatus = async (params: {
    targetId: bigint;
    status: string;
    myLevel: number;
}) => {
    const { targetId, status, myLevel } = params;

    if (!status || !VALID_STATUSES.includes(status as Status)) {
        throw new ServiceError(400, 'VALIDATION_ERROR', '잘못된 상태입니다.');
    }

    const target = await prisma.member.findUnique({
        where: { id: targetId },
        select: { id: true, position: true },
    });
    if (!target) throw new ServiceError(404, 'NOT_FOUND', '회원을 찾을 수 없습니다.');
    if (positionToLevel(target.position) >= myLevel)
        throw new ServiceError(403, 'FORBIDDEN', '자기 이상 직책의 회원은 변경할 수 없습니다.');

    return prisma.member.update({
        where: { id: targetId },
        data: { status: status as Status },
        select: { id: true, name: true, position: true, status: true },
    });
};
