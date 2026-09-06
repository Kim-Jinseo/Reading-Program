import React from 'react';
import { BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PracticeCards } from '../components/practice/PracticeCards';

export const PracticeHub = () => {
  const { t, grade } = useAppContext();
  return <div className="max-w-7xl mx-auto pt-2 md:pt-6">
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><BookOpen size={25} aria-hidden="true" /></span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{t('nav_practice')}</h1>
      </div>
      <p className="mt-4 text-slate-500 leading-relaxed">{t('practice_intro')}</p>
      <p className="mt-3 text-sm font-bold text-slate-600">{t(`grade_${grade.replace('-', '_')}`)}</p>
    </header>
    <PracticeCards />
    <p className="mt-6 text-sm leading-relaxed text-slate-500">{t('practice_class_note')}</p>
  </div>;
};
