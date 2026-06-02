// src/features/profile/profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/layout/Header';
import { boardNames, partNames, positionNames } from '../../shared/utils/translations';
import Footer from '../../shared/layout/Footer';

// TODO 임시 데이터 (추후 db 연결)
const testPost1 = [
  { id: 1112, category: 'free', title: '안녕하세요반갑습니다이건테스트데이 터입니다길이가필요합니다아아아아 안녕하세요반갑습니다이건테스트데이터입니다길이가필요합니다아아아아', date: '2026.05.13', views: 11, comments: 5 },
  { id: 1118, category: 'free', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 11, comments: 2 },
  { id: 1115, category: 'resource', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 11, comments: 8 },
  { id: 1113, category: 'photo', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 112, comments: 8 },
  { id: 11513, category: 'photo', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 112, comments: 8 },
];

const testPost2 = [
  { id: 1131, category: 'free', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 11, comments: 12 },
  { id: 11111, category: 'free', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 45, comments: 3 },
  { id: 111111, category: 'notice', title: 'ㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 110, comments: 2 },
  { id: 1151, category: 'resource', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 11, comments: 2 },
  { id: 1611, category: 'resource', title: 'ㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇ ㅇㅇ ㅇ', date: '2026.05.13', views: 11, comments: 2 },
];

// TODO 백엔드 컨트롤러에서 넘길 때, category는 추가로 붙여줘야 함
const testComment = [
  { id: 13411, category: 'free', content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇ ㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ', date: '2026.05.13', postTitle: '안녕하세요반갑습니다 이건테스트데이터입니다 길이가필요합니다아아아아', postId: 142 },
  { id: 1151, category: 'free', content: 'ㅇㅇ', date: '2026.05.13', postTitle: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇ', postId: 138 },
  { id: 11111, category: 'notice', content: '안녕하세요반갑습니다이건테스트데이터입니다길이가필요 합니다아아아아안녕하세요반갑습니다이건테스트 데이터입니다길이가필요합니다아아아아', date: '2026.05.13', postTitle: '안녕하세요반갑습니다이 건테스트데이터입니다길이가필요 합니다아아아아', postId: 71 },
  { id: 111111, category: 'resource', content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇ', date: '2026.05.13', postTitle: 'ㅇㅇ', postId: 125 },
  { id: 1161, category: 'resource', content: 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ ㅇ', date: '2026.05.13', postTitle: 'ㅇㅇ', postId: 125 },
];

const Profile = () => {
  const navigate = useNavigate();

  // 편집용 State와 실 출력용 State 분리

  // 유저 프로필 정보 상태 (실 출력용)
  const [profile, setProfile] = useState({
    name: '김철수철수',
    part: 'electric',
    email: 'kimcheolsuss@cbnu.ac.kr',
    department: '소프트웨어학부',
    studentId: '2022041000',
    cohort: 6,
    position: 'member',
    createdAt: '2022.03.15',
  });

  // 폼 및 입력 필드 상태 (편집용)
  const [editForm, setEditForm] = useState({ ...profile });


  // 탭 상태
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  // 모달 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = useState(false);


  // TODO 페이지네이션 처리 필요, 추후 연결하며 모두 수정. 페이지 상태
  const [postPage, setPostPage] = useState<1 | 2>(1);
  const [posts, setPosts] = useState(testPost1);
  const [totalPosts] = useState(12); // 백엔드에서 받아올 전체 게시글 개수 가정

  const [comments] = useState(testComment);
  const [totalComments] = useState(4); // 백엔드에서 받아올 전체 댓글 개수 가정

  useEffect(() => {
    if (postPage === 1) {
      setPosts(testPost1);
    } else {
      setPosts(testPost2);
    }
  }, [postPage]);


  // TODO 함수들 백엔드와 잇기

  // 프로필 수정 제출 처리
  const handleEditSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditModalOpen(false);
    alert('프로필 정보가 수정되었습니다.');
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 홈/마이페이지 타이틀 */}
      <div className="bg-bg-light text-left">
        <div className="mx-auto max-w-6xl px-4 md:px-12 pt-8">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
              홈 / 마이페이지
            </span>
            <h2 className="text-3xl font-bold text-text-title">마이페이지</h2>
          </div>
        </div>
      </div>

      {/* 메인 챕터 */}
      <div className="bg-bg-light py-10 flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-12 flex flex-col gap-6">

          {/* 프로필 챕터 */}
          <div className="bg-bg-white rounded-lg border border-border-light shadow-sm p-5 md:p-8 flex flex-col md:flex-row gap-8 items-stretch text-left">
            {/* 일반 정보 영역 */}
            {/* TODO 예쁘긴 하지만 꼭 2번 정보를 보여줘야 하는지?, 적절히 분할할지 검토 필요*/}
            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-bg-deep border border-border-dark flex items-center justify-center flex-shrink-0 text-text-muted text-xs font-semibold text-center select-none leading-tight p-2">
                프로필 이미지 {/* TODO 추후 이미지 태그로 교체 */}
              </div>
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-text-title">{profile.name}</h2>
                <div className="text-sm font-semibold text-text-secondary">
                  {partNames[profile.part]} · {profile.cohort}기 · {positionNames[profile.position]}
                </div>
                <div className="text-xs text-text-muted font-medium text-center md:text-left leading-relaxed">
                  <span className="whitespace-nowrap">{profile.email}</span>
                  {/* <span className="whitespace-nowrap"> · {profile.department}</span>
                  <span className="whitespace-nowrap"> · {profile.studentId}</span> */}
                </div>
                <div className="text-xs text-text-muted font-medium">
                  가입일: {profile.createdAt}
                </div>
                <button
                  onClick={() => {
                    setEditForm({ ...profile });
                    setIsEditModalOpen(true);
                  }}
                  className="mt-2 self-center md:self-start border border-border-dark text-text-secondary px-5 py-1.5 rounded text-xs font-semibold hover:bg-bg-light transition-colors cursor-pointer"
                >
                  프로필 수정
                </button>
              </div>
            </div>

            {/* 우측 표 형식 정보 영역 */}
            <div className="w-full md:w-80 bg-bg-light rounded-lg p-5 border border-border-light flex flex-col gap-3 justify-center text-sm text-text-secondary font-medium">
              <div className="flex justify-between border-b border-border-light/50 pb-2">
                <span className="text-text-muted">이름</span>
                <span className="text-text-primary font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between border-b border-border-light/50 pb-2">
                <span className="text-text-muted">학번</span>
                <span className="text-text-primary">{profile.studentId}</span>
              </div>
              <div className="flex justify-between border-b border-border-light/50 pb-2">
                <span className="text-text-muted">기수</span>
                <span className="text-text-primary">{profile.cohort}기</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">권한</span>
                <span className="text-text-primary">{positionNames[profile.position]}</span>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 챕터 */}
          <div className="flex gap-2 text-left">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-2.5 rounded-md font-bold text-sm transition-colors cursor-pointer border ${activeTab === 'posts'
                ? 'bg-btn-active-bg text-btn-active-text border-border-dark'
                : 'bg-bg-white text-text-secondary border-border-light hover:bg-bg-light'
                }`}
            >
              내 게시글
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-2.5 rounded-md font-bold text-sm transition-colors cursor-pointer border ${activeTab === 'comments'
                ? 'bg-btn-active-bg text-btn-active-text border-border-dark'
                : 'bg-bg-white text-text-secondary border-border-light hover:bg-bg-light'
                }`}
            >
              내 댓글
            </button>
          </div>

          {/* 내 게시글, 댓글 정보 테이블 챕터 */}
          <div className="bg-bg-white rounded-lg border border-border-light shadow-sm p-4 md:p-6 text-left">

            {/* 탭 1: 내 게시글 리스트 */}
            {activeTab === 'posts' && (
              <div className="flex flex-col">
                <div className="text-xs font-bold text-text-muted mb-4 tracking-wider">MY POSTS ({totalPosts})</div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm text-text-secondary">
                    <thead>
                      {/* 모바일 환경에서 저가치 항목 hidden처리하여 공간확보 */}
                      <tr className="bg-bg-light text-text-primary font-bold border-b border-border-light text-center text-xs">
                        <th className="py-3 px-1 md:px-2 hidden md:w-[8%] md:table-cell whitespace-nowrap">NO.</th>
                        <th className="py-3 px-1 md:px-2 w-[20%] md:w-[10%] whitespace-nowrap">
                          <span className="hidden md:inline">카테고리</span>
                          <span className="md:hidden">분류</span>
                        </th>
                        <th className="py-3 px-2 text-left w-[55%] md:w-[52%] whitespace-nowrap">제목</th>
                        <th className="py-3 px-1 md:px-2 w-[25%] md:w-[16%] whitespace-nowrap">날짜</th>
                        <th className="py-3 px-1 md:px-2 hidden md:w-[7%] md:table-cell whitespace-nowrap">조회</th>
                        <th className="py-3 px-1 md:px-2 hidden md:w-[7%] md:table-cell whitespace-nowrap">댓글</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr
                          key={post.id}
                          onClick={() => navigate(`/posts/${post.id}`)}
                          className="border-b border-border-light hover:bg-bg-light/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post.id}</td>
                          <td className="py-3 px-1 md:px-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${post.category === 'notice' ? 'bg-red-50 text-text-danger' : 'bg-bg-light text-text-secondary'
                              }`}>
                              {boardNames[post.category]}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium">
                            <p className="truncate">{post.title}</p>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs whitespace-nowrap">{post.date}</td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post.views}</td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TODO 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setPostPage(1)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${postPage === 1 ? 'bg-bg-deep text-text-primary' : 'border border-border-light text-text-muted bg-bg-white hover:bg-bg-light'
                      }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setPostPage(2)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${postPage === 2 ? 'bg-bg-deep text-text-primary' : 'border border-border-light text-text-muted bg-bg-white hover:bg-bg-light'
                      }`}
                  >
                    2
                  </button>
                </div>
              </div>
            )}

            {/* 탭 2: 내 댓글 리스트 */}
            {activeTab === 'comments' && (
              <div className="flex flex-col">
                <div className="text-xs font-bold text-text-muted mb-4 tracking-wider">MY COMMENTS ({totalComments})</div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm text-text-secondary">
                    <thead>
                      <tr className="bg-bg-light text-text-primary font-bold border-b border-border-light text-center text-xs">
                        <th className="py-3 px-1 md:px-2 hidden md:w-[8%] md:table-cell whitespace-nowrap">NO.</th>
                        <th className="py-3 px-1 md:px-2 w-[10%] md:w-[10%] whitespace-nowrap">
                          <span className="hidden md:inline">카테고리</span>
                          <span className="md:hidden">분류</span>
                        </th>
                        <th className="py-3 px-2 text-left w-[44%] md:w-[44%] whitespace-nowrap">댓글 내용</th>
                        <th className="py-3 px-1 md:px-2 w-[22%] md:w-[16%] whitespace-nowrap">날짜</th>
                        <th className="py-3 px-1.5 md:px-2 text-left w-[16%] md:w-[22%]">
                          <span className="hidden md:inline">원본 </span>게시글<span className="hidden md:inline"> 제목</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((comment) => (
                        <tr
                          key={comment.id}
                          onClick={() => navigate(`/posts/${comment.postId}`)}
                          className="border-b border-border-light hover:bg-bg-light/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{comment.id}</td>
                          <td className="py-3 px-1 md:px-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${comment.category === 'notice' ? 'bg-red-50 text-text-danger' : 'bg-bg-light text-text-secondary'
                              }`}>
                              {boardNames[comment.category]}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium">
                            <p className="h-[32px] md:h-[40px] text-xs md:text-sm leading-4 md:leading-5 line-clamp-2 break-all ">
                              {comment.content}
                            </p>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs whitespace-nowrap">{comment.date}</td>
                          <td className="py-3 px-1.5 md:px-2 text-xs font-medium">
                            <p className="truncate">{comment.postTitle}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* TODO 페이지네이션 */}
              </div>
            )}
          </div>

          {/* 하단 버튼 챕터(로그아웃, 회원탈퇴) */}
          <div className="bg-bg-white rounded-lg border border-border-light shadow-sm px-4 md:px-6 py-4 flex justify-between items-center gap-6">
            <button
              onClick={handleLogout}
              className="border border-border-dark text-text-secondary px-6 py-2 rounded-md text-xs font-semibold hover:bg-bg-light transition-colors cursor-pointer"
            >
              로그아웃
            </button>
            <button
              onClick={() => setIsAccountDeleteModalOpen(true)}
              className="border border-red-300 px-6 py-2 rounded-md bg-red-50 text-text-danger font-bold hover:bg-red-100 transition-colors text-xs cursor-pointer"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 정보 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden text-left border border-border-light flex flex-col">
            <div className="bg-bg-light border-b border-border-light px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-text-title">프로필 정보 수정</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-text-primary cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">이름</label>
                <input
                  type="text"
                  disabled
                  value={editForm.name}
                  className="w-full border border-border-light bg-bg-light text-text-muted rounded px-3 py-2 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">학번</label>
                <input
                  type="text"
                  disabled
                  value={editForm.studentId}
                  className="w-full border border-border-light bg-bg-light text-text-muted rounded px-3 py-2 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">이메일</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-dark bg-bg-white text-text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">소속 학과</label>
                <input
                  type="text"
                  required
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full border border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-dark bg-bg-white text-text-primary"
                />
              </div>


              <p className="text-xs text-text-muted leading-relaxed">
                ※ 이름 및 학번 수정이 필요하신 경우, 관리자에게 문의해 주시기 바랍니다.
              </p>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border-light rounded text-xs font-bold text-text-secondary hover:bg-bg-light cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 회원 탈퇴 안내 모달 */}
      {isAccountDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden text-left border border-border-light flex flex-col">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between text-text-danger">
              <h3 className="text-base font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                회원 탈퇴 안내
              </h3>
              <button onClick={() => setIsAccountDeleteModalOpen(false)} className="text-text-danger hover:opacity-90 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-sm">
              <p className="font-semibold text-text-primary leading-normal">
                웹사이트를 통한 직접 회원 탈퇴는 불가능합니다.
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                탈퇴를 원하실 경우 동아리 운영진 또는 웹사이트 관리자에게 직접 문의하여 진행해 주시기 바랍니다.
              </p>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-light">
                <button
                  onClick={() => setIsAccountDeleteModalOpen(false)}
                  className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Profile;
