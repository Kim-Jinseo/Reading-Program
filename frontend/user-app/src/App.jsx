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

const AppContent = () => {
  const { user, view, curriculumDb } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
      <main className="flex-1 flex flex-col h-screen h-[100dvh] overflow-hidden relative w-full">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50">
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