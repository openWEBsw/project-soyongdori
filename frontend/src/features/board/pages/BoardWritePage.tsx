import { useNavigate, useParams } from 'react-router-dom';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

function BoardWritePage() {
  const navigate = useNavigate();
  const { boardType = 'free' } = useParams();
  const boardName = boardNames[boardType] || '게시판';

  return (
    <div style={{ background: '#16171d', minHeight: '100vh', color: '#f3f4f6' }}>
      <div style={{ borderBottom: '1px solid #2e303a', padding: '12px 24px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ border: '1px solid #4b4d5a', padding: '6px 16px', borderRadius: 4, fontWeight: 700, fontSize: 14, background: '#16171d', color: '#f3f4f6', cursor: 'pointer' }}
        >
          SYDR
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          홈 / 게시판 / {boardName} / 글쓰기
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, color: '#f3f4f6' }}>글쓰기</h1>

        <div style={{ border: '1px solid #2e303a', borderRadius: 8, padding: '40px 48px', marginBottom: 32, background: '#1f2028' }}>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#d1d5db' }}>
              게시판 카테고리 <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                defaultValue={boardType}
                style={{ border: '1px solid #2e303a', borderRadius: 6, padding: '10px 16px', fontSize: 14, background: '#16171d', color: '#f3f4f6', cursor: 'pointer', width: 200 }}
              >
                {Object.entries(boardNames).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: '#f87171', background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 4, padding: '4px 10px' }}>
                공지: 회장+ / 기획부: 기획부원+ 등
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#d1d5db' }}>
              제목 <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요 (최대 100자)"
              style={{ width: '100%', border: '1px solid #2e303a', borderRadius: 6, padding: '12px 16px', fontSize: 14, boxSizing: 'border-box', outline: 'none', background: '#16171d', color: '#f3f4f6' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#d1d5db' }}>
              본문 <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div style={{ border: '1px solid #2e303a', borderRadius: '6px 6px 0 0', padding: '8px 12px', display: 'flex', gap: 8, background: '#16171d', borderBottom: 'none' }}>
              {['B', 'I', 'U', 'H1', 'H2', '≡', '—', '🔗', '🖼', '⊞'].map((tool, i) => (
                <button key={i} style={{ border: 'none', background: 'none', fontSize: 13, cursor: 'pointer', padding: '2px 6px', color: '#9ca3af' }}>
                  {tool}
                </button>
              ))}
            </div>
            <textarea
              placeholder={'내용을 입력하세요...\n마크다운 문법을 지원합니다.'}
              rows={12}
              style={{ width: '100%', border: '1px solid #2e303a', borderRadius: '0 0 6px 6px', padding: '16px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: '#16171d', color: '#d1d5db' }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#6b7280', marginTop: 4 }}>0 / 10,000자</div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: '#d1d5db' }}>
              첨부파일 <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>(선택)</span>
            </label>
            <div style={{ border: '1px dashed #2e303a', borderRadius: 6, padding: '24px', textAlign: 'center', fontSize: 13, color: '#6b7280', cursor: 'pointer', background: '#16171d' }}>
              📎 클릭하여 파일 첨부 또는 드래그 앤 드롭 (최대 10MB, 5개)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/boards/${boardType}`)}
            style={{ border: '1px solid #2e303a', padding: '10px 24px', borderRadius: 6, fontSize: 14, background: '#1f2028', color: '#9ca3af', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            style={{ background: '#c084fc', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
          >
            등록 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardWritePage;