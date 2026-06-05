import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, partNames, positionNames } from '../../shared/utils/translations';
import defaultProfileImg from '../../assets/default_profile_image.jpg';

interface MemberDetailProps {
    isOpen: boolean; // 모달이 열렸는지 여부
    onClose: () => void; // 모달을 닫는 함수
    memberId: string;
}

// !! 연결하는 쪽에서 useState와 handle 함수로 관리하여 prop으로 넘기면 됨

// js 부분
//   const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

//   const handleMemberDetail = () => {
//     setIsMemberModalOpen(true);
//   };

//   const handleMemberDetailClose = () => {
//     setIsMemberModalOpen(false);
//   };

// html 부분
//   <button
//     onClick={handleMemberDetail}
//     className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer"
//   >
//     열어서 테스트
//   </button>
//   {isMemberModalOpen && (<MemberDetail isOpen={isMemberModalOpen} onClose={handleMemberDetailClose} memberId={'1'} />)}

interface ProfileData {
    status: string;
    name: string;
    part: string;
    position: string;
    isCohortLead: boolean;
    cohort: number;
    createdAt: string;
    profileImageUrl: string;
}

const MemberDetail = ({ isOpen, onClose, memberId }: MemberDetailProps) => {

    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [profile, setProfile] = useState<ProfileData>({ status: '', name: '', part: '', position: '', isCohortLead: false, cohort: 0, createdAt: '', profileImageUrl: '' });

    useEffect(() => {
        setLoading(true);
        setError('');
        api.get(`/members/${memberId}`).then((response) => {
            setProfile(response.data.data);
        })
            .catch(err => {
                if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
                    logout(); navigate('/login');
                }
                else {
                    console.log(err);
                    setError('코드 : ' + err.response?.data?.error?.code + ' 프로필 정보를 불러오는 데 실패했습니다.');
                }
            })
            .finally(() => {
                setLoading(false);
            })
    }, [memberId])

    return isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-white rounded-lg shadow-xl max-w-xs w-full overflow-hidden text-left border border-border-light flex flex-col">
                { /* 헤더 */}
                <div className="bg-bg-light border-b border-border-light px-6 py-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-title">멤버 프로필</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 회원정보 */}
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="py-25">
                            <h2 className="text-xs font-bold text-text-muted px-12">로딩중...</h2>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center">
                        <div className="py-25">
                            <h2 className="text-xs font-bold text-text-muted px-12">에러가 발생했습니다. <br /> {error} </h2>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 py-5 items-center">
                        <div
                            className="group relative w-24 h-24 rounded-full bg-bg-dark border border-border-light flex items-center justify-center shrink-0 text-text-muted text-xs font-semibold text-center select-none leading-tight">
                            <img src={profile.profileImageUrl || defaultProfileImg} className="w-full h-full rounded-full overflow-hidden object-cover"></img>
                        </div>
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className="text-2xl font-bold text-text-title">{profile.name}</h2>
                            <div className="text-sm font-semibold text-text-secondary">
                                {profile.status === 'active' ?
                                    (<>{partNames[profile.part]} · {profile.cohort}기 {profile.isCohortLead ? '(기장)' : ''} · {positionNames[profile.position]}</>)
                                    : '준회원'
                                }
                            </div>
                            <div className="text-xs text-text-muted font-medium">
                                가입일 : {formatDate(profile.createdAt)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MemberDetail;
