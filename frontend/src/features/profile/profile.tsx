// TODO 고화질 이미지 업로드시 깨짐 증상 개선

// TODO 시간되면 할 것 
// 0. 이메일, 전화번호 조건 검증 늘리고, signup과 맞추기
// 1. 로딩, 에러 조금 더 예쁘게
// 2. 페이지 갔다가 뒤로 돌아오면 보던 탭 보이게 
// 3. 코멘트 눌러 이동시 그자리로

import defaultProfileImg from '../../assets/default_profile_image.jpg';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/layout/Header';
import { boardNameTags, formatDate, partNames, positionNames } from '../../shared/utils/translations';
import Footer from '../../shared/layout/Footer';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileData {
  status: string;
  name: string;
  part: string;
  position: string;
  isCohortLead: boolean;
  cohort: number;
  createdAt: string;
  email: string;
  studentId: string;
  phone: string;
  department: string;
  profileImageUrl: string;
}
interface Post {
  id: string;
  title: string;
  viewCount: number;
  createdAt: string;
  board: { type: string };
  _count: { comments: number };
}

interface Comment {
  id: string;
  category: string;
  content: string;
  createdAt: string;
  post: { id: string, title: string; board: { type: string } };
}

const Profile = () => {
  const navigate = useNavigate();
  const [initLoading, setinitLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [postError, setPostError] = useState<string>('');
  const [commentError, setCommentError] = useState<string>('');

  const { logout, updateMember } = useAuth();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  // 모달 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccountDeleteModalOpen, setIsAccountDeleteModalOpen] = useState(false);

  // 편집용 프로필 State와 실 출력용 프로필 State 분리

  // 유저 프로필 정보 상태 (실 출력용)
  const [profile, setProfile] = useState<ProfileData>({
    status: '',
    name: '',
    part: '',
    position: '',
    isCohortLead: false,
    cohort: 0,
    createdAt: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    profileImageUrl: '',
  });

  // 포스트 관련
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0)

  const [postPage, setPostPage] = useState(1);
  const [totalPostPages, setTotalPostPages] = useState(1);

  const handlePostPageChange = async (page: number) => {
    setLoading(true);
    setPostError('');
    setPostPage(page);
    await api.get('/members/me/posts', { params: { page } })
      .then((res) => {
        setPosts(res.data.data.posts);
        setTotalPosts(res.data.data.pagination.total);
        setTotalPostPages(res.data.data.pagination.totalPages);
      })
      .catch(err => {
        if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
          logout(); navigate('/login');
        }
        else {
          console.log(err);
          const errMsg = err.response?.data?.error?.message || '내 게시글 정보를 불러오는 데 실패했습니다.';
          setPostError(errMsg);
        }
      })
      .finally(() => setLoading(false));
  }

  // 댓글 관련
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCommentPages, setTotalCommentPages] = useState(1);

  const [commentPage, setCommentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  const handleCommentPageChange = async (page: number) => {
    setLoading(true);
    setCommentError('');
    setCommentPage(page);
    await api.get('/members/me/comments', { params: { page } })
      .then((res) => {
        setComments(res.data.data.comments);
        setTotalComments(res.data.data.pagination.total);
        setTotalCommentPages(res.data.data.pagination.totalPages);
      })
      .catch(err => {
        if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
          logout(); navigate('/login');
        }
        else {
          console.log(err);
          const errMsg = err.response?.data?.error?.message || '내 댓글 정보를 불러오는 데 실패했습니다.';
          setCommentError(errMsg);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    setinitLoading(true);
    setInitError('');
    Promise.all([
      api.get('/members/me'),
      api.get('/members/me/posts'),
      api.get('/members/me/comments')
    ])
      .then(([resProfile, resPosts, resComments]) => {
        setProfile(resProfile.data.data);

        setPosts(resPosts.data.data.posts);
        setTotalPosts(resPosts.data.data.pagination.total);
        setTotalPostPages(resPosts.data.data.pagination.totalPages);

        setComments(resComments.data.data.comments);
        setTotalComments(resComments.data.data.pagination.total);
        setTotalCommentPages(resComments.data.data.pagination.totalPages);
      })
      .catch(err => {
        if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
          logout(); navigate('/login');
        }
        else {
          console.log(err);
          const errMsg = err.response?.data?.error?.message || '프로필 정보를 불러오는 데 실패했습니다.';
          setInitError(errMsg);
        }
      })
      .finally(() => {
        setinitLoading(false);
      })
  }, []);


  // 폼 및 입력 필드 상태 (편집용)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', department: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  // edit 핸들링 함수
  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editForm.currentPassword) {
      alert("현재 비밀번호를 입력해주세요!");
      return;
    }

    if (editForm.newPassword && !editForm.confirmPassword) {
      alert("새 비밀번호를 한번 더 입력해주세요!");
      return;
    }

    if (editForm.newPassword && editForm.newPassword.length < 8) {
      alert("비밀번호는 8자리 이상이어야 합니다.");
      return;
    }

    if (editForm.newPassword !== editForm.confirmPassword) {
      alert("새로운 비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const res = await api.post('/members/me', editForm);
      setProfile(res.data.data);
      setIsEditModalOpen(false);

      setEditForm(prev => ({
        ...prev, currentPassword: '', newPassword: '', confirmPassword: ''
      }));

      alert('프로필 정보가 수정되었습니다.');
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
        logout(); navigate('/login');
      }
      else if (err.response?.data?.error?.code === 'INCORRECT_PASSWORD') {
        const errMsg = ('현재 비밀번호가 일치하지 않습니다.');
        alert(errMsg);
      }
      else {
        console.log(err);
        const errMsg = err.response?.data?.error?.message || '프로필 정보를 수정하는 데 실패했습니다.';
        alert(errMsg);
      }
    }

  };


  // 파일 처리 input 숨김용 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 처리 함수
  const uploadProfileImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 10MB를 초과합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const res = await api.post('/members/me/profile-image', formData);

      const newImageUrl = res.data.data.profileImageUrl;
      setProfile(prev => ({ ...prev, profileImageUrl: newImageUrl }));
      updateMember({ profileImageUrl: newImageUrl });
      alert('프로필 이미지가 성공적으로 변경되었습니다.');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error?.message || '이미지 업로드 중 오류가 발생했습니다.';
      alert(errMsg);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
      logout();
      navigate('/login');
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-bg-light text-text-primary font-sans flex flex-col">
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

        {/* 본문 */}
        <div className="flex flex-1 flex-col gap-1 items-center">
          <div className="mx-auto max-w-6xl pt-60">
            <h2 className="text-2xl font-bold text-text-muted px-12">로딩중...</h2>
          </div>

        </div>

        <Footer />
      </div>
    )
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-bg-light text-text-primary font-sans flex flex-col">
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

        {/* 본문 */}
        <div className="flex flex-1 flex-col gap-1 items-center">
          <div className="mx-auto max-w-6xl pt-60">
            <h2 className="text-2xl font-bold text-text-muted px-12">에러가 발생했습니다. <br /> {initError} </h2>
          </div>
        </div>

        <Footer />

      </div>

    )
  }

  return (
    <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
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

            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center md:items-start my-auto">
              <div onClick={() => fileInputRef.current?.click()}
                className="group relative w-24 h-24 rounded-full bg-bg-dark border border-border-light flex items-center justify-center shrink-0 text-text-muted text-xs font-semibold text-center select-none leading-tight cursor-pointer">
                <img src={profile.profileImageUrl || defaultProfileImg} className="w-full h-full rounded-full overflow-hidden object-cover group-hover:opacity-70 transition-opacity"></img>
                <div className="absolute w-7 h-7 right-0 bottom-0 flex items-center justify-center  shrink-0 bg-bg-dark text-white rounded-full opacity-85 group-hover:opacity-95 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => uploadProfileImage(e.target.files)}
              />
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-text-title">{profile.name}</h2>
                <div className="text-sm font-semibold text-text-secondary">
                  {profile.status === 'active' ?
                    (<>{partNames[profile.part]} · {profile.cohort}기 {profile.isCohortLead ? '(기장)' : ''} · {positionNames[profile.position]}</>)
                    : '준회원'
                  }
                </div>
                <div className="text-xs text-text-muted font-medium">
                  가입일 : {formatDate(profile.createdAt)}
                </div>
                <button
                  onClick={() => {
                    setEditForm({ ...profile, currentPassword: '', newPassword: '', confirmPassword: '' });
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
              <div className="flex justify-between gap-4 border-b border-border-light/50 pb-2">
                <span className="text-text-muted whitespace-nowrap shrink-0">학번</span>
                <span className="text-text-primary text-right">{profile.studentId}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border-light/50 pb-2">
                <span className="text-text-muted whitespace-nowrap shrink-0">학과</span>
                <span className="text-text-primary text-right break-keep">{profile.department}</span>
              </div>
              {/* TODO 이메일 길 때 안 예쁨 */}
              <div className="flex justify-between gap-4 border-b border-border-light/50 pb-2">
                <span className="text-text-muted whitespace-nowrap shrink-0">이메일</span>
                <span className="text-text-primary text-right break-all">{profile.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted whitespace-nowrap shrink-0">전화번호</span>
                <span className="text-text-primary text-right">{profile.phone}</span>
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
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-25 text-text-muted text-sm">
                            로딩중...
                          </td>
                        </tr>
                      ) : postError ? (
                        <tr>
                          <td colSpan={6} className="text-center py-38 text-text-muted text-sm">
                            오류가 발생했습니다 <br /> {postError}
                          </td>
                        </tr>
                      ) : totalPosts === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-25 text-text-muted text-sm">
                            내 게시글이 없습니다
                          </td>
                        </tr>
                      ) : posts.map((post) => (
                        <tr
                          key={post.id}
                          onClick={() => navigate(`/posts/${post.id}`)}
                          className="border-b border-border-light hover:bg-bg-light/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post.id}</td>
                          <td className="py-3 px-1 md:px-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${post.board.type === 'notice' ? 'bg-red-50 text-text-danger' : 'bg-bg-light text-text-secondary'
                              }`}>
                              {boardNameTags[post.board.type]}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium">
                            <p className="truncate">{post.title}</p>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs whitespace-nowrap">{formatDate(post.createdAt)}</td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post.viewCount}</td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{post._count.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  {Array.from({ length: totalPostPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePostPageChange(p)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${p === postPage
                        ? 'border border-border-light bg-bg-deep text-text-primary'
                        : 'border border-border-light text-text-muted bg-bg-white hover:bg-bg-light'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
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
                        <th className="py-3 px-1 md:px-2 w-[20%] md:w-[10%] whitespace-nowrap">
                          <span className="hidden md:inline">카테고리</span>
                          <span className="md:hidden">분류</span>
                        </th>
                        <th className="py-3 px-2 text-left w-[40%] md:w-[44%] whitespace-nowrap">댓글 내용</th>
                        <th className="py-3 px-1 md:px-2 w-[25%] md:w-[16%] whitespace-nowrap">날짜</th>
                        <th className="py-3 px-1.5 md:px-2 text-left w-[20%] md:w-[22%]">
                          <span className="hidden md:inline">원본 </span>게시글<span className="hidden md:inline"> 제목</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-38 text-text-muted text-sm">
                            로딩중...
                          </td>
                        </tr>
                      ) : commentError ? (
                        <tr>
                          <td colSpan={5} className="text-center py-38 text-text-muted text-sm">
                            오류가 발생했습니다 <br /> {commentError}
                          </td>
                        </tr>
                      ) : totalComments === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-38 text-text-muted text-sm">
                            내 댓글이 없습니다
                          </td>
                        </tr>
                      ) : comments.map((comment) => (
                        <tr
                          key={comment.id}
                          onClick={() => navigate(`/posts/${comment.post.id}`)}
                          className="border-b border-border-light hover:bg-bg-light/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-1 md:px-2 text-center text-xs font-medium hidden md:table-cell whitespace-nowrap">{comment.id}</td>
                          <td className="py-3 px-1 md:px-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${comment.post.board.type === 'notice' ? 'bg-red-50 text-text-danger' : 'bg-bg-light text-text-secondary'
                              }`}>
                              {boardNameTags[comment.post.board.type]}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium">
                            <div className="h-[32px] md:h-[40px] flex items-center-safe">
                              <p className="text-xs md:text-sm leading-4 md:leading-5 line-clamp-2 break-all ">
                                {comment.content}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-center text-xs whitespace-nowrap">{formatDate(comment.createdAt)}</td>
                          <td className="py-3 px-1.5 md:px-2 text-xs font-medium">
                            <p className="truncate">{comment.post.title}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* 페이지네이션 */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  {Array.from({ length: totalCommentPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handleCommentPageChange(p)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-colors cursor-pointer ${p === commentPage
                        ? 'border border-border-light bg-bg-deep text-text-primary'
                        : 'border border-border-light text-text-muted bg-bg-white hover:bg-bg-light'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
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
                <label className="text-xs font-semibold text-text-primary">현재 비밀번호</label>
                <input
                  type="password"
                  placeholder="현재 비밀번호를 입력해주세요"
                  required
                  value={editForm.currentPassword}
                  onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full border border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-dark bg-bg-white text-text-primary"
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
                <label className="text-xs font-semibold text-text-primary">전화번호</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">새 비밀번호 (8자 이상)</label>
                <input
                  type="password"
                  placeholder="비밀번호 변경 시에 입력해주세요"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full border border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-dark bg-bg-white text-text-primary ${editForm.newPassword && editForm.newPassword.length < 8 ? 'focus:ring-red-300 border-red-300' : ''
                    }`}
                />
                {editForm.newPassword && editForm.newPassword.length < 8 && (
                  <p className="text-xs text-text-danger">비밀번호는 8글자 이상이어야 합니다.</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="비밀번호 변경 시에 입력해주세요"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full border border-border-dark rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border-dark bg-bg-white text-text-primary ${editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword ? 'focus:ring-red-300 border-red-300' : ''
                    }`}
                />
                {editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword && (
                  <p className="text-xs text-text-danger">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>


              <p className="text-xs text-text-muted leading-relaxed break-keep">
                ※ 이름 및 학번 등 수정 가능 항목 외의 수정이 필요하신 경우, 관리자에게 문의해 주시기 바랍니다.
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
