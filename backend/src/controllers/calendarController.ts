import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';
import { positionToLevel } from '../utils/permission.js';

const toBigInt = (v: string): bigint => BigInt(v);
const toStr = (v: string | string[]): string => Array.isArray(v) ? v[0] : v; //URL 쿼리가 배열로 올 때 대비.

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
    if (level == 0) { //비회원
        where.visibility = "public";
    } else {
        where.OR = [
            { authorID: req.memberId },
            { visibility: { in: ['pulic', 'group'] } },
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