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

// 공지/일정 타입
interface Notice {
    id: string;
    title: string;
    content: string;
    viewCount: number;
    createdAt: string;
}

interface EventItem {
    id: string;
    title: string;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    location: string | null;
}

// 일정 날짜/시간 표시용
function getMonth(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short' }).toUpperCase();
}
function getDay(iso: string) {
    return new Date(iso).getDate();
}
function formatTime(event: EventItem) {
    if (event.allDay) return '종일';
    const start = new Date(event.startAt).toTimeString().slice(0, 5);
    if (event.endAt) {
        return start + ' — ' + new Date(event.endAt).toTimeString().slice(0, 5);
    }
    return start;
}

// TODO: API 연동 시 다음 공연/합주 일정으로 자동 교체
const heroHighlights = [
    { label: '다음 무대', value: '2026 충북 청소년 밴드 연합 캠프 (7/5)' },
    { label: '정기 합주', value: '매주 화·수 18:00' },
];

// 동아리실 위치 
const clubLocation = {
    name: '충북대학교 제2학생회관 101호',
    roadAddress: '충북 청주시 서원구 성봉로242번길 57',
    mapUrl: 'https://naver.me/x3HduAZg',
    // OpenStreetMap 
    embedUrl:
        'https://www.openstreetmap.org/export/embed.html?bbox=127.4502997%2C36.6249934%2C127.4582997%2C36.6309934&layer=mapnik&marker=36.6279934%2C127.4542997',
};

const Home: React.FC = () => {
    const { isAuthenticated, member } = useAuth();
    const [heroIndex, setHeroIndex] = useState(0);
    const [memberCount, setMemberCount] = useState(0);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const id = setInterval(() => {
            setHeroIndex((i) => (i + 1) % heroImages.length);
        }, HERO_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    // 홈 화면 데이터 가져오기
    useEffect(() => {
        api.get('/members/stats')
            .then((res) => setMemberCount(res.data.data.memberCount));

        api.get('/boards/notice/recent')
            .then((res) => setNotices(res.data.data));

        const today = new Date().toISOString();
        api.get('/calendar/events?start=' + today)
            .then((res) => setEvents(res.data.data.slice(0, 2)));
    }, []);

    const statsData = [
        { value: `${clubYears}`, label: 'YEARS' },
        { value: '5', label: 'PARTS' },
        { value: `${memberCount}`, label: 'MEMBERS' },
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
                        {notices.length === 0 ? (
                            <p className="text-sm text-text-muted">등록된 공지가 없습니다</p>
                        ) : notices.map((notice) => (
                            <Link
                                key={notice.id}
                                to={`/posts/${notice.id}`}
                                className="bg-bg-white border border-border-light rounded-lg p-6 flex flex-col gap-3 hover:shadow-sm transition-shadow"
                            >
                                <span className="text-xs font-bold px-2.5 py-1 rounded self-start bg-bg-light text-text-secondary">
                                    공지
                                </span>
                                <h3 className="text-base font-bold text-text-title leading-snug">
                                    {notice.title}
                                </h3>
                                <p className="text-sm text-text-muted font-light leading-relaxed">
                                    {notice.content.slice(0, 50)}
                                </p>
                                <span className="text-xs text-text-muted mt-auto pt-2">
                                    {notice.createdAt.slice(0, 10).replace(/-/g, '.')} · 조회 {notice.viewCount}
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
                        {events.length === 0 ? (
                            <p className="text-sm text-text-muted">다가오는 일정이 없습니다</p>
                        ) : events.map((event) => (
                            <div
                                key={event.id}
                                className="border border-border-light rounded-lg p-6 flex items-center gap-6 bg-bg-white"
                            >
                                {/* 날짜 */}
                                <div className="flex flex-col items-center justify-center min-w-[72px] border-r border-border-light pr-6">
                                    <span className="text-xs font-bold text-text-danger tracking-wider">
                                        {getMonth(event.startAt)}
                                    </span>
                                    <span className="text-4xl font-black text-text-title leading-tight">
                                        {getDay(event.startAt)}
                                    </span>
                                </div>
                                {/* 정보 */}
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-base font-bold text-text-title">{event.title}</h3>
                                    <span className="text-sm text-text-secondary">{formatTime(event)}</span>
                                    {event.location && (
                                        <span className="text-xs text-text-muted">📍 {event.location}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 오시는 길 섹션 */}
            <section className="bg-bg-light border-b border-border-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 text-left">
                    <div className="flex items-end justify-between mb-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
                                Section 03
                            </span>
                            <h2 className="text-3xl font-bold text-text-title">오시는 길</h2>
                        </div>
                        <a
                            href={clubLocation.mapUrl}
                            target="_blank"
                            className="bg-btn-primary-bg text-btn-primary-text px-5 py-2.5 rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                            네이버 지도 →
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 지도 */}
                        <div className="border border-border-light rounded-lg overflow-hidden bg-bg-white">
                            <iframe
                                title="동아리실 위치"
                                src={clubLocation.embedUrl}
                                className="w-full h-64 border-0"
                            />
                        </div>
                        {/* 정보 */}
                        <div className="border border-border-light rounded-lg p-6 flex flex-col gap-1 bg-bg-white">
                            <h3 className="text-base font-bold text-text-title">{clubLocation.name}</h3>
                            <span className="text-sm text-text-secondary">📍 {clubLocation.roadAddress}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA 배너 */}
            {!(isAuthenticated && member?.status === 'active') && (
                <section className="bg-bg-white border-b border-border-light">
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