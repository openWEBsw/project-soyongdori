import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
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

function BoardEditPage() {
  const navigate = useNavigate();
  const { boardType = 'free', postId } = useParams();
  const { logout } = useAuth();
  const boardName = boardNames[boardType] || '게시판';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/boards/posts/${postId}`)
      .then(res => {
        setTitle(res.data.data.title);
        setContent(res.data.data.content);
      })
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
        else navigate(`/boards/${boardType}`);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요'); return; }
    setError('');
    setSaving(true);
    try {
      await api.put(`/boards/posts/${postId}`, { title, content });
      navigate(`/boards/${boardType}/${postId}`);
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate('/login'); return; }
      if (err.response?.status === 403) { setError('수정 권한이 없습니다'); return; }
      setError('수정에 실패했습니다');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-bg-light text-text-primary">
      <Header />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="text-xs text-text-muted mb-2">홈 / 게시판 / {boardName} / 글 수정</div>
        <h1 className="text-2xl font-bold text-text-title mb-6">글 수정</h1>

        <div className="bg-bg-white border border-border-light rounded-lg px-8 py-8 shadow-sm">
          {/* 제목 */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              제목 <span className="text-text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
            />
          </div>

          {/* 본문 */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              본문 <span className="text-text-danger">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={14}
              className="w-full border border-border-light rounded-lg px-4 py-3 text-sm text-text-secondary outline-none bg-bg-white resize-y focus:border-border-dark transition-colors font-[inherit] box-border"
            />
            <div className="text-right text-xs text-text-muted mt-1">{content.length} / 10,000자</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-text-danger mt-4">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate(`/boards/${boardType}/${postId}`)}
            className="border border-border-light px-6 py-2.5 rounded-lg text-sm bg-bg-white text-text-secondary hover:bg-bg-light transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`flex items-center gap-1.5 bg-btn-primary-bg text-btn-primary-text px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {saving ? '저장 중...' : (
              <>저장 <ArrowRightIcon className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardEditPage;
