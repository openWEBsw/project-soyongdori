// 직책 -> 권한 레벨.
export function positionToLevel(position?: string | null, isCohortLead = false):
    number {
    switch (position) {
        case 'super_admin': return 8; // admin
        case 'leader': return 7; // 회장
        case 'vice_leader': return 6; // 부회장
        case 'treasurer': return 6; // 총무
        case 'planning_lead': return 5; // 기획부장
        case 'planning_member': return 4; //기획부원
        case 'member': return isCohortLead ? 2 : 1; // 기장, 일반회원
        default: return 0; //비회원 
    }
}