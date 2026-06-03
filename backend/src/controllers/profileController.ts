import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads');

const getProfile = async (req: AuthRequest, res: Response, targetId: bigint, isMe: boolean) => {
    try {
        const member = await prisma.member.findUnique({
            where: { id: targetId },
            select: {
                name: true,
                part: true,
                position: true,
                cohort: true,
                profileImageUrl: true,
                createdAt: true,
                isCohortLead: true,
                email: isMe,
                studentId: isMe,
                phone: isMe, // TODO 페이지에 추가
                department: isMe,
            },
        });

        if (!member) {
            return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다' } });
        }

        return res.json({ data: { ...member } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
    }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } })
    }

    await getProfile(req, res, memberId, true);
};

export const getMemberProfile = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }
    // TODO 단순 멤버인지 체크를 넘어서서, status도 검토해봐야 할 지 고민 필요. 지금 기준으론 괜찮을

    const targetId = req.params.memberId;

    if (!targetId) {
        return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '존재하지 않는 회원입니다' } });
    }

    try {
        await getProfile(req, res, BigInt(targetId as string), false);
    } catch (error) {
        return res.status(400).json({ error: { code: 'INVALID_MEMBER_ID', message: '잘못된 회원 정보입니다' } });
    }

}


// TODO 페이지에서 현재 비밀번호 검증 로직 추가
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    const currentPassword = req.body.currentPassword;
    const email = req.body.email;
    const phone = req.body.phone;
    const department = req.body.department;
    const newPassword = req.body.newPassword;

    if (!currentPassword) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '현재 비밀번호를 입력해주세요' } });
    }

    // TODO 상황 봐서 phone도 unique하게 스키마랑 코드 수정
    try {

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { passwordHash: true }
        });

        if (!member) {
            return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다' } });
        }


        const isMatch = await bcrypt.compare(currentPassword, member.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: { code: 'INCORRECT_PASSWORD', message: '비밀번호가 일치하지 않습니다' } });
        }

        const updateData: any = { email, phone, department };

        // 새 패스워드 입력했을때만 변경 로직 동작
        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '비밀번호는 8글자 이상이어야 합니다' } });
            }
            if (newPassword === currentPassword) {
                return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '새 비밀번호가 현재 비밀번호와 일치합니다' } });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.passwordHash = hashedPassword;
        }

        const update = await prisma.member.update({
            where: { id: memberId },
            data: updateData
        });

        return res.json({ data: update });
    } catch (error: any) {

        if (error.code === "P2002") {
            return res.status(409).json({ error: { code: 'EMAIL_ALREADY_EXIST', message: '이미 존재하는 이메일입니다' } });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다' } });
        }

        console.error(error);
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
    }

}

export const updateProfileImage = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    const newProfileImage = req.file as Express.Multer.File;

    if (!newProfileImage) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '프로필 이미지 파일이 필요합니다' } });
    }

    try {
        const ext = path.extname(newProfileImage.originalname);
        const filename = `${crypto.randomBytes(12).toString('hex')}${ext}`;
        await fs.promises.writeFile(path.join(uploadsDir, filename), newProfileImage.buffer);

        const profileImageUrl = `/uploads/${filename}`;

        // TODO 이전 파일 삭제 로직 구현

        const update = await prisma.member.update({
            where: { id: memberId },
            data: { profileImageUrl }
        });

        return res.json({ data: update });
    } catch (error: any) {

        console.error(error);
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
    }
}


// 멤버 게시글 조회, 멤버 댓글 조회
const getPostsByMemberId = async (req: AuthRequest, res: Response, targetId: bigint) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    try {
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { authorId: targetId, deletedAt: null, isHidden: false },
                select: {
                    id: true,
                    title: true,
                    viewCount: true,
                    updatedAt: true,
                    board: { select: { type: true } },
                    _count: { select: { comments: true } },
                },
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.post.count({
                where: { authorId: targetId, deletedAt: null, isHidden: false },
            }),
        ]);

        return res.json({
            data: {
                posts,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
    }
};

const getCommentsByMemberId = async (req: AuthRequest, res: Response, targetId: bigint) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    try {
        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: { authorId: targetId, deletedAt: null },
                select: {
                    id: true,
                    content: true,
                    updatedAt: true,
                    post: { select: { title: true, board: { select: { type: true } } } },
                    // TODO 삭제된 게시글에 대한 노출 처리는 고민 필요
                },
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.comment.count({
                where: { authorId: targetId, deletedAt: null },
            }),
        ]);

        return res.json({
            data: {
                comments,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: { code: 'SERVER_ERROR', message: '서버 오류' } });
    }
};

export const getMyPosts = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    await getPostsByMemberId(req, res, memberId);
}

export const getMyComments = async (req: AuthRequest, res: Response) => {
    const memberId = req.memberId;

    if (!memberId) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
    }

    await getCommentsByMemberId(req, res, memberId);
}


// TODO 추후 필요시. 현재 목표에선 배제하기로 함
// (다른사람 프로필은 프로필과 별개의 팝업 모달 컴포넌트 형식으로 주요 정보만 노출되도록 구현)
// TODO 만들게 된다면 요청자 멤버 권한에 따라 게시글 자체가 노출 되면 안되는 것도 고려해봐야 할 듯

// export const getMemberPosts = async (req: AuthRequest, res: Response) => {
//     const memberId = req.memberId;

//     if (!memberId) {
//         return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
//     }


//     const targetId = BigInt(req.params.memberId as string);

//     if (!targetId) {
//         return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다' } });
//     }

//     await getPostsByMemberId(req, res, targetId);
// }
// export const getMemberComments = async (req: AuthRequest, res: Response) => {
//     const memberId = req.memberId;

//     if (!memberId) {
//         return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } });
//     }


//     const targetId = BigInt(req.params.memberId as string);

//     if (!targetId) {
//         return res.status(404).json({ error: { code: 'MEMBER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다' } });
//     }

//     await getCommentsByMemberId(req, res, targetId);
// }