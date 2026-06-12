import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowRightIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';
import Footer from '../../../shared/layout/Footer';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

interface ExistingAttachment {
  id: string;
  originalFileName: string;
  fileSize: number;
}

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 20;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function BoardEditPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const boardType: string = (location.state as any)?.boardType ?? 'free';
  const { logout } = useAuth();
  const boardName = boardNames[boardType] || '게시판';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/boards/posts/${postId}`)
      .then(res => {
        const data = res.data.data;
        setTitle(data.title);
        setContent(data.content);
        setExistingAttachments(data.attachments ?? []);
      })
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
        else navigate(`/boards/${boardType}`);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...newFiles];
    const errs: string[] = [];
    const totalExisting = existingAttachments.length - deleteIds.length;

    Array.from(incoming).forEach(f => {
      if (totalExisting + next.length >= MAX_FILES) {
        errs.push(`최대 ${MAX_FILES}개까지 첨부할 수 있습니다`);
        return;
      }
      if (f.size > MAX_SIZE) { errs.push(`${f.name}: 파일 크기가 10MB를 초과합니다`); return; }
      if (next.find(x => x.name === f.name && x.size === f.size)) return;
      next.push(f);
    });

    if (errs.length) setError(errs[0]);
    setNewFiles(next);
  };

  const markDelete = (id: string) => setDeleteIds(prev => [...prev, id]);
  const unmarkDelete = (id: string) => setDeleteIds(prev => prev.filter(x => x !== id));
  const removeNewFile = (idx: number) => setNewFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요'); return; }
    if (!confirm('게시글을 저장하시겠습니까?')) return;
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (deleteIds.length > 0) formData.append('deleteAttachmentIds', JSON.stringify(deleteIds));
      newFiles.forEach(f => formData.append('files', f));

      await api.put(`/boards/posts/${postId}`, formData);
      navigate(`/posts/${postId}`, { state: { boardType } });
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
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light text-text-primary flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-12 py-5 md:py-8 pb-20 md:pb-8">
        <div className="text-xs text-text-muted mb-2">홈 / 게시판 / {boardName} / 글 수정</div>
        <h1 className="text-xl md:text-2xl font-bold text-text-title mb-4 md:mb-6">글 수정</h1>

        <div className="bg-bg-white border border-border-light rounded-lg px-4 py-5 sm:px-8 sm:py-8 shadow-sm">
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

          <div className="mb-5">
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

          {/* 첨부파일 */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              첨부파일
              <span className="text-xs text-text-muted font-normal ml-2">최대 {MAX_FILES}개 · 파일당 10MB 이하</span>
            </label>

            {/* 기존 첨부파일 */}
            {existingAttachments.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {existingAttachments.map(att => {
                  const isDeleting = deleteIds.includes(att.id);
                  return (
                    <div
                      key={att.id}
                      className={`flex items-center gap-3 border rounded-lg px-3 py-2 transition-colors ${
                        isDeleting
                          ? 'bg-red-50 border-red-200 opacity-60'
                          : 'bg-bg-light border-border-light'
                      }`}
                    >
                      <PaperClipIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className={`flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap ${isDeleting ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                        {att.originalFileName}
                      </span>
                      <span className="text-xs text-text-muted flex-shrink-0">{formatBytes(att.fileSize)}</span>
                      {isDeleting ? (
                        <button
                          type="button"
                          onClick={() => unmarkDelete(att.id)}
                          className="text-xs text-text-muted hover:text-text-secondary cursor-pointer flex-shrink-0"
                        >
                          취소
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markDelete(att.id)}
                          className="text-text-muted hover:text-text-danger flex-shrink-0 cursor-pointer p-0.5"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 새 파일 추가 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-border-dark bg-bg-deep' : 'border-border-light bg-bg-light hover:border-border-dark hover:bg-bg-deep'
              }`}
            >
              <PaperClipIcon className="w-5 h-5 text-text-muted mx-auto mb-1.5" />
              <div className="text-sm text-text-secondary">클릭하거나 파일을 드래그하여 추가</div>
              <div className="text-xs text-text-muted mt-0.5">이미지, PDF, 문서, 압축파일 등</div>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />

            {newFiles.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {newFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-bg-light border border-border-light rounded-lg px-3 py-2">
                    <PaperClipIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="flex-1 text-xs text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{f.name}</span>
                    <span className="text-xs text-text-muted flex-shrink-0">{formatBytes(f.size)}</span>
                    <button type="button" onClick={() => removeNewFile(i)} className="text-text-muted hover:text-text-danger flex-shrink-0 cursor-pointer p-0.5">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-text-danger mt-4">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate(`/posts/${postId}`, { state: { boardType } })}
            className="border border-border-light px-6 py-2.5 rounded-lg text-sm bg-bg-white text-text-secondary hover:bg-bg-light transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`flex items-center gap-1.5 bg-btn-primary-bg text-btn-primary-text px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {saving ? '저장 중...' : (<>저장 <ArrowRightIcon className="w-4 h-4" /></>)}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BoardEditPage;
