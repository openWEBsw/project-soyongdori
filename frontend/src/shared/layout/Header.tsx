// TODO NAVBAR 필요
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <div className="bg-bg-white border-b border-border-light w-full text-left">
      <header className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="bg-bg-deep text-text-primary px-6 py-2 rounded-md font-bold tracking-wide text-xs hover:opacity-80 transition-opacity inline-block"
        >
          SYDR
        </Link>
      </header>
    </div>
  );
};

export default Header;
