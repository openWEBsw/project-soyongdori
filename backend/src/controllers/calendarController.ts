import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { positionToLevel } from '../utils/permission.js';
import * as calendarService from '../services/calendarService.js';
import { ServiceError } from '../services/calendarService.js';

const toBigInt = (v: string): bigint => BigInt(v);
const toStr = (v: string | string[]): string => Array.isArray(v) ? v[0] : v; //URL 쿼리가 배열로 올 때 대비.

const handleError = (e: unknown, res: Response, fallbackMsg = '서버 오류') => {
    if (e instanceof ServiceError) {
        return res.status(e.status).json({
            error: { code: e.code, message: e.message }
        });
    }
    console.error(e);
    return res.status(500).json({
        error: { code: 'SERVER_ERROR', message: fallbackMsg }
    });
};

// 1. 일정 조회
export const getEvents = async (req: AuthRequest, res: Response) => {
    const startStr = req.query.start as string | undefined;
    const endStr = req.query.end as string | undefined;
    const level = positionToLevel(req.memberPosition);

    try {
        const events = await calendarService.getEvents({
            memberId: req.memberId,
            level,
            start: startStr,
            end: endStr,
        });
        return res.json({ data: events });
    } catch (e) {
        return handleError(e, res, 'server error');
    }
}

// 2. 일정 생성
export const createEvent = async (req: AuthRequest, res: Response) => {
    const level = positionToLevel(req.memberPosition);

    try {
        const event = await calendarService.createEvent({
            memberId: req.memberId!,
            level,
            body: req.body,
        });
        return res.status(201).json({
            data: event,
        });
    } catch (e) {
        return handleError(e, res);
    }
}

//3. 일정 수정
export const updateEvent = async (req: AuthRequest, res: Response) => {
    const eventId = toBigInt(toStr(req.params.eventId));
    const level = positionToLevel(req.memberPosition);

    try {
        const updated = await calendarService.updateEvent({
            eventId,
            memberId: req.memberId,
            level,
            body: req.body,
        });
        return res.json({ data: updated });
    } catch (e) {
        return handleError(e, res);
    }
}

// 4. 일정 삭제
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    const eventId = toBigInt(toStr(req.params.eventId));
    const level = positionToLevel(req.memberPosition);

    try {
        await calendarService.deleteEvent({
            eventId,
            memberId: req.memberId,
            level,
        });
        return res.json({ data: { success: true } });
    } catch (e) {
        return handleError(e, res);
    }
}
