import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const INSTAGRAM_URL = 'https://www.instagram.com/_soyongdori_/';
const YOUTUBE_URL = 'https://www.youtube.com/@ilovelecguitar';
const GAME_URL = 'https://sydrhythm.pages.dev/';
const QUIZ_URL = 'https://band-quiz.pages.dev/';

const InstagramIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const GamepadIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

const TimerIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
  </svg>
);

const YoutubeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const Footer: React.FC = () => {
  const { isAuthenticated, member } = useAuth();
  return (
    <footer className="bg-bg-white border-t border-border-light">
      <div className="px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between gap-6 text-xs text-text-muted">
        <div className="flex flex-col gap-3">
          <span>© 2026 SOYONGDORI · 충북대학교 중앙동아리</span>
          <div className="flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <YoutubeIcon />
            </a>
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="소용돌이 리듬 게임"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <GamepadIcon />
            </a>
            <a
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="밴드 퀴즈"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <TimerIcon />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <Link to="/home" className="hover:text-text-primary transition-colors">HOME</Link>
          <span>·</span>
          <Link to="/introduce" className="hover:text-text-primary transition-colors">ABOUT</Link>
          <span>·</span>
          <Link to="/boards/free" className="hover:text-text-primary transition-colors">BOARD</Link>
          <span>·</span>
          <Link to="/calendar" className="hover:text-text-primary transition-colors">CALENDAR</Link>
          {!(isAuthenticated && member?.status === 'active') && (
            <>
              <span>·</span>
              <Link to="/apply" className="hover:text-text-primary transition-colors">JOIN</Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
