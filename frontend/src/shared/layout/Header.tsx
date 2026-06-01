import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png'

const Header: React.FC = () => {
  const { member, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
      logout();
      navigate('/login');
    }
  };

  // TODO 입부신청, 마이페이지가 출력되는 조건, 위치, 필요성 검토 필요
  return (
    <div className="bg-bg-white border-b border-border-light w-full text-left font-sans">
      <header className="px-6 md:px-12 py-3 flex items-center justify-between">
        {/* 로고 부분 */}
        <div className=" flex-1 flex justify-start">
          <Link
            to="/"
          >
            <img src={logo} alt="logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* NAVBAR 부분 (pc) */}
        <div className="hidden md:flex justify-center text-sm gap-4 tracking-normal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-1 py-2 transition-colors border-b-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
          >
            홈
          </NavLink>
          <NavLink
            to="/board"
            className={({ isActive }) =>
              `px-1 py-2 transition-colors border-b-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
          >
            게시판
          </NavLink>
          <NavLink
            to="/introduce"
            className={({ isActive }) =>
              `px-1 py-2 transition-colors border-b-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
          >
            소개
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `px-1 py-2 transition-colors border-b-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
          >
            캘린더
          </NavLink>
          {!(isAuthenticated && member?.status === 'active') && (<NavLink
            to="/apply"
            className={({ isActive }) =>
              `px-1 py-2 transition-colors border-b-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
          >
            입부신청
          </NavLink>
          )}
        </div>

        {/* NAVBAR 부분 (모바일)  */}
        <div className="bg-bg-white z-50 border-t border-border-dark h-[70px] fixed bottom-0 left-0 w-full flex md:hidden justify-around items-center text-xs leading-relaxed tracking-wide">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>홈</span>
          </NavLink>
          <NavLink
            to="/board"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
            </svg>
            <span>게시판</span>
          </NavLink>
          <NavLink
            to="/introduce"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span>소개</span>
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span>캘린더</span>
          </NavLink>
          {!(isAuthenticated && member?.status === 'active') && (<NavLink
            to="/apply"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            <span>입부신청</span>
          </NavLink>
          )}
          {/* {isMember && (<NavLink
            to="/apply"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-text-primary font-bold border-text-primary' : 'text-text-secondary border-transparent'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>마이페이지</span>
          </NavLink>
          )} */}
        </div>

        {/* 로그인/로그아웃 부분 */}
        <div className=" flex-1 flex justify-end text-xs gap-4">
          {!(isAuthenticated) && (
            <Link
              to="/login"
              className="px-4 py-2 border-border-dark font-bold border rounded-md hover:bg-bg-light transition-colors inline-block"
            >
              로그인
            </Link>
          )}
          {!(isAuthenticated) && (
            <Link
              to="/signup"
              className="px-4 py-2 bg-bg-dark text-white font-bold rounded-md hover:opacity-90 transition-opacity inline-block"
            >
              회원가입
            </Link>
          )}
          {(isAuthenticated && member) && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-border-dark font-bold border rounded-md hover:bg-bg-light transition-colors inline-block cursor-pointer"
            >
              로그아웃
            </button>
          )}
          {(isAuthenticated && member) && (
            <Link
              to="/profile"
              className="px-4 py-2 bg-bg-dark text-white font-bold rounded-md hover:opacity-90 transition-opacity inline-block"
            >
              마이페이지
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
