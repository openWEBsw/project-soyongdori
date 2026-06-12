
import api from "../../lib/api";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReceiptAnalyzerProps {
    isOpen: boolean; // 모달이 열렸는지 여부
    onClose: () => void; // 모달을 닫는 함수
    files: File[];
    analyzeResult: string;
    setAnalyzerResult: (value: string) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    isError: boolean;
    setIsError: (value: boolean) => void;
}

// 포스트 작성 페이지 로직 그대로 활용하되, ai기능의 엔트리포인트 컴포넌트로써 사용
const ReceiptAnalyzer = ({ isOpen, onClose, files, analyzeResult, setAnalyzerResult, isLoading, setIsLoading, isError, setIsError }: ReceiptAnalyzerProps) => {

    // TODO 나중에
    // 파일 선택 로직

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleReceiptAnalyzer = async (files: File[]) => {
        setIsError(false);
        setIsLoading(true);
        setAnalyzerResult('분석중...');
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        })
        await api.post('/receipt/analyze', formData)
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
                    alert(errMsg);
                    setIsError(true);
                    setAnalyzerResult(errMsg);
                }
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    return isOpen && (
        <div className="bg-black/50 fixed inset-0 flex flex-col items-center px-6 justify-center z-50">
            <div className="bg-bg-white border-border-light rounded-lg overflow-hidden flex flex-col max-w-3xl w-full shadow-sm text-sm gap-4">
                <div className="bg-bg-light border-b border-border-light px-6 py-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-title">영수증 분석 도우미</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <textarea rows={15}
                    className={`resize-none border border-border-light rounded mx-5 py-3 px-3 text-sm  focus:outline-none focus:ring-1 focus:ring-border-dark 
                        ${!isLoading ? (!isError ? 'bg-bg-white text-text-primary' : 'border-red-200 text-text-danger bg-red-50') : 'bg-bg-light/30 text-text-primary'}`}
                    disabled={isError || isLoading}
                    value={analyzeResult} onChange={(e) => setAnalyzerResult(e.target.value)} placeholder="첨부된 파일을 기준으로 동작합니다.
영수증 이미지를 모두 첨부한 후 분석 버튼을 눌러주세요.
결과가 출력되면 복사하여 사용해주세요.">
                </textarea>
                <p className="text-xs text-text-muted leading-relaxed break-keep mx-5">
                    ※ 내용은 업로드 전 반드시 검토하시기 바랍니다. AI는 정보 제공 시 실수를 할 수 있습니다.
                </p>
                <div className="flex justify-end gap-2 m-4 pt-4 border-t border-border-light">
                    {!isError && !isLoading && analyzeResult !== '' && (
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(analyzeResult);
                                alert('결과가 클립보드에 복사되었습니다.');
                            }}
                            className="mr-auto px-4 py-2 border border-border-light rounded text-xs font-bold text-text-secondary hover:bg-bg-light cursor-pointer"
                        >
                            결과 복사
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-border-light rounded text-xs font-bold text-text-secondary hover:bg-bg-light cursor-pointer"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        disabled={isLoading || files.length === 0}
                        onClick={() => handleReceiptAnalyzer(files)}
                        className="px-4 py-2 bg-bg-dark text-white rounded text-xs font-bold disabled:opacity-70 hover:opacity-90 cursor-pointer"
                    >
                        {isLoading ? '분석중...' : '분석'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReceiptAnalyzer;