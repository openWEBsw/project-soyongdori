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
const posts = [
  { id: 142, title: '합주 연습 가시는 분 같이 가요', author: '김OO', date: '2026.05.25', views: 38, comments: 5 },
  { id: 141, title: '이번 주 동아리실 사용 공지', author: '이OO', date: '2026.05.24', views: 87, comments: 12 },
  { id: 140, title: '기타 줄 공동구매 하실 분?', author: '박OO', date: '2026.05.23', views: 52, comments: 8 },
  { id: 139, title: '신입생 환영 파티 후기', author: '최OO', date: '2026.05.22', views: 24, comments: 2 },
  { id: 138, title: '다음 달 공연 일정 공유', author: '정OO', date: '2026.05.21', views: 94, comments: 15 },
];

function BoardListPage() {
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          홈 / 게시판 / {boardName}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#f3f4f6' }}>{boardName}</h1>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* 사이드바 */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ border: '1px solid #2e303a', borderRadius: 8, padding: '16px', background: '#1f2028' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>카테고리</div>
              {Object.entries(boardNames).map(([key, name]) => (
                <div
                  key={key}
                  onClick={() => navigate(`/boards/${key}`)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
                    fontWeight: boardType === key ? 700 : 400,
                    color: boardType === key ? '#f3f4f6' : '#9ca3af',
                    background: boardType === key ? '#2e303a' : 'transparent',
                  }}
                >
                  <span>{name}</span>
                  {['resource', 'photo'].includes(key) && <span style={{ fontSize: 11, color: '#6b7280' }}>회원+</span>}
                  {['planning', 'budget'].includes(key) && <span style={{ color: '#6b7280' }}>🔒</span>}
                </div>
              ))}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2e303a' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>접근 권한</div>
                <ul style={{ fontSize: 12, color: '#9ca3af', listStyle: 'none', padding: 0, margin: 0, lineHeight: 2 }}>
                  <li>• 공지/자유: 전체</li>
                  <li>• 자료/사진: 회원+</li>
                  <li>• 기획부: 기획부원+</li>
                  <li>• 동아리비: 총무+</li>
                </ul>
              </div>

              <div
                onClick={() => navigate('/mypage')}
                style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2e303a', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3d3f4a', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>김OO</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>일반회원 · 기타 · 6기</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder=" 제목 또는 내용으로 검색"
                style={{ flex: 1, border: '1px solid #2e303a', borderRadius: 6, padding: '10px 16px', fontSize: 14, background: '#1f2028', color: '#f3f4f6', outline: 'none' }}
              />
              <select style={{ border: '1px solid #2e303a', borderRadius: 6, padding: '10px 12px', fontSize: 14, background: '#1f2028', color: '#9ca3af', cursor: 'pointer' }}>
                <option>최신순</option>
                <option>조회순</option>
              </select>
              <button
                onClick={() => navigate(`/boards/${boardType}/write`)}
                style={{ background: '#c084fc', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                + 글쓰기
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #2e303a' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e303a', fontSize: 13, color: '#6b7280' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: 60 }}>NO.</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>제목</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: 80 }}>작성자</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: 100 }}>날짜</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: 50 }}>조회</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: 50 }}>댓글</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #2e303a', background: '#1f2028' }}>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ background: '#3d3f4a', color: '#9ca3af', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>PIN</span>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: '#f3f4f6', fontWeight: 500 }}>[필독] 게시판 이용 규칙 안내</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>관리자</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>0000.00.00</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>421</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>3</td>
                </tr>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => navigate(`/boards/${boardType}/${post.id}`)}
                    style={{ borderBottom: '1px solid #2e303a', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1f2028')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>{post.id}</td>
                    <td style={{ padding: '12px 8px', fontSize: 14, color: '#f3f4f6' }}>
                      {post.title}
                      {post.comments > 0 && <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>[{post.comments}]</span>}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>{post.author}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>{post.date}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>{post.views}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>{post.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 24 }}>
              {[1, 2, 3].map((page) => (
                <button key={page} style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: page === 1 ? '#c084fc' : '#1f2028',
                  color: page === 1 ? '#fff' : '#9ca3af',
                  border: page === 1 ? 'none' : '1px solid #2e303a',
                }}>
                  {page}
                </button>
              ))}
              <button style={{ width: 32, height: 32, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#1f2028', color: '#9ca3af', border: '1px solid #2e303a' }}>›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardListPage;