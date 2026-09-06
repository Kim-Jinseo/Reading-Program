import React, { useId } from 'react';
import { Book, Edit3, BookOpen, PenTool, Mic, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const PRACTICE_SUBJECTS = [
  { id: 'vocab', Icon: Book, iconStyle: 'bg-sky-100 text-sky-600', border: 'hover:border-sky-300' },
  { id: 'grammar', Icon: Edit3, iconStyle: 'bg-indigo-100 text-indigo-600', border: 'hover:border-indigo-300' },
  { id: 'reading', Icon: BookOpen, iconStyle: 'bg-teal-100 text-teal-600', border: 'hover:border-teal-300' },
  { id: 'writing', Icon: PenTool, iconStyle: 'bg-purple-100 text-purple-600', border: 'hover:border-purple-300' },
  { id: 'speaking', Icon: Mic, iconStyle: 'bg-rose-100 text-rose-600', border: 'hover:border-rose-300' },
];
export const isPracticeSubject = view => PRACTICE_SUBJECTS.some(subject => subject.id === view);

export const PracticeCards = () => {
  const { t, setView, getDailyStatus } = useAppContext();
  const idPrefix = useId();
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
    {PRACTICE_SUBJECTS.map(({ id, Icon, iconStyle, border }) => {
      const done = getDailyStatus(id).isComplete;
      return <button key={id} type="button" aria-label={t(`nav_${id}`)} onClick={() => setView(id)}
        aria-describedby={`${idPrefix}-${id}-description${done ? ` ${idPrefix}-${id}-done` : ''}`}
        className={`flex flex-col items-start min-w-0 rounded-2xl border p-5 text-left shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${done ? 'border-emerald-200 bg-emerald-50/50' : `border-slate-200 bg-white ${border}`}`}>
        <span className="flex w-full items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}><Icon size={22} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1 text-lg font-extrabold text-slate-800 break-words">{t(`nav_${id}`)}</span>
          <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
        </span>
        <span id={`${idPrefix}-${id}-description`} className="mt-3 block text-sm leading-relaxed text-slate-500">{t(`module_${id}_desc`)}</span>
        {done && <span id={`${idPrefix}-${id}-done`} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 size={14} aria-hidden="true" />{t('practice_daily_done')}</span>}
      </button>;
    })}
  </div>;
};
