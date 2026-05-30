import React from 'react';
import Header from '../../shared/layout/Header';

// TODO FOOTER 필요

// 반복 데이터
const partsData = [
  { name: '보컬', english: 'Vocal', desc: '밴드의 목소리' },
  { name: '일렉기타', english: 'Electric Guitar', desc: '리프와 솔로의 핵심' },
  { name: '베이스', english: 'Bass', desc: '리듬의 뿌리' },
  { name: '드럼', english: 'Drum', desc: '비트를 이끄는 심장' },
  { name: '키보드', english: 'Keyboard', desc: '사운드의 색채' },
];

const timelineData = [
  { date: '3월', activity: '가두모집\n신입 환영회' },
  { date: '5월', activity: '대동제 공연\n정기공연 #1' },
  { date: '7~8월', activity: '여름 방학\nMT · 합숙' },
  { date: '9월', activity: '가두모집 #2\n합주 시작' },
  { date: '11월', activity: '정기공연 #2\n송년회' },
  { date: '12월', activity: '임원 선거\n인수인계' },
];

const Introduce: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col ">

      {/* 헤더. TODO APP.tsx로 옮길지는 고민 필요 */}
      <Header />

      {/* 메인 챕터 */}
      <section className="bg-bg-light border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-center flex flex-col items-center">
          <span className="text-text-muted text-xs tracking-widest font-medium mb-3">
            ABOUT SYDR
          </span>
          <h1 className="text-5xl font-black tracking-tighter mb-5 text-text-title">소용돌이</h1>
          <p className="text-lg tracking-tighter font-bold mb-5 text-text-secondary">
            충북대학교 중앙 밴드 동아리
          </p>
          <p className="text-sm md:text-base font-light leading-relaxed text-text-secondary max-w-2xl">
            거센 흐름 속에서 우리는 함께 연주한다. <br />
            수십년의 시간, 변하지 않은 단 하나 — 무대 위의 우리.
          </p>
        </div>
      </section>

      {/* 역사 챕터 */}
      <section className="bg-bg-white border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-left">
          <div className=" mb-8 flex flex-col gap-1">
            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
              SECTION 01 — HISTORY
            </span>
            <h2 className="text-3xl font-bold text-text-title">우리의 역사</h2>
          </div>
          <hr className="border-border-light -mt-4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-8">
            <div className="bg-bg-deep rounded-lg aspect-[1.8/1] flex items-center justify-center text-text-muted text-sm font-medium p-6">
              역사 사진 영역 {/* TODO 추후 img 태그로 교체 */}
            </div>
            <div className="md:col-span-2 text-sm md:text-base leading-11 font-light text-text-secondary">
              <p>
                충북대학교에서 창단된 소용돌이는 약 50년간 캠퍼스 음악 문화를 이끌어왔습니다. <br />
                매년 2회 정기공연, 가두모집, 학교 축제 참여 등 활발한 활동을 하고 있으며, <br />
                500명이 넘는 동문이 함께한 충북대 대표 중앙동아리입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 파트소개 챕터 */}
      <section className="bg-bg-light border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-left">
          <div className=" mb-8 flex flex-col gap-1">
            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
              SECTION 02 — PARTS
            </span>
            <h2 className="text-3xl font-bold text-text-title">5개 파트</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
            {partsData.map((part, index) => (
              <div key={index} className="rounded-lg shadow-sm overflow-hidden bg-bg-white flex flex-col border border-border-light">
                <div className="bg-bg-dark text-center text-white py-4 px-3">
                  <h3 className="text-base md:text-lg font-bold">{part.name}</h3>
                </div>
                <div className="bg-bg-white flex flex-col items-center justify-center py-5 px-3 gap-1 text-center flex-1">
                  <span className="text-sm font-semibold text-text-secondary">{part.english}</span>
                  <span className="text-xs text-text-muted font-medium">{part.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 연간활동 챕터 */}
      <section className="bg-bg-white border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-left">
          <div className=" mb-8 flex flex-col gap-1">
            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
              SECTION 03 — YEARLY ACTIVITIES
            </span>
            <h2 className="text-3xl font-bold text-text-title">연간 활동</h2>
          </div>
          <hr className="border-border-light -mt-4 mb-8" />
          <div className="relative mt-12 mb-8">

            <div className="hidden md:block absolute top-[8px] left-[2px] right-[2px] h-[2px] bg-border-dark z-0" />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-y-10 gap-x-4 relative z-10">
              {timelineData.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-4 h-4 rounded-full bg-bg-dark mb-4 z-10" />
                  <span className="text-base md:text-lg font-extrabold text-text-title mb-1">{item.date}</span>
                  <span className="text-xs font-medium text-text-secondary leading-relaxed whitespace-pre-line">
                    {item.activity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 합류버튼 챕터 */}
      <section className="bg-bg-light py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-center">
          <button className="bg-btn-primary-bg text-btn-primary-text rounded-md flex items-center justify-center gap-2.5 h-12 px-8 text-sm md:text-base font-bold hover:opacity-95 transition-opacity shadow-sm cursor-pointer">
            소용돌이에 합류하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default Introduce;