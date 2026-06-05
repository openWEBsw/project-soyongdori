import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Home from '../features/home/home';
import BoardListPage from '../features/board/pages/BoardListPage';
import BoardDetailPage from '../features/board/pages/BoardDetailPage';
import BoardWritePage from '../features/board/pages/BoardWritePage';
import BoardEditPage from '../features/board/pages/BoardEditPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import ApplicationPage from '../features/application/pages/ApplicationPage';
import Introduce from '../features/introduce/introduce';
import Profile from '../features/profile/profile';
import ErrorPage from '../features/error/ErrorPage';
import Calendar from '../features/calendar/Calendar';
import AdminPage from '../features/admin/AdminPage';
import { positionToLevel } from '../lib/permission';
import MemberDetail from '../features/member/memberDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function MemberBlockRout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, member } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (member?.status === 'active') return <Navigate to="/home" replace />;
  return <>{children}</>;
}

// 관리자 라우트 가드 (level≥5)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, member } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (positionToLevel(member?.position) < 5) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route path="/introduce" element={<Introduce />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/boards" element={<Navigate to="/boards/free" replace />} />
        <Route path="/boards/:boardType" element={<ProtectedRoute><BoardListPage /></ProtectedRoute>} />
        <Route path="/posts/write" element={<ProtectedRoute><BoardWritePage /></ProtectedRoute>} />
        <Route path="/posts/:postId/edit" element={<ProtectedRoute><BoardEditPage /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><BoardDetailPage /></ProtectedRoute>} />

        <Route path="/apply" element={<MemberBlockRout><ApplicationPage /></MemberBlockRout>} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/calendar" element={<Calendar />} />

        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
