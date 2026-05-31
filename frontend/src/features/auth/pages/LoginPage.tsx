import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/boards/free');
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
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-widest text-text-title mb-1">SYDR</div>
          <div className="text-xs text-text-muted">소용돌이 동아리 시스템</div>
        </div>

        <div className="bg-bg-white border border-border-light rounded-lg px-8 py-8 shadow-sm">
          <h2 className="text-lg font-bold text-text-title text-center mb-6">로그인</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                className="w-full border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-text-danger mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-btn-primary-bg text-btn-primary-text rounded-lg py-3 text-sm font-semibold cursor-pointer transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-text-muted">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-text-primary font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
