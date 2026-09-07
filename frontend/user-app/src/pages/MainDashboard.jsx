import React from 'react';
import { ChevronRight, Trophy, ShoppingBag, ClipboardCheck, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PracticeCards } from '../components/practice/PracticeCards';

export const MainDashboard = () => {
  const { t, setView, grade, lang } = useAppContext();
  const quickLinks = [
    { id: 'leaderboard', Icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-300' },
    { id: 'shop', Icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-100', border: 'hover:border-pink-300' },
    { id: 'test', Icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'hover:border-emerald-300' },
  ];

  return <div className="max-w-6xl mx-auto pt-2 md:pt-3">
    <h1 className="mb-7 sm:mb-9 flex flex-wrap items-center gap-3 text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
      {t('nav_dashboard')} <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm font-medium tracking-normal text-slate-500">{t(`grade_${grade.replace('-', '_')}`)}</span>
    </h1>
    <section aria-labelledby="home-main-title">
      <h2 id="home-main-title" className="mb-4 text-sm font-semibold text-slate-500">{t('home_main_title')}</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <button type="button" onClick={() => setView('classes')} aria-label={t('nav_classes')} className="home-class-feature flex min-w-0 flex-col items-start rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 sm:p-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <span className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 border border-indigo-100"><Users size={25} aria-hidden="true" /></span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{t('nav_classes')}</span>
          <span className="mt-3 mb-7 max-w-sm text-sm sm:text-base leading-relaxed text-slate-600">{t('home_classes_desc')}</span>
          <span className="mt-auto inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">{lang === 'zh' ? '进入班级' : 'Open classes'}<ChevronRight size={18} aria-hidden="true" /></span>
        </button>
        <div className="grid grid-cols-1 gap-3">
        {quickLinks.map(({ id, Icon, color, bg, border }) => <button key={id} type="button" onClick={() => setView(id)}
          className={`flex items-center gap-4 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-colors ${border} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}><Icon size={21} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block text-base font-semibold text-slate-800 break-words">{t(`nav_${id}`)}</span>
          <span className="mt-1 block text-sm leading-relaxed text-slate-500">{t(`home_${id}_desc`)}</span></span>
          <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
        </button>)}
        </div>
      </div>
    </section>

    <section aria-labelledby="home-practice-title" className="mt-10 sm:mt-12">
      <h2 id="home-practice-title" className="text-xl font-semibold tracking-tight text-slate-800">{t('nav_practice')}</h2>
      <p className="mt-2 mb-5 text-sm sm:text-base text-slate-500 leading-relaxed">{t('practice_intro')}</p>
      <PracticeCards />
    </section>
  </div>;
};
