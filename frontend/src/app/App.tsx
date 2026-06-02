import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../features/dashboard/dashboard';
import BoardListPage from '../features/board/pages/BoardListPage';
import BoardDetailPage from '../features/board/pages/BoardDetailPage';
import BoardWritePage from '../features/board/pages/BoardWritePage';
import BoardEditPage from '../features/board/pages/BoardEditPage';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import ApplicationPage from '../features/application/pages/ApplicationPage';
import Introduce from '../features/introduce/introduce';
import Profile from '../features/profile/profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/introduce" element={<Introduce />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/boards" element={<Navigate to="/boards/free" replace />} />
        <Route path="/boards/:boardType" element={<ProtectedRoute><BoardListPage /></ProtectedRoute>} />
        <Route path="/posts/write" element={<ProtectedRoute><BoardWritePage /></ProtectedRoute>} />
        <Route path="/posts/:postId/edit" element={<ProtectedRoute><BoardEditPage /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><BoardDetailPage /></ProtectedRoute>} />

        <Route path="/apply" element={<ProtectedRoute><ApplicationPage /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
