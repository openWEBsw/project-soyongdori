import { useNavigate, useParams } from 'react-router-dom';

const boardNames: Record<string, string> = {
  notice: '공지 게시판',
  free: '자유 게시판',
  resource: '자료 게시판',
  photo: '사진 게시판',
  planning: '기획부 게시판',
  budget: '동아리비 내역',
};

// 나중에 api로 교체
const comments = [
  { name: '이OO', part: '기타 · 6기', content: '오 저 갑니다! 기타 들고 갈게요', date: '0000.00.00', time: '00:00' },
  { name: '박OO', part: '드럼 · 5기', content: '드럼 가능해요 시간 맞춰서 갈게요', date: '0000.00.00', time: '00:00' },
];

function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardType = 'free' } = useParams();
  const boardName = boardNames[boardType] || '게시판';

  // TODO: 나중에 로그인 정보로 교체
  const isAdmin = false;
  const isAuthor = true;

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
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
          홈 / 게시판 / {boardName} / 게시글
        </div>

        <div style={{ border: '1px solid #2e303a', borderRadius: 8, padding: '40px 48px', marginBottom: 32, background: '#1f2028' }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, letterSpacing: 1 }}>
            {boardType.toUpperCase()} BOARD
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, marginBottom: 24, color: '#f3f4f6' }}>
            합주 연습 가시는 분<br />같이 가요
          </h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3d3f4a' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>김OO</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>기타 · 6기</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#6b7280' }}>
              <div>0000.00.00 &nbsp; 00:00</div>
              <div>조회 38 · 댓글 5</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 32 }}>
            {isAuthor && (
              <button style={{ border: '1px solid #2e303a', padding: '6px 16px', borderRadius: 4, fontSize: 13, background: '#16171d', color: '#9ca3af', cursor: 'pointer' }}>수정</button>
            )}
            {isAuthor && (
              <button style={{ border: '1px solid #2e303a', padding: '6px 16px', borderRadius: 4, fontSize: 13, background: '#16171d', color: '#9ca3af', cursor: 'pointer' }}>삭제</button>
            )}
            {isAdmin && (
              <button style={{ border: '1px solid #7f1d1d', color: '#f87171', padding: '6px 16px', borderRadius: 4, fontSize: 13, background: '#16171d', cursor: 'pointer' }}>
                숨김 <span style={{ fontSize: 11 }}>(회장+)</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.8, marginBottom: 32 }}>
            <p>안녕하세요! 이번 주 토요일 오후 2시쯤 동방에서 합주 연습 하려고 하는데 같이 하실 분 있으신가요?</p>
            <br />
            <p>곡은 자유롭게 정해도 됩니다. 보컬 분도 환영</p>
          </div>

          <div style={{ border: '1px solid #2e303a', borderRadius: 6, padding: '16px 20px', fontSize: 13, color: '#6b7280', background: '#16171d' }}>
            📎 IMG_5524.jpg (첨부 이미지)
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 16, color: '#9ca3af' }}>
            COMMENTS ({comments.length})
          </div>

          <div style={{ border: '1px solid #2e303a', borderRadius: 8, padding: '16px 20px', display: 'flex', gap: 12, marginBottom: 16, background: '#1f2028' }}>
            <textarea
              placeholder="댓글을 입력하세요..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, resize: 'none', color: '#d1d5db', background: 'transparent' }}
              rows={2}
            />
            <button style={{ background: '#c084fc', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end', fontWeight: 600 }}>
              등록
            </button>
          </div>

          {comments.map((comment, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid #2e303a' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3d3f4a', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>{comment.name}</span>
                    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{comment.part}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{comment.date} &nbsp; {comment.time}</span>
                </div>
                <p style={{ fontSize: 14, color: '#d1d5db', margin: 0 }}>{comment.content}</p>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>↳ 답글 | 수정 | 삭제</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/boards/${boardType}`)}
            style={{ border: '1px solid #2e303a', padding: '8px 20px', borderRadius: 6, fontSize: 13, background: '#1f2028', color: '#9ca3af', cursor: 'pointer' }}
          >
            ← 목록
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ border: '1px solid #2e303a', padding: '8px 20px', borderRadius: 6, fontSize: 13, background: '#1f2028', color: '#9ca3af', cursor: 'pointer' }}>‹ 이전</button>
            <button style={{ border: '1px solid #2e303a', padding: '8px 20px', borderRadius: 6, fontSize: 13, background: '#1f2028', color: '#9ca3af', cursor: 'pointer' }}>다음 ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;