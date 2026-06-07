import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../shared/layout/Header';
import Footer from '../../shared/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import hero1 from '../../assets/hero_1.jpeg';
import hero2 from '../../assets/hero_2.jpeg';
import hero3 from '../../assets/hero_3.jpeg';
import hero4 from '../../assets/hero_4.jpeg';

const heroImages = [hero1, hero2, hero3, hero4];
const HERO_INTERVAL_MS = 5000;

// 현재 연도 기준으로 년수 계산
const FOUNDING_YEAR = 1978; // 1기
const clubYears = new Date().getFullYear() - FOUNDING_YEAR + 1;

// TODO: — 추후 API로 교체
const noticesData = [
    {
        id: 1,
        badge: '공지',
        badgeType: 'notice' as const,
        title: '2026 상반기 정기공연 안내',
        description: '공연 일정과 참여 방법을 안내드립니다...',
        date: '2026.05.10',
        views: 142,
    },
    {
        id: 2,
        badge: '공지',
        badgeType: 'notice' as const,
        title: '동방 사용 규칙 변경',
        description: '동방 사용시간 및 예약 방식이 변경됩니다',
        date: '2026.05.08',
        views: 98,
    },
    {
        id: 3,
        badge: 'HOT',
        badgeType: 'hot' as const,
        title: '신입 부원 모집 (~5/31)',
        description: '2026 상반기 신입 부원을 모집합니다',
        date: '2026.05.01',
        views: 312,
    },
];

// TODO: — 추후 API로 교체
const eventsData = [
    {
        month: 'MAY',
        day: 19,
        title: '정기 합주 연습',
        time: '19:00 — 22:00',
        location: '동아리실',
    },
    {
        month: 'MAY',
        day: 25,
        title: '신입 환영회',
        time: '18:00 — 21:00',
        location: '학생회관 1층 세미나실',
    },
];

// TODO: API 연동 시 다음 공연/합주 일정으로 자동 교체
const heroHighlights = [
    { label: '다음 무대', value: '2026 충북 청소년 밴드 연합 캠프 (7/5)' },
    { label: '정기 합주', value: '매주 화·수 18:00' },
];

const Home: React.FC = () => {
    const { isAuthenticated, member } = useAuth();
    const [heroIndex, setHeroIndex] = useState(0);
    const [memberCount, setMemberCount] = useState<number | null>(null);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const id = setInterval(() => {
            setHeroIndex((i) => (i + 1) % heroImages.length);
        }, HERO_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    // 현재 활동 회원 수만 DB에서 가져옴 (YEARS·PARTS는 상수)
    useEffect(() => {
        api.get('/members/stats')
            .then((res) => setMemberCount(res.data.data.memberCount))
            .catch(() => setMemberCount(null));
    }, []);

    const statsData = [
        { value: `${clubYears}`, label: 'YEARS' },
        { value: '5', label: 'PARTS' },
        { value: memberCount === null ? '—' : `${memberCount}`, label: 'MEMBERS' },
    ];

    return (
        <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
            <Header />

            {/* 히어로 섹션 */}
            <section className="relative border-b border-border-light overflow-hidden">
                {/* 배경 이미지 슬라이드쇼 */}
                {heroImages.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`소용돌이 ${i + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ))}
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />

                {/* 콘텐츠 */}
                <div className="relative max-w-6xl mx-auto px-6 md:px-12 py-16">
                    <div className="max-w-lg flex flex-col gap-6">
                        <div>
                            <span className="text-text-muted text-xs tracking-widest font-medium uppercase">
                                Chungbuk National University
                            </span>
                            <h1 className="text-5xl font-black tracking-tighter mt-2 text-text-title">
                                소용돌이
                            </h1>
                        </div>

                        <p className="text-base font-bold text-text-primary tracking-tight">
                            충북대학교 밴드 중앙 동아리
                        </p>

                        <ul className="flex flex-col gap-1.5 text-sm text-text-secondary">
                            {heroHighlights.map((item) => (
                                <li key={item.label} className="flex items-baseline gap-3">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap min-w-[72px]">
                                        {item.label}
                                    </span>
                                    <span>{item.value}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA 버튼들 */}
                        <div className="flex gap-3 mt-2">
                            {!(isAuthenticated && member?.status === 'active') && (
                                <Link
                                    to="/apply"
                                    className="bg-btn-primary-bg text-btn-primary-text px-6 py-3 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    입부 신청 →
                                </Link>
                            )}
                            <Link
                                to="/introduce"
                                className="bg-btn-secondary-bg text-btn-secondary-text px-6 py-3 rounded-md text-sm font-bold border border-border-dark hover:bg-bg-light transition-colors"
                            >
                                소개 보기
                            </Link>
                        </div>

                        {/* 통계 */}
                        <div className="flex gap-3 mt-2">
                            {statsData.map((stat, index) => (
                                <div
                                    key={index}
                                    className="border border-border-light rounded-lg px-5 py-3 text-center bg-white/70 backdrop-blur-sm"
                                >
                                    <span className="text-xl font-black text-text-title block">{stat.value}</span>
                                    <span className="text-xs font-medium text-text-muted tracking-wider">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 공지사항 섹션 */}
            <section className="bg-bg-light border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 text-left">
                    <div className="flex items-end justify-between mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
                                Section 01
                            </span>
                            <h2 className="text-3xl font-bold text-text-title">공지사항</h2>
                        </div>
                        <Link
                            to="/boards/notice"
                            className="bg-btn-primary-bg text-btn-primary-text px-5 py-2.5 rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                            전체보기 →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {noticesData.map((notice) => (
                            <Link
                                key={notice.id}
                                to={`/boards/notice/${notice.id}`}
                                className="bg-bg-white border border-border-light rounded-lg p-6 flex flex-col gap-3 hover:shadow-sm transition-shadow"
                            >
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded self-start ${notice.badgeType === 'hot'
                                        ? 'bg-red-50 text-text-danger'
                                        : 'bg-bg-light text-text-secondary'
                                        }`}
                                >
                                    {notice.badge}
                                </span>
                                <h3 className="text-base font-bold text-text-title leading-snug">
                                    {notice.title}
                                </h3>
                                <p className="text-sm text-text-muted font-light leading-relaxed">
                                    {notice.description}
                                </p>
                                <span className="text-xs text-text-muted mt-auto pt-2">
                                    {notice.date} · 조회 {notice.views}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 다가오는 일정 섹션 */}
            <section className="bg-bg-white border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 text-left">
                    <div className="flex items-end justify-between mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
                                Section 02
                            </span>
                            <h2 className="text-3xl font-bold text-text-title">다가오는 일정</h2>
                        </div>
                        <Link
                            to="/calendar"
                            className="bg-btn-primary-bg text-btn-primary-text px-5 py-2.5 rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                            캘린더 →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eventsData.map((event, index) => (
                            <div
                                key={index}
                                className="border border-border-light rounded-lg p-6 flex items-center gap-6 bg-bg-white"
                            >
                                {/* 날짜 */}
                                <div className="flex flex-col items-center justify-center min-w-[72px] border-r border-border-light pr-6">
                                    <span className="text-xs font-bold text-text-danger tracking-wider">
                                        {event.month}
                                    </span>
                                    <span className="text-4xl font-black text-text-title leading-tight">
                                        {event.day}
                                    </span>
                                </div>
                                {/* 정보 */}
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-base font-bold text-text-title">{event.title}</h3>
                                    <span className="text-sm text-text-secondary">{event.time}</span>
                                    <span className="text-xs text-text-muted">📍 {event.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA 배너 */}
            {!(isAuthenticated && member?.status === 'active') && (
                <section className="bg-bg-light border-b border-border-light">
                    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                        <h2 className="text-2xl md:text-3xl font-black text-text-title tracking-tight">
                            소용돌이의 다음 무대를 함께 만들어요
                        </h2>
                        <Link
                            to="/apply"
                            className="bg-btn-primary-bg text-btn-primary-text px-8 py-3 rounded-md text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            입부 신청하기 →
                        </Link>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default Home;