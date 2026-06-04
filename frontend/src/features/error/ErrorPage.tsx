import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../shared/layout/Header';
import Footer from '../../shared/layout/Footer';

interface ErrorPageProps {
  code?: string | number;
  title?: string;
  description?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  code = 404,
  title = '페이지를 찾을 수 없습니다',
  description = '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
      <Header />

      <section className="flex-1 bg-bg-light border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 flex flex-col items-center text-center">
          <span className="text-text-muted text-xs tracking-widest font-medium uppercase mb-3">
            Error
          </span>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-text-title leading-none">
            {code}
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-text-title mt-6">
            {title}
          </h2>
          <p className="text-sm md:text-base font-light leading-relaxed text-text-secondary mt-4 max-w-md">
            {description}
          </p>

          <div className="flex gap-3 mt-8">
            <Link
              to="/home"
              className="bg-btn-primary-bg text-btn-primary-text px-6 py-3 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
            >
              홈으로 →
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-btn-secondary-bg text-btn-secondary-text px-6 py-3 rounded-md text-sm font-bold border border-border-dark hover:bg-bg-light transition-colors cursor-pointer"
            >
              이전 페이지
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ErrorPage;
