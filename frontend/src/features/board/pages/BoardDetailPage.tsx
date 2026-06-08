import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';
import Footer from '../../../shared/layout/Footer';
import { partNames, canWriteBoard } from '../../../shared/utils/translations';
import defaultProfileImg from '../../../assets/default_profile_image.jpg';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: { name: string; part: string | null; cohort: number | null; profileImageUrl: string | null };
}

interface Attachment {
  id: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  authorId: string;
  author: { name: string; part: string | null; cohort: number | null; profileImageUrl: string | null };
  comments: Comment[];
  attachments: Attachment[];
  _count: { comments: number };
}

function formatDateTime(iso: string) {
  return iso.slice(0, 16).replace('T', ' ').replace(/-/g, '.');
}

function BoardDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const boardType: string = (location.state as any)?.boardType ?? 'free';
  const { member, logout } = useAuth();
  const boardName = boardNames[boardType] || '게시판';

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const viewedPostId = useRef<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    // 비로그인 + 비공개 게시판 → 로그인 페이지로
    if (!member && !['notice', 'free'].includes(boardType)) {
      navigate('/login');
    }
  }, [boardType, member]);

  const fetchPost = () => {
    api.get(`/boards/posts/${postId}`)
      .then(res => setPost(res.data.data))
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPost(); }, [postId]);

  useEffect(() => {
    if (!postId || viewedPostId.current === postId) return;
    viewedPostId.current = postId;
    api.patch(`/boards/posts/${postId}/view`).catch(() => {});
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/boards/posts/${postId}`);
      navigate(`/boards/${boardType}`);
    } catch {
      alert('삭제에 실패했습니다');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/boards/posts/${postId}/comments`, { content: commentText });
      setCommentText('');
      fetchPost();
    } catch {
      alert('댓글 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentEdit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await api.put(`/boards/comments/${commentId}`, { content: editingCommentText });
      setEditingCommentId(null);
      fetchPost();
    } catch {
      alert('댓글 수정에 실패했습니다');
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/boards/comments/${commentId}`);
      fetchPost();
    } catch {
      alert('댓글 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-text-danger text-sm">
          게시글을 찾을 수 없습니다
        </div>
      </div>
    );
  }

  const isAuthor = member?.id === post.authorId;

  return (
    <div className="min-h-screen bg-bg-light text-text-primary flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-12 py-5 md:py-8 pb-20 md:pb-8">
        <div className="text-xs text-text-muted mb-4 md:mb-6">
          홈 / 게시판 / {boardName} / 게시글
        </div>

        <div className="bg-bg-white border border-border-light rounded-lg overflow-hidden mb-4 shadow-sm">
          {/* 게시글 헤더 */}
          <div className="px-4 sm:px-8 pt-6 pb-5 border-b border-border-light">
            <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">
              {boardType} board
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-title leading-snug mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.profileImageUrl || defaultProfileImg}
                  className="w-6 h-6 rounded-full object-cover bg-bg-deep"
                />
                <span className="font-semibold text-text-secondary">{post.author.name}</span>
                {(post.author.cohort || post.author.part) && (
                  <span>
                    {[post.author.cohort ? `${post.author.cohort}기` : null, post.author.part ? partNames[post.author.part] : null].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <span>·</span>
              <span>{formatDateTime(post.createdAt)}</span>
              <span>·</span>
              <span>조회 {post.viewCount}</span>
              <span>·</span>
              <span>댓글 {post._count.comments}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="px-4 sm:px-8 py-6">
            {post.content && (
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-6">
                {post.content}
              </div>
            )}

            {/* 이미지 첨부파일 — 본문에 크게 표시 */}
            {post.attachments.filter(att => att.mimeType.startsWith('image/')).map(att => (
              <img
                key={att.id}
                src={att.filePath.startsWith('/') ? att.filePath : `/${att.filePath}`}
                alt={att.originalFileName}
                className="w-full max-w-2xl mx-auto block rounded-lg mb-4 object-contain"
              />
            ))}

            {/* 일반 파일 첨부 — 다운로드 링크 */}
            {post.attachments.filter(att => !att.mimeType.startsWith('image/')).length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                  <PaperClipIcon className="w-4 h-4" />
                  첨부파일
                </div>
                <div className="flex flex-col gap-2">
                  {post.attachments.filter(att => !att.mimeType.startsWith('image/')).map(att => (
                    <a
                      key={att.id}
                      href={att.filePath.startsWith('/') ? att.filePath : `/${att.filePath}`}
                      download={att.originalFileName}
                      className="flex items-center gap-3 bg-bg-light border border-border-light rounded-lg px-3 py-2.5 text-text-secondary hover:bg-bg-deep transition-colors no-underline"
                    >
                      <PaperClipIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{att.originalFileName}</span>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {att.fileSize < 1024 * 1024 ? `${(att.fileSize / 1024).toFixed(1)}KB` : `${(att.fileSize / 1024 / 1024).toFixed(1)}MB`}
                      </span>
                      <ArrowDownTrayIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 수정/삭제 버튼 */}
          {isAuthor && (
            <div className="flex justify-end gap-2 px-4 sm:px-8 py-4 border-t border-border-light">
              <button
                onClick={() => navigate(`/posts/${postId}/edit`, { state: { boardType } })}
                className="flex items-center gap-1.5 border border-border-dark px-4 py-1.5 rounded text-xs text-text-secondary bg-bg-white hover:bg-bg-light transition-colors cursor-pointer"
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                수정
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 border border-border-light px-4 py-1.5 rounded text-xs text-text-danger bg-bg-white hover:bg-red-50 transition-colors cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-bg-white border border-border-light rounded-lg px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
          <div className="text-sm font-semibold text-text-primary mb-4">
            댓글 <span className="text-text-muted font-normal">{post._count.comments}</span>
          </div>

          {canWriteBoard(boardType, member) ? (
            <div className="border border-border-light rounded-lg p-4 flex gap-3 mb-5 bg-bg-light">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 border-none outline-none text-sm resize-none text-text-secondary bg-transparent font-[inherit]"
                rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleCommentSubmit(); }}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={submitting}
                className={`bg-btn-primary-bg text-btn-primary-text rounded-md px-4 py-2 text-xs font-semibold self-end whitespace-nowrap cursor-pointer transition-opacity ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                등록
              </button>
            </div>
          ) : (
            <div className="border border-border-light rounded-lg p-4 mb-5 bg-bg-light text-center text-sm text-text-muted cursor-pointer hover:bg-bg-deep transition-colors" onClick={() => navigate('/login')}>
              댓글을 작성하려면 로그인이 필요합니다
            </div>
          )}

          {post.comments.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-sm">
              첫 번째 댓글을 남겨보세요
            </div>
          ) : post.comments.map(comment => (
            <div key={comment.id} className="flex gap-3 py-4 border-b border-border-light last:border-0">
              <img
                src={comment.author.profileImageUrl || defaultProfileImg}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-bg-deep"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">{comment.author.name}</span>
                    <span className="text-[10px] text-text-muted">
                      {[comment.author.part ? partNames[comment.author.part] : null, comment.author.cohort ? `${comment.author.cohort}기` : null].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">{formatDateTime(comment.createdAt)}</span>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-1">
                    <textarea
                      value={editingCommentText}
                      onChange={e => setEditingCommentText(e.target.value)}
                      rows={2}
                      className="w-full border border-border-dark rounded-md px-3 py-2 text-sm resize-none outline-none font-[inherit] text-text-secondary box-border"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCommentEdit(comment.id)}
                        className="bg-btn-primary-bg text-btn-primary-text rounded px-3 py-1 text-xs font-semibold cursor-pointer hover:opacity-90"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="border border-border-light bg-bg-white text-text-muted rounded px-3 py-1 text-xs cursor-pointer hover:bg-bg-light"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                    {member?.id === comment.authorId && (
                      <div className="flex gap-3 mt-1.5">
                        <button
                          className="text-xs text-text-muted hover:text-text-secondary cursor-pointer"
                          onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}
                        >
                          수정
                        </button>
                        <button
                          className="text-xs text-text-muted hover:text-text-danger cursor-pointer"
                          onClick={() => handleCommentDelete(comment.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate(`/boards/${boardType}`)}
            className="flex items-center gap-1.5 border border-border-light px-5 py-2 rounded-lg text-sm bg-bg-white text-text-secondary hover:bg-bg-light transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            목록
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BoardDetailPage;
