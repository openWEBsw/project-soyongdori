import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { member, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-bg-white border-b border-border-light w-full sticky top-0 z-50">
      <header className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="bg-bg-deep text-text-primary px-5 py-2 rounded-md font-bold tracking-wide text-xs hover:opacity-80 transition-opacity"
          >
            SYDR
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/introduce"
              className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              소개
            </Link>
            <Link
              to="/boards/free"
              className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              게시판
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && member ? (
            <>
              <span className="text-xs text-text-secondary font-medium">{member.name}</span>
              <button
                onClick={handleLogout}
                className="border border-border-dark px-3 py-1.5 rounded text-xs text-text-muted hover:bg-bg-light transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-border-dark px-3 py-1.5 rounded text-xs text-text-secondary hover:bg-bg-light transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
