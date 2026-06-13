export const boardNameTags: Record<string, string> = {
  notice: '공지',
  free: '자유',
  resource: '자료',
  photo: '사진',
  planning: '기획',
  budget: '회계',
};

export const partNames: Record<string, string> = {
  vocal: '보컬',
  drum: '드럼',
  electric: '일렉기타',
  keyboard: '키보드',
  bass: '베이스',
  etc: '기타',
};

export const positionNames: Record<string, string> = {
  not_member: '준회원',
  member: '일반회원',
  planning_member: '기획부원',
  planning_lead: '기획팀장',
  treasurer: '총무',
  vice_leader: '부회장',
  leader: '회장',
  super_admin: '관리자',
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return dateString.substring(0, 10).replaceAll('-', '.');
};

type MemberLike = { position: string | null; status: string } | null;

const FULL_ACCESS = ['vice_leader', 'leader', 'super_admin'];
const PLANNING_ACCESS = ['planning_member', 'planning_lead', 'treasurer', ...FULL_ACCESS];
const BUDGET_ACCESS = ['treasurer', ...FULL_ACCESS];
const MEMBER_ACCESS = ['member', 'planning_member', 'planning_lead', 'treasurer', ...FULL_ACCESS];
const LEAD_WRITE = ['planning_lead', ...BUDGET_ACCESS];
const NOTICE_WRITE = ['leader', 'super_admin'];

export function canAccessBoard(boardType: string, member: MemberLike): boolean {
  if (['notice', 'free'].includes(boardType)) return true;
  if (!member || member.status !== 'active') return false;
  const position = member.position ?? 'member';
  if (['resource', 'photo'].includes(boardType)) return MEMBER_ACCESS.includes(position);
  if (boardType === 'planning') return PLANNING_ACCESS.includes(position);
  if (boardType === 'budget') return BUDGET_ACCESS.includes(position);
  return false;
}

export function canWriteBoard(boardType: string, member: MemberLike): boolean {
  if (!member || member.status !== 'active') return false;
  const position = member.position ?? 'member';
  if (boardType === 'notice') return NOTICE_WRITE.includes(position);
  if (boardType === 'free' || boardType === 'photo' || boardType === 'resource') return MEMBER_ACCESS.includes(position);
  if (boardType === 'planning') return LEAD_WRITE.includes(position);
  if (boardType === 'budget') return BUDGET_ACCESS.includes(position);
  return false;
}
