import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const PracticeSubjectLayout = ({ children }) => {
  const { t, setView } = useAppContext();
  return <>
    <div className="max-w-5xl mx-auto mb-4">
      <button type="button" onClick={() => setView('practice')}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm sm:text-base font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <ArrowLeft size={18} className="shrink-0" aria-hidden="true" />{t('practice_back')}
      </button>
    </div>
    {children}
  </>;
};
