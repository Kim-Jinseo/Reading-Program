import React from 'react';
import { BookOpen, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ModeSelector = ({ onLearn, onTest, title }) => {
  const { t } = useAppContext();

  return (
    <div className="max-w-2xl mx-auto pt-16">
      <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-10">{title} - {t('choose_mode')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={onLearn} className="bg-white p-10 rounded-[2rem] border-2 border-slate-100 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-100 transition-all text-center group active:scale-95">
          <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{t('menu_learn')}</h3>
          <p className="text-slate-500 font-medium">{t('mode_learn_desc')}</p>
        </button>
        <button onClick={onTest} className="bg-white p-10 rounded-[2rem] border-2 border-slate-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-100 transition-all text-center group active:scale-95">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Activity size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{t('menu_test')}</h3>
          <p className="text-slate-500 font-medium">{t('mode_test_desc')}</p>
        </button>
      </div>
    </div>
  );
};
