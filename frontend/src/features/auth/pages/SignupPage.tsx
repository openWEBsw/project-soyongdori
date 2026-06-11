import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../lib/api';
import Header from '../../../shared/layout/Header';
import Footer from '../../../shared/layout/Footer';
import signupBg from '../../../assets/signup_bg.jpeg';

const processSteps = [
  { step: 1, title: '회원가입', desc: '계정 생성 · 현재 단계', active: true },
  { step: 2, title: '로그인', desc: '준회원 권한', active: false },
  { step: 3, title: '입부 신청', desc: '지원 동기/파트 작성', active: false },
  { step: 4, title: '승인 완료', desc: '일반 회원 권한 부여', active: false },
];

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', name: '', studentId: '', phone: '', department: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('비밀번호는 8자리 이상이어야 합니다.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다'); return; }
    if (!agree) { setError('개인정보 수집 이용에 동의해주세요'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup', {
        email: form.email,
        password: form.password,
        name: form.name,
        studentId: form.studentId || undefined,
        phone: form.phone || undefined,
        department: form.department || undefined,
      });
      navigate('/login', { state: { signed: true } });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'EMAIL_DUPLICATE') setError('이미 사용 중인 이메일입니다');
      else if (code === 'STUDENT_ID_DUPLICATE') setError('이미 사용 중인 학번입니다');
      else setError('회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* 메인 2컬럼 */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* 좌측: 안내 */}
        <div className="relative bg-bg-light flex-1 flex flex-col justify-between px-8 md:px-16 py-12 md:py-20 overflow-hidden">
          <img src={signupBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/90 to-transparent" />

          <div className="relative">
            <span className="text-text-muted text-xs tracking-widest font-medium uppercase">
              Join SYDR
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-text-title tracking-tight mt-4 leading-tight">
              소용돌이의<br />일원이 되세요.
            </h1>

            <div className="mt-8 text-sm font-light leading-relaxed text-text-secondary">
              <p>먼저 계정을 만들고 로그인 후 입부 신청을 진행해주세요.</p>
              <p>신청서가 승인되면 정식 회원으로 활동할 수 있습니다.</p>
            </div>

            {/* 프로세스 */}
            <div className="mt-12">
              <span className="text-text-muted text-xs tracking-wider uppercase font-medium">
                Process
              </span>
              <div className="mt-4 flex flex-col gap-5">
                {processSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${s.active
                        ? 'bg-btn-primary-bg text-btn-primary-text'
                        : 'border border-border-dark text-text-muted'
                        }`}
                    >
                      {s.step}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text-primary">{s.title}</span>
                      <p className="text-xs text-text-muted mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <span className="relative text-xs text-text-muted tracking-wider mt-12">
            SYDR · CHUNGBUK NATIONAL UNIVERSITY
          </span>
        </div>

        {/* 우측: 회원가입 폼 */}
        <div className="bg-bg-white flex-[3] flex items-start justify-center px-8 md:px-16 py-12 md:py-20 overflow-y-auto">
          <div className="w-full max-w-lg">
            <span className="text-text-muted text-xs tracking-widest font-medium uppercase">
              Sign Up
            </span>
            <h2 className="text-3xl font-bold text-text-title mt-1 mb-2">회원가입</h2>
            <p className="text-sm text-text-muted mb-8">

            </p>

            <form onSubmit={handleSubmit}>
              {/* 이메일 */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                  이메일 <span className="text-text-danger">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                />
              </div>

              {/* 비밀번호 2열 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    비밀번호 <span className="text-text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="8자 이상, 영문/숫자 조합"
                    required
                    className={`w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border ${form.password && form.password.length < 8 ? 'border-red-300 focus:border-red-300' : ''
                      }`}
                  />
                  {form.password && form.password.length < 8 && (
                    <p className="text-xs text-text-danger mt-1.5">비밀번호는 8글자 이상이어야 합니다.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    비밀번호 확인 <span className="text-text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.passwordConfirm}
                    onChange={set('passwordConfirm')}
                    placeholder="비밀번호 확인"
                    required
                    className={`w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border ${form.passwordConfirm && form.password !== form.passwordConfirm ? 'border-red-300 focus:border-red-300' : ''
                      }`}
                  />
                  {form.passwordConfirm && form.password !== form.passwordConfirm && (
                    <p className="text-xs text-text-danger mt-1.5">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              </div>

              {/* 이름 + 학번 2열 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    이름 <span className="text-text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="홍길동"
                    required
                    className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    학번 <span className="text-text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={set('studentId')}
                    placeholder="2022000000"
                    required
                    className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                  />
                </div>
              </div>

              {/* 전화번호 + 학과  */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    전화번호 <span className="text-text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="010-0000-0000"
                    maxLength={11}
                    required
                    className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    학과
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={set('department')}
                    placeholder="소프트웨어학과"
                    className="w-full border border-border-light rounded-md px-4 py-3 text-sm text-text-primary outline-none bg-bg-white focus:border-border-dark transition-colors box-border"
                  />
                </div>
              </div>

              {/* 개인정보 동의 */}
              <div className="flex items-center justify-between mb-6 border-t border-border-light pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                    className="w-4 h-4 border border-border-dark rounded accent-bg-dark"
                  />
                  <span className="text-xs text-text-secondary">(필수) 개인정보 수집 이용에 동의합니다</span>
                </label>
                <button type="button" className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none whitespace-nowrap">
                  자세히 보기
                </button>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-xs text-text-danger mb-4">
                  {error}
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-btn-primary-bg text-btn-primary-text rounded-md py-3.5 text-sm font-bold cursor-pointer transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {loading ? '처리 중...' : '회원가입 →'}
              </button>
            </form>

            {/* 로그인 안내 */}
            <div className="mt-8 text-center">
              <p className="text-xs text-text-muted mb-3">이미 회원이신가요?</p>
              <Link
                to="/login"
                className="text-sm font-bold text-text-primary hover:underline"
              >
                로그인 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SignupPage;
