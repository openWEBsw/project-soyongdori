import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../shared/layout/Header';
import Footer from '../../shared/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';

const Calendar = () => {
    const { member } = useAuth();
    return (
        <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
            <Header />
            <main className="flex-1 bg-bg-light">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-accent-primary">Calendar</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-text-title">활동 일정</h1>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/boards/notice"
                                className="px-5 py-2 bg-btn-secondary-bg text-btn-secondary-text rounded hover:bg-btn-secondary-hover transition-colors"
                            >
                                공지사항
                            </Link>
                            {member?.position === 'President' || member?.position === 'Admin' ? (
                                <Link
                                    to="/boards/notice/create"
                                    className="px-5 py-2 bg-btn-primary-bg text-btn-primary-text rounded hover:bg-btn-primary-hover transition-colors"
                                >
                                    글쓰기
                                </Link>
                            ) : null}
                        </div>
                    </div>


                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Calendar;
