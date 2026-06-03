import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

interface Post {
  id: string;
  title: string;
  isNotice: boolean;
  viewCount: number;
  createdAt: string;
  author: { name: string; part: string | null; cohort: number | null };
  _count: { comments: number };
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.');
}

function BoardListPage() {
  const navigate = useNavigate();
  const { boardType = 'free' } = useParams();
  const { member } = useAuth();
  const boardName = boardNames[boardType] || '게시판';

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => { setPage(1); }, [boardType]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/boards/${boardType}/posts?page=${page}&limit=10`)
      .then(res => {
        setPosts(res.data.data.posts);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      })
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
        else setError('게시글을 불러오지 못했습니다');
      })
      .finally(() => setLoading(false));
  }, [boardType, page]);

  return (
    <div className="min-h-screen bg-bg-light text-text-primary">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-12 py-5 md:py-8 pb-20 md:pb-8">
        {/* 브레드크럼 */}
        <div className="text-xs text-text-muted mb-2">홈 / 게시판 / {boardName}</div>
        <h1 className="text-xl md:text-2xl font-bold text-text-title mb-4 md:mb-6">{boardName}</h1>

        {/* 모바일 카테고리 탭 */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-1 mb-4">
          <div className="flex gap-2 w-max">
            {Object.entries(boardNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => navigate(`/boards/${key}`)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  boardType === key
                    ? 'bg-bg-dark text-white'
                    : 'bg-bg-white border border-border-light text-text-secondary'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* 사이드바 - 데스크톱만 */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="bg-bg-white border border-border-light rounded-lg p-4 shadow-sm">
              <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-3">카테고리</div>
              {Object.entries(boardNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => navigate(`/boards/${key}`)}
                  className={`w-full flex justify-between items-center px-2.5 py-2 rounded-md text-sm mb-0.5 transition-colors text-left cursor-pointer ${
                    boardType === key
                      ? 'bg-bg-dark text-white font-semibold'
                      : 'text-text-secondary hover:bg-bg-light font-normal'
                  }`}
                >
                  <span>{name}</span>
                  {['resource', 'photo'].includes(key) && (
                    <span className="text-[10px] text-text-muted bg-bg-light rounded px-1.5 py-0.5">
                      회원+
                    </span>
                  )}
                  {['planning', 'budget'].includes(key) && (
                    <LockClosedIcon className="w-3 h-3 text-text-muted" />
                  )}
                </button>
              ))}

              <div className="mt-4 pt-4 border-t border-border-light">
                <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">접근 권한</div>
                <ul className="text-xs text-text-muted space-y-1 leading-relaxed">
                  <li>공지/자유: 전체</li>
                  <li>자료/사진: 회원+</li>
                  <li>기획부: 기획부원+</li>
                  <li>동아리비: 총무+</li>
                </ul>
              </div>

              {member && (
                <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-bg-deep flex items-center justify-center flex-shrink-0 text-xs font-bold text-text-primary">
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-primary">{member.name}</div>
                    <div className="text-[10px] text-text-muted">{member.position}</div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="제목 또는 내용으로 검색"
                  className="w-full border border-border-light rounded-lg pl-9 pr-4 py-2.5 text-sm bg-bg-white text-text-primary outline-none focus:border-border-dark transition-colors"
                />
              </div>
              <button
                onClick={() => navigate('/posts/write', { state: { boardType } })}
                className="flex items-center gap-1.5 bg-btn-primary-bg text-btn-primary-text px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <PencilSquareIcon className="w-4 h-4" />
                글쓰기
              </button>
            </div>

            <div className="bg-bg-white border border-border-light rounded-lg overflow-hidden shadow-sm">
              {loading ? (
                <div className="text-center py-16 text-text-muted text-sm">불러오는 중...</div>
              ) : error ? (
                <div className="text-center py-16 text-text-danger text-sm">{error}</div>
              ) : (
                <>
                  {/* 모바일 카드 목록 */}
                  <div className="md:hidden divide-y divide-border-light">
                    {posts.length === 0 ? (
                      <div className="text-center py-12 text-text-muted text-sm">게시글이 없습니다</div>
                    ) : posts.map((post, idx) => (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/posts/${post.id}`, { state: { boardType } })}
                        className={`px-4 py-3.5 cursor-pointer hover:bg-bg-light active:bg-bg-light transition-colors ${post.isNotice ? 'bg-bg-light' : 'bg-bg-white'}`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          {post.isNotice ? (
                            <span className="flex-shrink-0 bg-bg-dark text-white text-[10px] px-1.5 py-0.5 rounded font-bold mt-0.5">공지</span>
                          ) : (
                            <span className="flex-shrink-0 text-[10px] text-text-muted mt-0.5 w-5 text-center">{(page - 1) * 10 + idx + 1}</span>
                          )}
                          <span className="text-sm text-text-primary leading-snug">
                            {post.title}
                            {post._count.comments > 0 && (
                              <span className="text-xs text-text-muted font-semibold ml-1">[{post._count.comments}]</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted ml-7">
                          <span>{post.author.name}</span>
                          <span>·</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>·</span>
                          <span>조회 {post.viewCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 데스크톱 테이블 */}
                  <table className="hidden md:table w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-bg-light border-b border-border-light text-text-muted text-xs font-semibold">
                        <th className="py-3 px-4 text-center w-14">NO.</th>
                        <th className="py-3 px-4 text-left">제목</th>
                        <th className="py-3 px-4 text-center w-20">작성자</th>
                        <th className="py-3 px-4 text-center w-24">날짜</th>
                        <th className="py-3 px-4 text-center w-12">조회</th>
                        <th className="py-3 px-4 text-center w-12">댓글</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-text-muted text-sm">
                            게시글이 없습니다
                          </td>
                        </tr>
                      ) : posts.map((post, idx) => (
                        <tr
                          key={post.id}
                          onClick={() => navigate(`/posts/${post.id}`, { state: { boardType } })}
                          className={`border-b border-border-light cursor-pointer hover:bg-bg-light transition-colors ${post.isNotice ? 'bg-bg-light' : 'bg-bg-white'}`}
                        >
                          <td className="py-3.5 px-4 text-center text-xs text-text-muted">
                            {post.isNotice ? (
                              <span className="bg-bg-dark text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                공지
                              </span>
                            ) : (page - 1) * 10 + idx + 1}
                          </td>
                          <td className="py-3.5 px-4 text-text-primary">
                            {post.title}
                            {post._count.comments > 0 && (
                              <span className="text-xs text-text-muted font-semibold ml-1.5">
                                [{post._count.comments}]
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-text-secondary">
                            {post.author.name}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-text-muted">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-text-muted">
                            {post.viewCount}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-text-muted">
                            {post._count.comments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      p === page
                        ? 'bg-bg-dark text-white border border-bg-dark'
                        : 'bg-bg-white text-text-secondary border border-border-light hover:bg-bg-light'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardListPage;
