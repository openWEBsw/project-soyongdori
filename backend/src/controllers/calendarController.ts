import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';
import { positionToLevel } from '../utils/permission.js';

const toBigInt = (v: string): bigint => BigInt(v);
const toStr = (v: string | string[]): string => Array.isArray(v) ? v[0] : v; //URL 쿼리가 배열로 올 때 대비.

// 1. 일정 조회
export const getEvents = async (req: AuthRequest, res: Response) => {
    const startStr = req.query.start as string | undefined;
    const endStr = req.query.end as string | undefined;
    const level = positionToLevel(req.memberPosition);

    const where: any = { deletedAt: null };

    //날자 필터    
    if (startStr || endStr) {
        where.startAt = {};
        if (startStr) where.startAt.gte = new Date(startStr);
        if (endStr) where.startAt.lte = new Date(endStr);
    }

    //가시성 필터
    if (level === 0) { //비회원
        where.visibility = "public";
    } else {
        where.OR = [
            { authorId: req.memberId },
            { visibility: { in: ['public', 'group'] } },
        ];
    }

    try {
        const events = await prisma.calendarEvent.findMany({
            where,
            include: { author: { select: { id: true, name: true } } },
            orderBy: { startAt: 'asc' },
        });
        return res.json({ data: events });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'server error'
            }
        })
    }
}

// 2. 일정 생성
export const createEvent = async (req: AuthRequest, res: Response) => {
    const { title, description, startAt, endAt, allDay, visibility, location, color } = req.body ?? {};
    const level = positionToLevel(req.memberPosition);

    // 제목, 시작일, 공개범위 필수 검증
    if (!title || !startAt || !visibility) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: '제목, 시작일, 공개범위는 필수입니다.',
            }
        })
    }
    // 공개 범위 검증
    if (!['personal', 'group', 'public'].includes(visibility)) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: '잘못된 공개범위입니다.'
            }
        });
    }

    // 권한 검증
    if (visibility !== 'personal' && level < 1) {
        return res.status(403).json({
            error: {
                code: 'FORBIDDEN',
                message: '공유 일정은 회원만 등록할 수 있습니다.'
            }
        });
    }

    try {
        const event = await prisma.calendarEvent.create({
            data: {
                authorId: req.memberId!,
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
        return res.status(201).json({
            data: event,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: '서버 오류'
            }
        });
    }
}

//3. 일정 수정
export const updateEvent = async (req: AuthRequest, res: Response) => {
    const eventId = toBigInt(toStr(req.params.eventId));
    const level = positionToLevel(req.memberPosition);
    const { title, description, startAt, endAt, allDay, visibility, location, color } = req.body ?? {};

    try {
        const event = await prisma.calendarEvent.findFirst({
            where: {
                id: eventId,
                deletedAt: null,
            }
        });
        if (!event) {
            return res.status(404).json({
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: '존재하지 않는 일정입니다.',
                }
            });
        }
        if (event.authorId !== req.memberId && level < 6) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: '수정 권한이 없습니다.',
                }
            });
        }

        const updated = await prisma.calendarEvent.update({
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
        return res.json({ data: updated });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: '서버 오류'
            }
        })
    }
}

// 4. 일정 삭제
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    const eventId = toBigInt(toStr(req.params.eventId));
    const level = positionToLevel(req.memberPosition);

    try {
        const event = await prisma.calendarEvent.findFirst({
            where: {
                id: eventId,
                deletedAt: null,
            }
        });
        if (!event) {
            return res.status(404).json({
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: '존재하지 않는 일정입니다.',
                }
            });
        }
        if (event.authorId !== req.memberId && level < 6) {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: '삭제 권한이 없습니다.',
                }
            })
        }

        await prisma.calendarEvent.update({
            where: { id: eventId },
            data: {
                deletedAt: new Date(),
            }
        });
        return res.json({ data: { success: true } });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: '서버 오류'
            }
        })
    }
}