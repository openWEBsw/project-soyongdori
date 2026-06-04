import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../shared/layout/Header';
import Footer from '../../shared/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { positionToLevel, POSITION_LABELS, STATUS_LABELS } from '../../lib/permission';

// 회원 / 신청 데이터 타입
interface MemberRow {
    id: string;
    email: string;
    name: string;
    studentId: string | null;
    phone: string | null;
    part: string | null;
    position: string | null;
    cohort: number | null;
    isCohortLead: boolean;
    status: 'pending' | 'active' | 'inactive';
    approvedAt: string | null;
    createdAt: string;
}

interface ApplicationRow {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
    phone: string | null;
    part: string | null;
    motivation: string | null;
    status: 'pending' | 'approved' | 'rejected';
    reviewNote: string | null;
    reviewedAt: string | null;
    createdAt: string;
    member: { id: string; name: string; email: string; status: string } | null;
    reviewer: { id: string; name: string } | null;
}

const POSITION_OPTIONS = ['member', 'planning_member', 'planning_lead', 'treasurer', 'vice_leader', 'leader'];

type Tab = 'members' | 'applications';

const AdminPage: React.FC = () => {
    const { member } = useAuth();
    const myLevel = positionToLevel(member?.position);

    const [tab, setTab] = useState<Tab>('members');

    // ---- 회원 관리 상태 ----
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [membersLoading, setMembersLoading] = useState(false);

    // ---- 신청 관리 상태 ----
    const [apps, setApps] = useState<ApplicationRow[]>([]);
    const [appStatusFilter, setAppStatusFilter] = useState<string>('pending');
    const [appsLoading, setAppsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // 회원 조회
    const fetchMembers = useCallback(async () => {
        setMembersLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/admin/members', { params });
            setMembers(res.data.data);
        } catch (e: any) {
            setError(e.response?.data?.error?.message || '회원 목록을 불러오지 못했습니다');
        } finally {
            setMembersLoading(false);
        }
    }, [search, statusFilter]);

    // 신청 조회
    const fetchApps = useCallback(async () => {
        setAppsLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = { status: appStatusFilter };
            const res = await api.get('/admin/applications', { params });
            setApps(res.data.data);
        } catch (e: any) {
            setError(e.response?.data?.error?.message || '신청 목록을 불러오지 못했습니다');
        } finally {
            setAppsLoading(false);
        }
    }, [appStatusFilter]);

    useEffect(() => {
        if (tab === 'members') fetchMembers();
        else fetchApps();
    }, [tab, fetchMembers, fetchApps]);

    // ---- 회원 액션 ----
    const changePosition = async (id: string, newPosition: string) => {
        try {
            await api.patch(`/admin/member/${id}/position`, { position: newPosition });
            fetchMembers();
        } catch (e: any) {
            alert(e.response?.data?.error?.message || '직책 변경 실패');
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const next = currentStatus === 'active' ? 'inactive' : 'active';
        if (!window.confirm(`${currentStatus} → ${next} 로 변경하시겠습니까?`)) return;
        try {
            await api.patch(`/admin/member/${id}/status`, { status: next });
            fetchMembers();
        } catch (e: any) {
            alert(e.response?.data?.error?.message || '상태 변경 실패');
        }
    };

    // ---- 신청 액션 ----
    const approve = async (id: string) => {
        if (!window.confirm('이 신청을 승인하시겠습니까?')) return;
        try {
            await api.post(`/admin/applications/${id}/approve`);
            fetchApps();
        } catch (e: any) {
            alert(e.response?.data?.error?.message || '승인 실패');
        }
    };

    const reject = async (id: string) => {
        const note = window.prompt('거절 사유 (선택)') ?? undefined;
        if (note === null) return;
        try {
            await api.post(`/admin/applications/${id}/reject`, { reviewNote: note });
            fetchApps();
        } catch (e: any) {
            alert(e.response?.data?.error?.message || '거절 실패');
        }
    };

    // ---- 권한 헬퍼: 대상이 나보다 낮은 레벨일 때만 편집 가능 ----
    const canEditMember = (m: MemberRow) => positionToLevel(m.position) < myLevel;

    return (
        <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
            <Header />

            {/* 페이지 헤더 */}
            <section className="bg-bg-light border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 text-center flex flex-col items-center">
                    <span className="text-text-muted text-xs tracking-widest font-medium uppercase mb-3">
                        Admin
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-title">관리자 페이지</h1>
                    <p className="text-sm text-text-secondary mt-3 max-w-md">
                        회원 정보와 입부 신청을 관리합니다.
                    </p>
                </div>
            </section>

            <main className="flex-1 bg-bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
                    {/* 탭 */}
                    <div className="flex gap-6 border-b border-border-light mb-6">
                        {(['members', 'applications'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-colors ${tab === t
                                    ? 'text-text-primary border-text-primary'
                                    : 'text-text-muted border-transparent hover:text-text-primary'
                                    }`}
                            >
                                {t === 'members' ? '회원 관리' : '입부 신청'}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-text-danger">
                            {error}
                        </div>
                    )}

                    {/* === 회원 관리 탭 === */}
                    {tab === 'members' && (
                        <div>
                            {/* 검색 / 필터 */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="이름 또는 이메일 검색"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
                                    className="flex-1 min-w-[200px] px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 cursor-pointer border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary"
                                >
                                    <option value="">전체 상태</option>
                                    <option value="pending">대기</option>
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={fetchMembers}
                                    className="px-4 py-2 cursor-pointer bg-btn-primary-bg text-btn-primary-text rounded-md text-sm font-bold hover:opacity-90"
                                >
                                    검색
                                </button>
                            </div>

                            {/* 회원 테이블 */}
                            <div className="border border-border-light rounded-lg overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-bg-light">
                                        <tr className="text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                                            <th className="px-4 py-3">이름</th>
                                            <th className="px-4 py-3">이메일</th>
                                            <th className="px-4 py-3">직책</th>
                                            <th className="px-4 py-3">상태</th>
                                            <th className="px-4 py-3">기수</th>
                                            <th className="px-4 py-3">파트</th>
                                            <th className="px-4 py-3 text-right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {membersLoading && (
                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">불러오는 중…</td></tr>
                                        )}
                                        {!membersLoading && members.length === 0 && (
                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">검색 결과가 없습니다.</td></tr>
                                        )}
                                        {!membersLoading && members.map((m) => {
                                            const editable = canEditMember(m);
                                            return (
                                                <tr key={m.id} className="border-t border-border-light hover:bg-bg-light/40">
                                                    <td className="px-4 py-3 font-medium text-text-title">{m.name}</td>
                                                    <td className="px-4 py-3 text-text-secondary">{m.email}</td>
                                                    <td className="px-4 py-3 text-text-secondary">{m.position ? POSITION_LABELS[m.position] ?? m.position : '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : m.status === 'pending'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-bg-light text-text-muted'
                                                            }`}>
                                                            {STATUS_LABELS[m.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-secondary">{m.cohort ?? '-'}</td>
                                                    <td className="px-4 py-3 text-text-secondary">{m.part ?? '-'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {editable ? (
                                                            <div className="inline-flex items-center gap-2">
                                                                <select
                                                                    value={m.position ?? ''}
                                                                    onChange={(e) => changePosition(m.id, e.target.value)}
                                                                    disabled={myLevel < 6}
                                                                    className="text-xs border border-border-light rounded px-2 py-1 disabled:bg-bg-light"
                                                                >
                                                                    <option value="">직책 선택</option>
                                                                    {POSITION_OPTIONS.filter((p) => positionToLevel(p) < myLevel).map((p) => (
                                                                        <option key={p} value={p}>{POSITION_LABELS[p]}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleStatus(m.id, m.status)}
                                                                    className="text-xs px-2 py-1 border border-border-dark rounded hover:bg-bg-light"
                                                                >
                                                                    {m.status === 'active' ? '비활성화' : '활성화'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-text-muted">권한 없음</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* === 입부 신청 탭 === */}
                    {tab === 'applications' && (
                        <div>
                            {/* 상태 필터 */}
                            <div className="flex gap-2 mb-4">
                                {['pending', 'approved', 'rejected'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setAppStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${appStatusFilter === s
                                            ? 'bg-btn-primary-bg text-btn-primary-text'
                                            : 'bg-bg-light text-text-secondary hover:bg-bg-white border border-border-light'
                                            }`}
                                    >
                                        {s === 'pending' ? '대기' : s === 'approved' ? '승인' : '거절'}
                                    </button>
                                ))}
                            </div>

                            {/* 신청 카드 리스트 */}
                            <div className="flex flex-col gap-3">
                                {appsLoading && (
                                    <div className="py-8 text-center text-text-muted">불러오는 중…</div>
                                )}
                                {!appsLoading && apps.length === 0 && (
                                    <div className="py-8 text-center text-text-muted">해당 상태의 신청이 없습니다.</div>
                                )}
                                {!appsLoading && apps.map((a) => (
                                    <div key={a.id} className="border border-border-light rounded-lg p-5 bg-bg-white">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-base font-bold text-text-title">{a.name}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${a.status === 'pending' ? 'bg-amber-50 text-amber-700'
                                                        : a.status === 'approved' ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {a.status === 'pending' ? '대기' : a.status === 'approved' ? '승인' : '거절'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-text-muted mb-3 flex flex-wrap gap-x-4 gap-y-1">
                                                    <span>{a.email}</span>
                                                    {a.studentId && <span>학번 {a.studentId}</span>}
                                                    {a.phone && <span>{a.phone}</span>}
                                                    {a.part && <span>파트: {a.part}</span>}
                                                </div>
                                                {a.motivation && (
                                                    <p className="text-sm text-text-secondary whitespace-pre-wrap mb-2">{a.motivation}</p>
                                                )}
                                                {a.reviewNote && (
                                                    <p className="text-xs text-text-muted italic">메모: {a.reviewNote}</p>
                                                )}
                                                {a.reviewer && (
                                                    <p className="text-xs text-text-muted mt-2">
                                                        처리자: {a.reviewer.name} · {a.reviewedAt ? new Date(a.reviewedAt).toLocaleString('ko-KR') : ''}
                                                    </p>
                                                )}
                                            </div>
                                            {a.status === 'pending' && (
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => approve(a.id)}
                                                        className="px-4 py-2 bg-btn-primary-bg text-btn-primary-text rounded text-xs font-bold hover:opacity-90"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => reject(a.id)}
                                                        className="px-4 py-2 border border-red-200 text-text-danger rounded text-xs font-bold hover:bg-red-50"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminPage;
