import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// TODO 
// 1. 파일 업로드 req 받기
// 2. 이미지 잘 변환해서 먹이기
// 3. 제미나이한테 먹여서 응답 받기
// 4. 리턴하기

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getReceiptAnalyze = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } })
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '이미지가 없습니다' } })
    }
    // TODO 예외처리 더 다듬기

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Hello there",
        config: { // TODO 질문, 지시 만들기 + 기회되면 예시 응답 제공
            systemInstruction: `
            프롬프트
        `,
        },
    });
    console.log(response.text);

    return res.json({ data: response.text });
}

export default getReceiptAnalyze;