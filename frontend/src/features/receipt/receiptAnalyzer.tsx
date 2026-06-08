
import api from "../../lib/api";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReceiptAnalyzerProps {
    isOpen: boolean; // 모달이 열렸는지 여부
    onClose: () => void; // 모달을 닫는 함수
    files: File[];
    analyzeResult: string;
    setAnalyzerResult: (value: string) => void;
}

// 포스트 수정, 작성 페이지 로직 그대로 활용하되, ai기능의 엔트리포인트 컴포넌트로써 사용
const ReceiptAnalyzer = ({ isOpen, onClose, files, analyzeResult, setAnalyzerResult }: ReceiptAnalyzerProps) => {

    // TODO 백엔드부 완성 후 테스트

    // TODO 시간되면 복사버튼 제작
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleReceiptAnalyzer = async (files: File[]) => {
        setAnalyzerResult('분석중...');
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        })
        await api.post('/receipt/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then((res) => {
                setAnalyzerResult(res.data.data);
            })
            .catch(err => {
                if (err.response?.data?.error?.code === 'UNAUTHORIZED' || err.response?.data?.error?.code === 'INVALID_TOKEN') {
                    logout(); navigate('/login');
                }
                else {
                    console.log(err);
                    const errMsg = '오류가 발생했습니다.\n' + (err.response?.data?.error?.message || '영수증 정보를 분석하는 데 실패했습니다.');
                    setAnalyzerResult(errMsg);
                }
            })
    }

    return isOpen && (
        <div className="bg-black/50 fixed inset-0 flex flex-col items-center px-6 justify-center z-50">
            <div className="bg-bg-white border-border-light rounded-lg overflow-hidden flex flex-col max-w-3xl w-full shadow-sm text-sm gap-4">
                <div className="bg-bg-light border-b border-border-light px-6 py-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-title">영수증 분석 도구</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <textarea rows={10}
                    className="resize-none border border-border-light rounded mx-5 py-3 px-3 text-sm text-text-primary bg-bg-white focus:outline-none focus:ring-1 focus:ring-border-dark"
                    value={analyzeResult} onChange={(e) => setAnalyzerResult(e.target.value)}>
                </textarea>
                <p className="text-xs text-text-muted leading-relaxed break-keep mx-5">
                    ※ 내용은 업로드 전 반드시 검토하시기 바랍니다. AI는 정보 제공 시 실수를 할 수 있습니다.
                </p>
                <div className="flex justify-end gap-2 m-4 pt-4 border-t border-border-light">
                    <button
                        type="button"
                        onClick={() => handleReceiptAnalyzer(files)}
                        className="px-4 py-2 border border-border-light rounded text-xs font-bold text-text-secondary hover:bg-bg-light cursor-pointer"
                    >
                        분석
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReceiptAnalyzer;