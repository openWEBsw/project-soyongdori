import React from 'react';
import Header from '../../shared/layout/Header';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-bg-white text-text-primary font-sans flex flex-col">
            <Header />
            <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
                <h1 className="text-3xl font-bold">대시보드</h1>
                {/* TODO: 공지 요약, 캘린더 요약, 빠른 진입점 */}
            </main>
        </div>
    );
};

export default Dashboard;