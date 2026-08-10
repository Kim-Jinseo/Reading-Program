import React, { useState } from 'react';
import { X, Star, BarChart2, Key, ShieldCheck, LogOut, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ProfileModal = ({ onClose }) => {
  const { user, setUser, setView, t, getLeaderboard } = useAppContext();
  const [secretCode, setSecretCode] = useState('');

  const handleUnlockAdmin = () => {
    if (secretCode === 'teacher2026') {
      const teacherItems = ['relic_hourglass', 'court_gavel', 'shield_bronze', 'shield_silver', 'shield_gold', 'char_knight', 'char_paladin', 'pet_dragon', 'pet_griffin', 'pet_golem'];
      setUser({ 
        ...user, 
        role: 'admin',
        stars: (user.stars || 0) < 999 ? 999 : user.stars,
        inventory: teacherItems,
        unlockedChars: ['char_knight', 'char_paladin', 'char_wizard'],
        unlockedPets: ['pet_dragon', 'pet_griffin', 'pet_golem'],
        clearedVoiceStages: { '1-2': Array.from({length: 20}, (_, i) => i), '3-4': Array.from({length: 20}, (_, i) => i), '5-6': Array.from({length: 20}, (_, i) => i) }
      });
      onClose();
      setView('admin');
    } else {
      alert("Invalid Admin Code");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('savedUserData');
    localStorage.removeItem('voiceBattleClearedByGrade');
    setUser(null); // Setting to null triggers AuthModal to appear
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 relative border border-slate-100 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 sm:top-8 right-4 sm:right-8 text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full"><X size={24}/></button>

        <div className="flex flex-col items-center mb-8 sm:mb-10 mt-2 sm:mt-4">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 text-white rounded-full flex items-center justify-center text-4xl sm:text-5xl font-extrabold shadow-xl mb-4 ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{user.name}</h2>
          
          {!user.isGuest && user.role !== 'admin' && (() => {
            const leaderboard = getLeaderboard();
            const rank = leaderboard.findIndex(u => u.isCurrentUser) + 1;
            const isTop3 = rank > 0 && rank <= 3;
            return (
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2.5 rounded-full font-extrabold text-lg shadow-md border border-orange-300">
                  <Trophy size={22} fill="currentColor" className="text-amber-100"/> {user.trophies !== undefined ? user.trophies : (user.stars || 0)} Trophies
                </div>
                <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-extrabold text-sm border-2 transition-all ${isTop3 ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 border-purple-300 shadow-[0_0_20px_rgba(192,38,211,0.5)] scale-110 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  <Trophy size={16} className={isTop3 ? 'text-fuchsia-500' : 'text-slate-400'}/> Server Rank: #{rank}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Guest users do not see stats */}
        {!user.isGuest && user.role !== 'admin' && (
          <>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart2 size={16}/> Learning Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                <p className="text-sky-500 font-bold text-xs uppercase tracking-wider mb-1">{t('stat_vocab')}</p>
                <p className="text-3xl font-extrabold text-sky-700">{Object.values(user.vocabStats || {}).filter(s => s === 'correct').length}</p>
              </div>
              <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100">
                <p className="text-violet-500 font-bold text-xs uppercase tracking-wider mb-1">{t('stat_grammar')}</p>
                <p className="text-3xl font-extrabold text-violet-700">{Object.values(user.grammarStats || {}).filter(s => s.solved).length}</p>
              </div>
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <p className="text-indigo-500 font-bold text-xs uppercase tracking-wider mb-1">{t('stat_writing')}</p>
                <p className="text-3xl font-extrabold text-indigo-700">{(user.completedWriting || []).length}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-1">{t('stat_reading')}</p>
                <p className="text-3xl font-extrabold text-emerald-700">{(user.completedReading || []).length}</p>
              </div>
            </div>
          </>
        )}

        {/* ADMIN UNLOCK INPUT (Hidden for existing Admins and Guests) */}
        {user.role !== 'admin' && !user.isGuest && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex gap-2 sm:gap-3 items-center mb-6">
            <Key size={20} className="text-slate-400 shrink-0 ml-1 hidden sm:block" />
            <input 
              type="text"
              style={{ WebkitTextSecurity: 'disc' }}
              placeholder="Teacher Code..." 
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <button onClick={handleUnlockAdmin} className="bg-slate-800 text-white font-bold text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-slate-900 transition-colors shrink-0">
              Unlock
            </button>
          </div>
        )}
        
        {/* Admin Confirmation Display */}
        {user.role === 'admin' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center mb-6">
            <ShieldCheck size={40} className="mx-auto text-indigo-500 mb-3" />
            <h3 className="font-bold text-indigo-900 text-lg mb-1">Administrator Privileges Active</h3>
            <p className="text-indigo-700 text-sm mb-4">You have full access to edit curriculum data.</p>
            <button 
              onClick={() => {
                localStorage.removeItem('savedUserData');
                window.location.reload();
              }}
              className="px-5 py-2 bg-white text-indigo-600 font-extrabold text-sm rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
            >
              Exit Teacher Mode
            </button>
          </div>
        )}

        {user.isGuest ? (
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg mt-4">
            <LogOut size={18}/> Sign In / Sign Up
          </button>
        ) : (
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-2xl transition-colors border border-slate-200 hover:border-rose-200 mt-4">
            <LogOut size={18}/> {t('btn_logout')}
          </button>
        )}
      </div>
    </div>
  );
};
