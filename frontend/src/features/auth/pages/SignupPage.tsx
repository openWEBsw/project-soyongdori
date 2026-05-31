import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../lib/api';

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', name: '', studentId: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup', {
        email: form.email,
        password: form.password,
        name: form.name,
        studentId: form.studentId || undefined,
        phone: form.phone || undefined,
      });
      navigate('/login', { state: { signed: true } });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'EMAIL_DUPLICATE') setError('이미 사용 중인 이메일입니다');
      else setError('회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: string, type = 'text', placeholder = '', required = false) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-text-secondary block mb-1.5">
        {label}{' '}
        {required
          ? <span className="text-text-danger">*</span>
          : <span className="text-[10px] text-text-muted font-normal">(선택)</span>
        }
      </label>
      <input
        type={type}
        value={(form as any)[key]}
        onChange={set(key)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-widest text-text-title mb-1">SYDR</div>
          <div className="text-xs text-text-muted">소용돌이 동아리 시스템</div>
        </div>

        <div className="bg-bg-white border border-border-light rounded-lg px-8 py-8 shadow-sm">
          <h2 className="text-lg font-bold text-text-title text-center mb-6">회원가입</h2>

          <form onSubmit={handleSubmit}>
            {field('이메일', 'email', 'email', 'example@email.com', true)}
            {field('비밀번호', 'password', 'password', '8자 이상 입력하세요', true)}
            {field('비밀번호 확인', 'passwordConfirm', 'password', '비밀번호를 다시 입력하세요', true)}
            {field('이름', 'name', 'text', '실명을 입력하세요', true)}
            {field('학번', 'studentId', 'text', '예: 20240001')}
            {field('연락처', 'phone', 'tel', '예: 010-0000-0000')}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-text-danger mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-btn-primary-bg text-btn-primary-text rounded-lg py-3 text-sm font-semibold mt-1 transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-text-primary font-semibold hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
