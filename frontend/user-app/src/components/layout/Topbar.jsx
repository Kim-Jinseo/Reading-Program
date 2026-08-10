import React, { useState } from 'react';
import { Star, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ProfileModal } from '../common/ProfileModal';

export const Topbar = ({ onMenuClick }) => {
  const { t, grade, setGrade, user, setView } = useAppContext();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="h-20 md:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 z-10 shadow-sm">
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="relative group">
            <button className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-extrabold transition-colors">
              {t(`grade_${grade.replace('-','_')}`)}
            </button>
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
              {['1-2', '3-4', '5-6'].map(g => (
                <button 
                  key={g} 
                  onClick={() => {setGrade(g); setView('dashboard');}} 
                  className={`px-5 py-4 text-left font-bold hover:bg-slate-50 transition-colors ${grade === g ? 'text-amber-500 bg-amber-50/50' : 'text-slate-600'}`}
                >
                  {t(`grade_${g.replace('-','_')}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user.role !== 'admin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-amber-200 shadow-inner">
              <Star className="text-amber-500 fill-amber-500 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-extrabold text-amber-700 text-sm sm:text-lg">{user.stars}</span>
            </div>
          )}
          
          <button 
            onClick={() => setShowProfile(true)} 
            className="flex items-center gap-4 hover:bg-slate-50 p-2 pr-5 rounded-full transition-colors border border-transparent hover:border-slate-200"
          >
            <div className={`w-12 h-12 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-md ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-base font-extrabold text-slate-800 leading-tight">{user.name}</p>
              <p className={`text-xs font-bold uppercase tracking-wider ${user.role==='admin' ? 'text-indigo-500' : 'text-slate-400'}`}>
                {user.isGuest ? t('guest') : user.role === 'admin' ? 'Administrator' : 'Student'}
              </p>
            </div>
          </button>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};
