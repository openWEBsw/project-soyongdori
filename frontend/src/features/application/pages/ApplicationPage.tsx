import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../shared/layout/Header';

const partOptions = [
  { value: 'vocal', label: '보컬' },
  { value: 'drum', label: '드럼' },
  { value: 'electric', label: '일렉기타' },
  { value: 'keyboard', label: '키보드' },
  { value: 'bass', label: '베이스' },
  { value: 'etc', label: '기타' },
];

function ApplicationPage() {
  const navigate = useNavigate();
  const { member } = useAuth();
  const [part, setPart] = useState('');
  const [motivation, setMotivation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!part) { setError('파트를 선택해주세요'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/applications', { part, motivation });
      setDone(true);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === 'ALREADY_APPLIED') setError('이미 입부신청을 완료했습니다');
      else setError('입부신청에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center bg-bg-white border border-border-light rounded-lg px-12 py-14 shadow-sm">
            <CheckCircleIcon className="w-14 h-14 text-text-muted mx-auto mb-5" />
            <h2 className="text-xl font-bold text-text-title mb-2">입부신청 완료!</h2>
            <p className="text-sm text-text-muted mb-8">검토 후 승인 연락이 갈 예정입니다.</p>
            <button
              onClick={() => navigate('/boards/free')}
              className="bg-btn-primary-bg text-btn-primary-text rounded-lg px-7 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              게시판으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl font-black tracking-widest text-text-title mb-1">SYDR</div>
            <div className="text-xs text-text-muted">소용돌이 동아리 입부신청</div>
          </div>

          <div className="bg-bg-white border border-border-light rounded-lg px-8 py-8 shadow-sm">
            <h2 className="text-lg font-bold text-text-title text-center mb-6">입부신청</h2>

            {/* 신청자 정보 */}
            <div className="bg-bg-light border border-border-light rounded-lg px-4 py-3.5 mb-6">
              <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2">신청자 정보</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-text-muted">이름: </span>
                  <span className="text-xs text-text-secondary font-medium">{member?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted">이메일: </span>
                  <span className="text-xs text-text-secondary font-medium">{member?.email || '-'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 파트 선택 */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-text-secondary block mb-3">
                  파트 선택 <span className="text-text-danger">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {partOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPart(opt.value)}
                      className={`border rounded-lg py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                        part === opt.value
                          ? 'border-bg-dark bg-bg-dark text-white font-semibold'
                          : 'border-border-light bg-bg-white text-text-secondary hover:bg-bg-light'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지원 동기 */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  지원 동기{' '}
                  <span className="text-[10px] text-text-muted font-normal">(선택)</span>
                </label>
                <textarea
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  placeholder="동아리에 지원하게 된 동기를 자유롭게 작성해주세요."
                  rows={5}
                  className="w-full border border-border-light rounded-lg px-4 py-3 text-sm text-text-secondary outline-none bg-bg-white resize-y focus:border-border-dark transition-colors font-[inherit] box-border"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-text-danger mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 border border-border-light rounded-lg py-2.5 text-sm bg-bg-white text-text-secondary hover:bg-bg-light transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-[2] bg-btn-primary-bg text-btn-primary-text rounded-lg py-2.5 text-sm font-semibold transition-opacity ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                >
                  {loading ? '신청 중...' : '입부신청 제출'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationPage;
