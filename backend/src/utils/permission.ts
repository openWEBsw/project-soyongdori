// 직책 -> 권한 레벨.
export function positionToLevel(position?: string | null, isCohortLead = false):
    number {
    switch (position) {
        case 'super_admin': return 8;
        case 'leader': return 7;
        case 'vice_leader': return 6;
        case 'treasurer': return 6;
        case 'planning_leader': return 5;
        case 'plan ning_member': return 4;
        case 'member': return isCohortLead ? 2 : 1;
        default: return 0;
    }
}