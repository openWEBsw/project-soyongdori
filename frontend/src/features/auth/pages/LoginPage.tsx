import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';
import Footer from '../../../shared/layout/Footer';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, member } = res.data.data;
      login(token, member);
      navigate('/home');
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'INVALID_CREDENTIALS') setError('이메일 또는 비밀번호가 올바르지 않습니다');
      else if (code === 'INACTIVE_ACCOUNT') setError('비활성화된 계정입니다');
      else setError('로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* 메인 2컬럼 */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* 좌측: 환영 메시지 */}
        <div className="bg-bg-light flex-1 flex flex-col justify-between px-8 md:px-16 py-12 md:py-20">
          <div>
            <span className="text-text-muted text-xs tracking-widest font-medium uppercase">
              Welcome Back
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-text-title tracking-tight mt-4 leading-tight">
              돌아오신 걸<br />환영합니다.
            </h1>

            <div className="mt-8 text-sm font-light leading-relaxed text-text-secondary">
              <p>소용돌이의 무대로 돌아오신 걸 환영합니다.</p>
            </div>
          </div>

          <span className="text-xs text-text-muted tracking-wider mt-12">
            SYDR · CHUNGBUK NATIONAL UNIV
          </span>
        </div>

        {/* 우측: 로그인 폼 */}
        <div className="bg-bg-white flex-3 flex items-center justify-center px-8 md:px-16 py-12 md:py-20">
          <div className="w-full max-w-md">
            <span className="text-text-muted text-xs tracking-widest font-medium uppercase">
              Sign In
            </span>
            <h2 className="text-3xl font-bold text-text-title mt-1 mb-2">로그인</h2>
            <p className="text-sm text-text-muted mb-8">
              소용돌이 회원만 이용 가능합니다
            </p>

            <form onSubmit={handleSubmit}>
              {/* 이메일 */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                />
              </div>

              {/* 비밀번호 */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                />
              </div>

              {/* 로그인 유지 + 비밀번호 찾기 */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-border-dark rounded accent-bg-dark"
                  />
                  <span className="text-xs text-text-secondary">로그인 상태 유지</span>
                </label>
                <button type="button" className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none">
                  비밀번호 찾기
                </button>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-xs text-text-danger mb-4">
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-btn-primary-bg text-btn-primary-text rounded-md py-3.5 text-sm font-bold cursor-pointer transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {loading ? '로그인 중...' : '로그인 →'}
              </button>
            </form>

            {/* 회원가입 안내 */}
            <div className="mt-8 text-center">
              <p className="text-xs text-text-muted mb-3">아직 회원이 아니신가요?</p>
              <Link
                to="/signup"
                className="text-sm font-bold text-text-primary border border-border-dark rounded-md px-6 py-2.5 hover:bg-bg-light transition-colors inline-block"
              >
                회원가입 →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
