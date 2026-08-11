import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthModal } from './components/common/AuthModal';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

import { MainDashboard } from './pages/MainDashboard';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { VocabModule } from './components/modules/VocabModule';
import { GrammarModule } from './components/modules/GrammarModule';
import { WritingModule } from './components/modules/WritingModule';
import { SpeakingModule } from './components/modules/SpeakingModule';
import { ReadingModule } from './components/modules/ReadingModule';
import { ExtraPractice } from './components/modules/ExtraPractice';
import { LeaderboardView } from './pages/LeaderboardView';
import { ShopView } from './pages/ShopView';
import { TestView } from './pages/TestView';

const AppFooter = () => {
  const { lang } = useAppContext();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 sm:mt-14 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center text-xs sm:text-sm font-medium text-slate-400">
      <span className="inline-flex max-w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 shadow-sm">
        {lang === 'zh' ? `© ${year} Jinseo Kim 版权所有。` : `© ${year} Jinseo Kim. All rights reserved.`}
      </span>
    </footer>
  );
};

const AppContent = () => {
  const { user, view, curriculumDb, isAuthLoading } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]" style={{ fontFamily: '"Inter", "Noto Sans SC", sans-serif' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  if (!curriculumDb) {
    return <div className="flex h-screen items-center justify-center text-slate-400 font-bold text-xl">Loading Curriculum...</div>;
  }

  return (
    <div 
      className="flex h-screen h-[100dvh] bg-[#f8fafc] text-slate-800 overflow-hidden relative" 
      style={{ fontFamily: '"Inter", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
        `}
      </style>

      {/* SIDEBAR */}
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative min-w-0">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* WORKSPACE */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-10 bg-slate-50/50">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">
              {view === 'dashboard' && <MainDashboard />}
              {view === 'admin' && <AdminDashboardView />}
              {view === 'vocab' && <VocabModule />}
              {view === 'grammar' && <GrammarModule />}
              {view === 'writing' && <WritingModule />}
              {view === 'speaking' && <SpeakingModule />}
              {view === 'reading' && <ReadingModule />}
              {view === 'extra_practice' && <ExtraPractice />}
              {view === 'leaderboard' && <LeaderboardView />}
              {view === 'shop' && <ShopView />}
              {view === 'test' && <TestView />}
            </div>
            <AppFooter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
