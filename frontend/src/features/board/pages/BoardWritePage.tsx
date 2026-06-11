import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PaperClipIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';
import ReceiptAnalyzer from '../../receipt/receiptAnalyzer';
import Footer from '../../../shared/layout/Footer';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function BoardWritePage() {

  // 영수증 분석 관련 js 부분
  // 영수증 분석 관련 로직
  const [analyzerResult, setAnalyzerResult] = useState('영수증을 모두 첨부한 후 분석 버튼을 눌러주세요. \n결과가 출력되면 복사하여 사용해주세요.');
  const [isReceiptAnalyzerOpen, setIsReceiptAnalyzerOpen] = useState(false);

  const handleReceiptAnalyzer = () => {
    setIsReceiptAnalyzerOpen(true);
  };

  const handleReceiptAnalyzerClose = () => {
    setIsReceiptAnalyzerOpen(false);
  };
  //

  const navigate = useNavigate();
  const location = useLocation();
  const initialBoardType: string = (location.state as any)?.boardType ?? 'free';
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBoard, setSelectedBoard] = useState(initialBoardType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files];
    const errs: string[] = [];

    Array.from(incoming).forEach(f => {
      if (next.length >= MAX_FILES) { errs.push(`최대 ${MAX_FILES}개까지 첨부할 수 있습니다`); return; }
      if (f.size > MAX_SIZE) { errs.push(`${f.name}: 파일 크기가 10MB를 초과합니다`); return; }
      if (next.find(x => x.name === f.name && x.size === f.size)) return;
      next.push(f);
    });

    if (errs.length) setError(errs[0]);
    setFiles(next);
  };

  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력해주세요'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요'); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      files.forEach(f => formData.append('files', f));

      const res = await api.post(`/boards/${selectedBoard}/posts`, formData);
      navigate(`/posts/${res.data.data.id}`, { state: { boardType: selectedBoard } });
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate('/login'); return; }
      setError('게시글 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-text-primary flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-12 py-5 md:py-8 pb-20 md:pb-8">
        <div className="text-xs text-text-muted mb-2">홈 / 게시판 / {boardNames[selectedBoard] || '게시판'} / 글쓰기</div>
        <h1 className="text-xl md:text-2xl font-bold text-text-title mb-4 md:mb-6">글쓰기</h1>

        <div className="bg-bg-white border border-border-light rounded-lg px-4 py-5 sm:px-8 sm:py-8 shadow-sm">
          <div className="mb-5">
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              게시판 <span className="text-text-danger">*</span>
            </label>
            <select
              value={selectedBoard}
              onChange={e => setSelectedBoard(e.target.value)}
              className="border border-border-light rounded-lg px-3 py-2.5 text-sm bg-bg-white text-text-secondary outline-none cursor-pointer w-48 focus:border-border-dark transition-colors"
            >
              {Object.entries(boardNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-text-secondary block mb-2">
              제목 <span className="text-text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요 (최대 100자)"
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
              placeholder="내용을 입력하세요..."
              rows={12}
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

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver
                ? 'border-border-dark bg-bg-deep'
                : 'border-border-light bg-bg-light hover:border-border-dark hover:bg-bg-deep'
                }`}
            >
              <PaperClipIcon className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <div className="text-sm text-text-secondary">클릭하거나 파일을 드래그하여 첨부</div>
              <div className="text-xs text-text-muted mt-1">이미지, PDF, 문서, 압축파일 등</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />

            {files.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-bg-light border border-border-light rounded-lg px-3 py-2">
                    <PaperClipIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="flex-1 text-xs text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{f.name}</span>
                    <span className="text-xs text-text-muted flex-shrink-0">{formatBytes(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-text-muted hover:text-text-danger flex-shrink-0 cursor-pointer p-0.5"
                    >
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
            onClick={() => navigate(`/boards/${selectedBoard}`)}
            className="border border-border-light px-6 py-2.5 rounded-lg text-sm bg-bg-white text-text-secondary hover:bg-bg-light transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-1.5 bg-btn-primary-bg text-btn-primary-text px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? '등록 중...' : (
              <>등록 <ArrowRightIcon className="w-4 h-4" /></>
            )}


          </button>
          {/* 영수증 분석 관련 테스트 버튼 (TODO 추후 제대로 삽입, 권한 및 표시조건 수정) */}
          <button
            onClick={handleReceiptAnalyzer}
            className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            열어서 테스트
          </button>
          {isReceiptAnalyzerOpen && (<ReceiptAnalyzer isOpen={isReceiptAnalyzerOpen} onClose={handleReceiptAnalyzerClose} files={files} analyzeResult={analyzerResult} setAnalyzerResult={setAnalyzerResult} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BoardWritePage;
