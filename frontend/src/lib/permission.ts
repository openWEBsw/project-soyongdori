// 직책 -> 권한 레벨 매핑 
export const positionToLevel = (position?: string | null): number => {
    switch (position) {
        case 'super_admin': return 8;
        case 'leader': return 7;
        case 'vice_leader': return 6;
        case 'treasurer': return 5;
        case 'planning_lead': return 5;
        case 'planning_member': return 4;
        case 'member': return 1;
        default: return 0;
    }
};

export const POSITION_LABELS: Record<string, string> = {
    super_admin: '총관리자',
    leader: '회장',
    vice_leader: '부회장',
    treasurer: '총무',
    planning_lead: '기획부장',
    planning_member: '기획부원',
    member: '일반회원',
    not_member: '준회원',
};

export const STATUS_LABELS: Record<string, string> = {
    pending: '대기',
    active: '활성',
    inactive: '비활성',
};
