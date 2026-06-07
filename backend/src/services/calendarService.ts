import prisma from '../prisma/client.js';

export class ServiceError extends Error {
    constructor(public status: number, public code: string, message: string) {
        super(message);
    }
}

// 1. 일정 조회
export const getEvents = async (params: {
    memberId?: bigint;
    level: number;
    start?: string;
    end?: string;
}) => {
    const { memberId, level, start, end } = params;

    const where: any = { deletedAt: null };

    //날자 필터
    if (start || end) {
        where.startAt = {};
        if (start) where.startAt.gte = new Date(start);
        if (end) where.startAt.lte = new Date(end);
    }

    //가시성 필터
    if (level === 0) { //비회원
        where.visibility = "public";
    } else {
        where.OR = [
            { authorId: memberId },
            { visibility: { in: ['public', 'group'] } },
        ];
    }

    return prisma.calendarEvent.findMany({
        where,
        include: { author: { select: { id: true, name: true } } },
        orderBy: { startAt: 'asc' },
    });
};

// 2. 일정 생성
export const createEvent = async (params: {
    memberId: bigint;
    level: number;
    body: any;
}) => {
    const { memberId, level, body } = params;
    const { title, description, startAt, endAt, allDay, visibility, location, color } = body ?? {};

    // 제목, 시작일, 공개범위 필수 검증
    if (!title || !startAt || !visibility) {
        throw new ServiceError(400, 'VALIDATION_ERROR', '제목, 시작일, 공개범위는 필수입니다.');
    }
    // 공개 범위 검증
    if (!['personal', 'group', 'public'].includes(visibility)) {
        throw new ServiceError(400, 'VALIDATION_ERROR', '잘못된 공개범위입니다.');
    }

    // 권한 검증
    if (visibility !== 'personal' && level < 1) {
        throw new ServiceError(403, 'FORBIDDEN', '공유 일정은 회원만 등록할 수 있습니다.');
    }

    return prisma.calendarEvent.create({
        data: {
            authorId: memberId,
            title,
            description: description ?? null,
            startAt: new Date(startAt),
            endAt: endAt ? new Date(endAt) : null,
            allDay: allDay ?? false,
            visibility,
            location: location ?? null,
            color: color ?? null,
        },
    });
};

//3. 일정 수정
export const updateEvent = async (params: {
    eventId: bigint;
    memberId?: bigint;
    level: number;
    body: any;
}) => {
    const { eventId, memberId, level, body } = params;
    const { title, description, startAt, endAt, allDay, visibility, location, color } = body ?? {};

    const event = await prisma.calendarEvent.findFirst({
        where: {
            id: eventId,
            deletedAt: null,
        }
    });
    if (!event) {
        throw new ServiceError(404, 'EVENT_NOT_FOUND', '존재하지 않는 일정입니다.');
    }
    if (event.authorId !== memberId && level < 6) {
        throw new ServiceError(403, 'FORBIDDEN', '수정 권한이 없습니다.');
    }

    return prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(startAt !== undefined && { startAt: new Date(startAt) }),
            ...(endAt !== undefined && { endAt: new Date(endAt) }),
            ...(allDay !== undefined && { allDay }),
            ...(visibility !== undefined && { visibility }),
            ...(location !== undefined && { location }),
            ...(color !== undefined && { color }),
        }
    });
};

// 4. 일정 삭제
export const deleteEvent = async (params: {
    eventId: bigint;
    memberId?: bigint;
    level: number;
}) => {
    const { eventId, memberId, level } = params;

    const event = await prisma.calendarEvent.findFirst({
        where: {
            id: eventId,
            deletedAt: null,
        }
    });
    if (!event) {
        throw new ServiceError(404, 'EVENT_NOT_FOUND', '존재하지 않는 일정입니다.');
    }
    if (event.authorId !== memberId && level < 6) {
        throw new ServiceError(403, 'FORBIDDEN', '삭제 권한이 없습니다.');
    }

    await prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
            deletedAt: new Date(),
        }
    });
};
