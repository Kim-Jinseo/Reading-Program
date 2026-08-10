import React from 'react';
import { Book, Edit3, Mic, BookOpen, ChevronRight, PenTool, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MainDashboard = () => {
  const { t, setView, grade, getDailyStatus } = useAppContext();

  const modules = [
    { 
      id: 'vocab', 
      icon: <Book size={40}/>, 
      color: 'text-sky-500', 
      bg: 'bg-sky-100', 
      border: 'hover:border-sky-400', 
      shadow: 'hover:shadow-sky-100', 
      doneStyle: {
        card: 'border-2 border-sky-300 bg-gradient-to-br from-sky-50/80 via-white to-blue-50/40 shadow-md shadow-sky-100/60',
        icon: 'bg-sky-500 text-white shadow-md shadow-sky-200',
        badge: 'bg-sky-100 text-sky-700 border border-sky-200'
      },
      desc: t('module_vocab_desc') 
    },
    { 
      id: 'grammar', 
      icon: <Edit3 size={40}/>, 
      color: 'text-violet-500', 
      bg: 'bg-violet-100', 
      border: 'hover:border-violet-400', 
      shadow: 'hover:shadow-violet-100', 
      doneStyle: {
        card: 'border-2 border-violet-300 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 shadow-md shadow-violet-100/60',
        icon: 'bg-violet-500 text-white shadow-md shadow-violet-200',
        badge: 'bg-violet-100 text-violet-700 border border-violet-200'
      },
      desc: t('module_grammar_desc') 
    },
    { 
      id: 'reading', 
      icon: <BookOpen size={40}/>, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-100', 
      border: 'hover:border-emerald-400', 
      shadow: 'hover:shadow-emerald-100', 
      doneStyle: {
        card: 'border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 shadow-md shadow-emerald-100/60',
        icon: 'bg-emerald-500 text-white shadow-md shadow-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      },
      desc: t('module_reading_desc') 
    },
    { 
      id: 'writing', 
      icon: <PenTool size={40}/>, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-100', 
      border: 'hover:border-indigo-400', 
      shadow: 'hover:shadow-indigo-100', 
      doneStyle: {
        card: 'border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 shadow-md shadow-indigo-100/60',
        icon: 'bg-indigo-500 text-white shadow-md shadow-indigo-200',
        badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      },
      desc: t('module_writing_desc') 
    },
    { 
      id: 'speaking', 
      icon: <Mic size={40}/>, 
      color: 'text-rose-500', 
      bg: 'bg-rose-100', 
      border: 'hover:border-rose-400', 
      shadow: 'hover:shadow-rose-100', 
      doneStyle: {
        card: 'border-2 border-rose-300 bg-gradient-to-br from-rose-50/80 via-white to-red-50/40 shadow-md shadow-rose-100/60',
        icon: 'bg-rose-500 text-white shadow-md shadow-rose-200',
        badge: 'bg-rose-100 text-rose-700 border border-rose-200'
      },
      desc: t('module_speaking_desc') 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pt-2 md:pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          {t('nav_dashboard')} • {t(`grade_${grade.replace('-','_')}`)}
        </h2>
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {modules.map((mod) => {
          const dailyStatus = getDailyStatus(mod.id);
          const isDone = dailyStatus.isComplete;
          return (
            <div 
              key={mod.id} 
              onClick={() => setView(mod.id)}
              className={`p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] md:min-h-[260px] hover:shadow-xl hover:-translate-y-1.5 ${
                isDone 
                  ? mod.doneStyle.card 
                  : 'bg-white border-2 border-slate-100 ' + mod.border + ' ' + mod.shadow
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 ${
                  isDone ? mod.doneStyle.icon : mod.bg + ' ' + mod.color
                }`}>
                  {mod.icon}
                </div>
                {isDone ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-xs md:text-sm shadow-2xs whitespace-nowrap shrink-0 ${mod.doneStyle.badge}`}>
                    <CheckCircle2 size={16} className="shrink-0" /> Daily Done
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
              <div className="mt-8">
                <h3 className="text-3xl font-extrabold text-slate-800 mb-3">{t(`nav_${mod.id}`)}</h3>
                <p className="text-slate-500 font-medium text-base leading-relaxed">{mod.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
