import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getReceiptAnalyze = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '파일이 없습니다' } });
    }

    try {

        const files = req.files as Express.Multer.File[]
        const imageFiles = files.filter(file => file.mimetype.startsWith('image/'));

        if (imageFiles.length === 0) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '분석할 수 있는 이미지 파일이 없습니다' } });
        }

        const base64ImageFiles = imageFiles.map(file => ({
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString("base64"),
            },
        }));

        const contents = [
            ...base64ImageFiles,
            { text: "이 파일들 중 분석 가능한 것을 분석하여 템플릿에 맞추어 작성해줘." },
        ];

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: contents,
            config: {
                systemInstruction: `
                You are an AI that generates text based on receipts, payment records, order details, and similar information. 
                Since the task at hand is highly precise, please respond strictly using the template I provide and do not include any greetings or additional explanations.
                
                1. If the image is invalid
                - If the image analysis determines that the image cannot be analyzed, output the following message for that image: 
                '* 사진 번호: [Photo Number]
                [Photo Number]번 이미지는 분석이 어려워 도와드릴 수 없습니다.'
                You must still output '* 사진 번호: ' header first.
                
                2. Data Extraction
                - If the image can be analyzed, extract the data according to the template I provide.
                - Do not modify the wording in the template(example: '* 사진 번호:', '* 상품 내역:', '* 총 결제 금액:') in any way; output it exactly as written in Korean.
                - If there are multiple images, output each one according to the template, but enter the '사진번호' in the format 1, 2, 3.
                - when you output products, start each entry with a hyphen (-) under '상품 내역:' and list the respective data.
                - If some data cannot be recognized, do not leave that field blank; be sure to specify '확인 불가'
                - If the total payment amount field cannot be verified, output it in the format '(구매금액 총합: 123,456원)'.
                
                3. Template
                * 사진 번호: [Photo Number (e.g., 1, 2, 3...)]
                * 상품 내역:
                - [YYYY-MM-DD] / [Product Name 1] / [Quantity 1] / [Price 1 (Print the price based on the total quantity. Formatting example: 123,456,789원)]
                - [YYYY-MM-DD] / [Product Name 2] / [Quantity 2] / [Price 2 (Print the price based on the total quantity. Formatting example: 123,456,789원)]
                * 총 결제 금액: [Amount (Formatting example: 123,456,789원)]
                
                4. Example
                * 사진 번호: 1
                * 상품 내역:
                - 확인 불가 / 곰곰 국내산 포기 김치, 2kg, 1개 / 1 / 13,490원
                - 확인 불가 / 곰곰 더 오리지널 부대찌개, 1kg, 2개 / 1 / 13,990원
                - 확인 불가 / 백설 허브맛 솔트 오리지널, 50g, 1개 / 1 / 2,440원
                - 확인 불가 / 육개장 사발면 86g, 30개 / 1 / 23,550원
                - 확인 불가 / 오뚜기 맛있는 오뚜기밥, 210g, 36개 / 1 / 31,820원
                * 총 결제 금액: (구매금액 총합: 85,290원)
                
                * 사진 번호: 2
                * 상품 내역:
                - 2026-05-08 / 01 대용량용기100 / 1 / 4,990원
                - 2026-05-08 / 02 simplus종이접시23 / 2 / 2,000원
                - 2026-05-08 / 03 감귤주스1.5L / 1 / 1,890원
                - 2026-05-08 / 04 도톰한엠보물티슈 / 1 / 1,000원
                * 총 결제 금액: 9,880원
                
                * 사진 번호: 3
                * 상품 내역:
                - 2026-05-09 / 닭강정 / 1 / 20,000원
                * 총 결제 금액: 20,000원
                
                * 사진 번호: 4
                4번 이미지는 분석이 어려워 도와드릴 수 없습니다.
                `,
            },
        });

        return res.json({ data: response.text });
    } catch (err: any) {
        console.error(err);
        if (err.code === 503 || err.status === 503) {
            return res.status(503).json({ error: { code: 'UNAVAILABLE', message: '이용자가 많아 분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요' } });
        }
        if (err.code === 429 || err.status === 429) {
            return res.status(429).json({ error: { code: 'LIMIT_EXCEEDED', message: '요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요' } });
        }
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '알 수 없는 오류가 발생했습니다' } });
    }
}

export default getReceiptAnalyze;