// https://velog.io/@sohyun32253/FullCalendar-%EC%82%AC%EC%9A%A9%EB%B2%95-feat.-react-typescript

import React, { useState, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import Header from '../../shared/layout/Header';
import Footer from '../../shared/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';


// 직책 → 권한 레벨 매핑 (BE의 positionToLevel과 동일)
const positionToLevel = (position?: string): number => {
    switch (position) {
        case 'super_admin': return 8;
        case 'leader': return 7;
        case 'vice_leader': return 6;
        case 'treasurer': return 6;
        case 'planning_lead': return 5;
        case 'planning_member': return 4;
        case 'member': return 1;
        default: return 0;
    }
};

// 타입 정의: 백엔드 응답 형태와 모달 폼 상태
type Visibility = 'personal' | 'group' | 'public';

interface CalendarEvent {
    id: string;
    authorId: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    visibility: Visibility;
    location: string | null;
    color: string | null;
    author?: { id: string; name: string };
}

interface FormState {
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
    visibility: Visibility;
    location: string;
    color: string;
}

// 색상 목록
const COLORS = [
    { name: '보라', value: '#8b5cf6' },
    { name: '인디고', value: '#6366f1' },
    { name: '핑크', value: '#ec4899' },
    { name: '에메랄드', value: '#10b981' },
    { name: '앰버', value: '#f59e0b' },
    { name: '로즈', value: '#f43f5e' },
];

// datetime-local input 변환
const toLocalInput = (iso: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 새 일정 작성용 초기 폼 상태 (date 주면 그 날짜 09:00로 시작)
const emptyForm = (date?: string): FormState => ({
    title: '',
    description: '',
    startAt: date ? `${date}T09:00` : '',
    endAt: '',
    allDay: false,
    visibility: 'personal',
    location: '',
    color: COLORS[0].value,
});

const Calendar: React.FC = () => {
    // 로그인 정보 + 권한 계산
    const { member } = useAuth();
    const level = positionToLevel(member?.position);
    const canCreate = level >= 1;

    // useState
    const [events, setEvents] = useState<CalendarEvent[]>([]); // 현재 일정 목록
    const [error, setError] = useState<string | null>(null); // 에러 메시지
    const [loading, setLoading] = useState(false); // 로딩 상태

    // 모달 상태
    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null); // 모달 모드
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // 선택된 일정
    const [form, setForm] = useState<FormState>(emptyForm()); // 폼 상태
    const [submitting, setSubmitting] = useState(false); // 제출 중 상태

    // 현재 조회 중인 날짜 범위
    const rangeRef = useRef<{ start: string; end: string } | null>(null);

    // 일정 조회
    const fetchEvents = useCallback(async (start?: string, end?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (start) params.start = start;
            if (end) params.end = end;
            const res = await api.get('/calendar/events', { params });
            setEvents(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || '일정을 불러오지 못했습니다');
        } finally {
            setLoading(false);
        }
    }, []);

    // 달 이동
    const handleDatesSet = (arg: DatesSetArg) => {
        rangeRef.current = { start: arg.startStr, end: arg.endStr };
        fetchEvents(arg.startStr, arg.endStr);
    };

    // 빈 날짜 칸 클릭
    const handleDateClick = (arg: DateClickArg) => {
        if (!canCreate) return;
        setSelectedEvent(null);
        setForm(emptyForm(arg.dateStr));
        setModalMode('create');
    };

    // 기존 이벤트 클릭 
    const handleEventClick = (arg: EventClickArg) => {
        const ev = events.find((e) => String(e.id) === String(arg.event.id));
        if (!ev) return;
        setSelectedEvent(ev);
        setForm({
            title: ev.title,
            description: ev.description ?? '',
            startAt: toLocalInput(ev.startAt),
            endAt: ev.endAt ? toLocalInput(ev.endAt) : '',
            allDay: ev.allDay,
            visibility: ev.visibility,
            location: ev.location ?? '',
            color: ev.color ?? COLORS[0].value,
        });
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedEvent(null);
        setError(null);
    };

    // 수정/삭제 권한: 본인 이벤트이거나 level≥6
    const canEdit = selectedEvent
        ? member?.id === selectedEvent.authorId || level >= 6
        : false;
    const readOnly = modalMode === 'edit' && !canEdit;

    // 생성/수정 폼 제출 → POST 또는 PATCH
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.startAt) {
            setError('제목과 시작일은 필수입니다');
            return;
        }
        setSubmitting(true);
        setError(null);
        const payload = {
            title: form.title,
            description: form.description || null,
            startAt: form.startAt,
            endAt: form.endAt || null,
            allDay: form.allDay,
            visibility: form.visibility,
            location: form.location || null,
            color: form.color,
        };
        try {
            if (modalMode === 'create') {
                await api.post('/calendar/events', payload);
            } else if (modalMode === 'edit' && selectedEvent) {
                await api.patch(`/calendar/events/${selectedEvent.id}`, payload);
            }
            closeModal();
            if (rangeRef.current) {
                fetchEvents(rangeRef.current.start, rangeRef.current.end);
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || '저장에 실패했습니다');
        } finally {
            setSubmitting(false);
        }
    };

    // 일정 삭제 
    const remove = async () => {
        if (!selectedEvent) return;
        if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
        setSubmitting(true);
        try {
            await api.delete(`/calendar/events/${selectedEvent.id}`);
            closeModal();
            if (rangeRef.current) {
                fetchEvents(rangeRef.current.start, rangeRef.current.end);
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || '삭제에 실패했습니다');
        } finally {
            setSubmitting(false);
        }
    };

    // FullCalendar에 넘길 형태로 매핑
    const fcEvents = events.map((ev) => ({
        id: String(ev.id),
        title: ev.title,
        start: ev.startAt,
        end: ev.endAt ?? undefined,
        allDay: ev.allDay,
        backgroundColor: ev.color ?? '#6366f1',
        borderColor: ev.color ?? '#6366f1',
    }));

    return (
        <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
            <Header />

            {/* 페이지 헤더 */}
            <section className="bg-bg-light border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 text-center flex flex-col items-center">
                    <span className="text-text-muted text-xs tracking-widest font-medium uppercase mb-3">
                        Calendar
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text-title">활동 일정</h1>
                    <p className="text-sm text-text-secondary mt-3 max-w-md">
                        공연 · 합주 · 동아리 행사 일정을 확인하고 관리하세요.
                    </p>
                </div>
            </section>

            <main className="flex-1 bg-bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
                    {/* 액션 영역 */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-text-muted">
                            {loading ? '불러오는 중...' : `이 기간 일정 ${events.length}개`}
                        </span>
                        {canCreate && (
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date().toISOString().slice(0, 10);
                                    setSelectedEvent(null);
                                    setForm(emptyForm(today));
                                    setModalMode('create');
                                }}
                                className="bg-btn-primary-bg text-btn-primary-text px-5 py-2.5 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
                            >
                                일정 추가 +
                            </button>
                        )}
                    </div>

                    {error && !modalMode && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-text-danger">
                            {error}
                        </div>
                    )}

                    {/* 캘린더 */}
                    <div className="bg-bg-white border border-border-light rounded-lg p-4 md:p-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale="ko"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            buttonText={{
                                today: '오늘',
                                month: '월',
                                week: '주',
                                day: '일',
                            }}
                            events={fcEvents}
                            datesSet={handleDatesSet}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            height="auto"
                            dayMaxEvents={3}
                        />
                    </div>
                    </div>
                </div>
            </main>

            {modalMode && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-bg-white rounded-lg shadow-xl w-full max-w-lg border border-border-light max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                            <h2 className="text-lg font-bold text-text-title">
                                {modalMode === 'create' ? '일정 추가' : readOnly ? '일정 상세' : '일정 수정'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-text-muted hover:text-text-primary text-2xl leading-none"
                                aria-label="닫기"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-text-danger">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">제목 *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">설명</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    disabled={readOnly}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">시작 *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.startAt}
                                        onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                                        required
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">종료</label>
                                    <input
                                        type="datetime-local"
                                        value={form.endAt}
                                        onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-text-secondary">
                                <input
                                    type="checkbox"
                                    checked={form.allDay}
                                    onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                                    disabled={readOnly}
                                />
                                종일 일정
                            </label>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">공개 범위 *</label>
                                <select
                                    value={form.visibility}
                                    onChange={(e) => setForm({ ...form, visibility: e.target.value as Visibility })}
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light"
                                >
                                    <option value="personal">개인 공개</option>
                                    <option value="group">멤버 공개</option>
                                    <option value="public">전체 공개</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">장소</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    disabled={readOnly}
                                    className="w-full px-3 py-2 border border-border-light rounded-md text-sm focus:outline-none focus:border-text-primary disabled:bg-bg-light"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">색상</label>
                                <div className="flex gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => !readOnly && setForm({ ...form, color: c.value })}
                                            disabled={readOnly}
                                            className={`w-7 h-7 rounded-full transition-transform disabled:cursor-not-allowed ${form.color === c.value ? 'ring-2 ring-offset-2 ring-text-primary scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: c.value }}
                                            aria-label={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {selectedEvent?.author && (
                                <div className="text-xs text-text-muted pt-2 border-t border-border-light">
                                    작성자: {selectedEvent.author.name}
                                </div>
                            )}

                            {/* 하단 액션 버튼 (삭제 / 취소 / 저장) */}
                            <div className="flex justify-end gap-2 pt-2">
                                {modalMode === 'edit' && canEdit && (
                                    <button
                                        type="button"
                                        onClick={remove}
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-bold text-text-danger border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        삭제
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-bold text-text-secondary border border-border-dark rounded-md hover:bg-bg-light transition-colors"
                                >
                                    {readOnly ? '닫기' : '취소'}
                                </button>
                                {!readOnly && (
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-sm font-bold bg-btn-primary-bg text-btn-primary-text rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {submitting ? '저장 중...' : modalMode === 'create' ? '추가' : '수정'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Calendar;
