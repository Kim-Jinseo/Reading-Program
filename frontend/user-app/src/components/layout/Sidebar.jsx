import React, { useState } from 'react';
import { Home, Book, Edit3, PenTool, Mic, BookOpen, Trophy, ShoppingBag, ClipboardCheck, Globe, ShieldCheck, ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t, lang, setLang, view, setView, user } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const MODULES = [
    { id: 'dashboard', icon: <Home size={20}/>, bg: 'bg-slate-100', color: 'text-slate-600' },
    { id: 'classes', icon: <Users size={20}/>, bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { id: 'vocab', icon: <Book size={20}/>, bg: 'bg-sky-100', color: 'text-sky-600' },
    { id: 'grammar', icon: <Edit3 size={20}/>, bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { id: 'reading', icon: <BookOpen size={20}/>, bg: 'bg-teal-100', color: 'text-teal-600' },
    { id: 'writing', icon: <PenTool size={20}/>, bg: 'bg-purple-100', color: 'text-purple-600' },
    { id: 'speaking', icon: <Mic size={20}/>, bg: 'bg-rose-100', color: 'text-rose-600' },
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
      
      <aside className={`fixed lg:relative inset-y-0 left-0 h-[100dvh] bg-white border-r border-slate-200 flex flex-col shadow-2xl z-[70] shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'lg:w-[88px] w-64' : 'w-64 lg:w-[300px]'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-6 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          <X size={20} />
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

      <div className={`p-8 flex items-center justify-between border-b border-slate-50 mb-6 bg-white transition-all ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-md shrink-0 mx-auto">
            <BookOpen size={20} className="text-white"/>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-800 leading-tight pb-1">Stepping</span>
              <span className="font-bold text-sm tracking-widest text-slate-400 uppercase mt-1 truncate">Stones</span>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-6'}`}>
        {user.role === 'admin' && (
          <button 
            onClick={() => setView('admin')} 
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-5 py-4'} rounded-2xl font-bold transition-all text-base mb-4 
            ${view === 'admin' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
          >
            <ShieldCheck size={22}/> {!isCollapsed && t('nav_admin')}
          </button>
        )}

        {MODULES.map(item => (
          <button 
            key={item.id} 
            onClick={() => {
              setView(item.id);
              if (setIsMobileOpen) setIsMobileOpen(false);
            }} 
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 px-3 py-3'} rounded-2xl font-bold transition-all text-base 
            ${view === item.id ? 'bg-slate-50 text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-colors shrink-0 shadow-sm ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            {!isCollapsed && <span className="truncate">{t(`nav_${item.id}`)}</span>}
          </button>
        ))}
      </nav>

      <div className={`p-6 border-t border-slate-100 bg-slate-50/50 flex ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <button 
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} 
          className={`flex items-center justify-center gap-2 py-4 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 shadow-sm hover:shadow-md active:scale-95 ${isCollapsed ? 'w-12 h-12 rounded-full p-0' : 'w-full'}`}
          title={lang === 'en' ? '中文' : 'English'}
        >
          <Globe size={20}/> {!isCollapsed && (lang === 'en' ? '中文' : 'English')}
        </button>
      </div>
    </aside>
    </>
  );
};
