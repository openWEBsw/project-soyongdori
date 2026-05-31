import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoardListPage from '../features/board/pages/BoardListPage';
import BoardDetailPage from '../features/board/pages/BoardDetailPage';
import BoardWritePage from '../features/board/pages/BoardWritePage';
import Introduce from '../features/introduce/introduce';
import Profile from '../features/profile/profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/boards/:boardType" element={<BoardListPage />} />
        <Route path="/boards/:boardType/write" element={<BoardWritePage />} />
        <Route path="/boards/:boardType/:postId" element={<BoardDetailPage />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;