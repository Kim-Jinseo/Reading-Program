import React, { useState } from 'react';
import { Home, BookOpen, Trophy, ShoppingBag, ClipboardCheck, Globe, ShieldCheck, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { isPracticeSubject } from '../practice/PracticeCards';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t, lang, setLang, view, setView, user } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const MODULES = [
    { id: 'dashboard', icon: <Home size={20}/>, bg: 'bg-slate-100', color: 'text-slate-600' },
    { id: 'classes', icon: <Users size={20}/>, bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { id: 'practice', icon: <BookOpen size={20}/>, bg: 'bg-teal-100', color: 'text-teal-600' },
    { id: 'leaderboard', icon: <Trophy size={20}/>, bg: 'bg-amber-100', color: 'text-amber-600' },
    { id: 'shop', icon: <ShoppingBag size={20}/>, bg: 'bg-pink-100', color: 'text-pink-600' },
    { id: 'test', icon: <ClipboardCheck size={20}/>, bg: 'bg-emerald-100', color: 'text-emerald-600' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:relative inset-y-0 left-0 h-[100dvh] bg-white border-r border-slate-200 flex flex-col z-[70] shrink-0 motion-safe:transition-transform motion-safe:duration-200 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'lg:w-[88px] w-64' : 'w-64 lg:w-[248px]'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          aria-label={t('nav_close')}
          className="lg:hidden absolute top-6 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          <X size={20} />
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          aria-label={t(isCollapsed ? 'nav_expand' : 'nav_collapse')}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

      <div className={`px-5 py-7 flex items-center justify-between mb-4 bg-white ${isCollapsed ? 'lg:px-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 mx-auto">
            <BookOpen size={20} className="text-white"/>
          </div>
            <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className="font-bold text-xl tracking-tight text-slate-800 leading-tight">Stepping</span>
              <span className="font-medium text-xs tracking-[0.18em] text-slate-500 uppercase mt-1">Stones</span>
            </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3">
        {user.role === 'admin' && (
          <button 
            onClick={() => setView('admin')} 
            aria-label={t('nav_admin')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-5 py-4'} rounded-2xl font-bold transition-all text-base mb-4 
            ${view === 'admin' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
          >
            <ShieldCheck size={22}/> <span className={isCollapsed ? 'lg:hidden' : ''}>{t('nav_admin')}</span>
          </button>
        )}

        {MODULES.map(item => {
          const active = view === item.id || (item.id === 'practice' && (isPracticeSubject(view) || view === 'extra_practice'));
          return (
          <button 
            key={item.id} 
            aria-label={t(`nav_${item.id}`)}
            aria-current={active ? 'page' : undefined}
            title={isCollapsed ? t(`nav_${item.id}`) : undefined}
            onClick={() => {
              setView(item.id);
              if (setIsMobileOpen) setIsMobileOpen(false);
            }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 ${isCollapsed ? 'lg:justify-center lg:px-0 lg:gap-0' : ''} rounded-xl font-semibold transition-colors text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600
            ${active ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${active ? 'bg-white text-indigo-600' : item.color}`}>
              {item.icon}
            </div>
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{t(`nav_${item.id}`)}</span>
          </button>
        ); })}
      </nav>

      <div className={`p-4 border-t border-slate-100 flex ${isCollapsed ? 'justify-center' : ''}`}>
        <button 
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} 
          className={`flex min-h-11 items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors border border-slate-200 ${isCollapsed ? 'w-12 h-12 p-0' : 'w-full'}`}
          title={lang === 'en' ? '中文' : 'English'}
          aria-label={lang === 'en' ? '中文' : 'English'}
        >
          <Globe size={20}/> {!isCollapsed && (lang === 'en' ? '中文' : 'English')}
        </button>
      </div>
    </aside>
    </>
  );
};
