import React from 'react';
import { ChevronRight, Trophy, ShoppingBag, ClipboardCheck, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PracticeCards } from '../components/practice/PracticeCards';

export const MainDashboard = () => {
  const { t, setView, grade } = useAppContext();
  const quickLinks = [
    { id: 'classes', Icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'hover:border-indigo-300' },
    { id: 'leaderboard', Icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-300' },
    { id: 'shop', Icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-100', border: 'hover:border-pink-300' },
    { id: 'test', Icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'hover:border-emerald-300' },
  ];

  return <div className="max-w-7xl mx-auto pt-2 md:pt-6">
    <h1 className="mb-6 sm:mb-8 text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
      {t('nav_dashboard')} • {t(`grade_${grade.replace('-', '_')}`)}
    </h1>
    <section aria-labelledby="home-main-title">
      <h2 id="home-main-title" className="mb-4 text-lg font-bold text-slate-600">{t('home_main_title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {quickLinks.map(({ id, Icon, color, bg, border }) => <button key={id} type="button" onClick={() => setView(id)}
          className={`flex flex-col items-start min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-left shadow-sm transition-colors ${border} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>
          <span className="flex w-full items-center justify-between gap-3">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}><Icon size={25} aria-hidden="true" /></span>
            <ChevronRight size={18} aria-hidden="true" className="text-slate-400" />
          </span>
          <span className="mt-4 block text-xl font-extrabold text-slate-800 break-words">{t(`nav_${id}`)}</span>
          <span className="mt-2 block text-sm leading-relaxed text-slate-500">{t(`home_${id}_desc`)}</span>
        </button>)}
      </div>
    </section>

    <section aria-labelledby="home-practice-title" className="mt-8 sm:mt-10 border-t border-slate-200 pt-6 sm:pt-8">
      <h2 id="home-practice-title" className="text-xl sm:text-2xl font-extrabold text-slate-800">{t('nav_practice')}</h2>
      <p className="mt-2 mb-5 text-sm sm:text-base text-slate-500 leading-relaxed">{t('practice_intro')}</p>
      <PracticeCards />
    </section>
  </div>;
};
