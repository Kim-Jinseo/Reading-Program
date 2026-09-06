import React, { useState, useEffect } from 'react';
import { Trophy, ChevronLeft, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const LeaderboardView = () => {
  const { t, user, setView, fetchRealLeaderboard, getLeaderboard } = useAppContext();
  const [boardData, setBoardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchRealLeaderboard().then(realUsers => {
      if (!isMounted) return;
      let baseList = getLeaderboard();
      
      if (realUsers && realUsers.length > 0) {
        const mappedReal = realUsers.map(u => {
          const isCurrent = Boolean(u.isCurrentUser || (user && (u.id === user._id || u.name === user.username)));
          return {
            ...u,
            isCurrentUser: isCurrent,
            trophies: isCurrent && user ? (user.trophies !== undefined ? user.trophies : (user.stars || 0)) : u.trophies
          };
        });
        
        // Merge real users with mock filler so the list is rich and competitive
        const combined = [...mappedReal];
        baseList.forEach(mock => {
          if (!combined.some(c => c.name.toLowerCase() === mock.name.toLowerCase())) {
            combined.push(mock);
          }
        });
        
        if (user && !user.isGuest && user.role !== 'admin' && !combined.some(m => m.isCurrentUser)) {
          combined.push({
            id: user._id || 'current_user',
            name: user.username || user.name || 'Student',
            trophies: user.trophies !== undefined ? user.trophies : (user.stars || 0),
            grade: user.grade || '3-4',
            isCurrentUser: true
          });
        }
        combined.sort((a, b) => b.trophies - a.trophies);
        setBoardData(combined);
      } else {
        setBoardData(getLeaderboard());
      }
      setIsLoading(false);
    });
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const currentUserRankIndex = boardData.findIndex(s => s.isCurrentUser);
  const userRankNumber = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;
  const currentUserObj = currentUserRankIndex !== -1 ? boardData[currentUserRankIndex] : null;
  
  // Show Top 20 on main board
  const top20Board = boardData.slice(0, 20);
  const isUserOutsideTop20 = currentUserRankIndex >= 20;

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
            <ChevronLeft size={24}/>
          </button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{t('nav_leaderboard')}</h2>
        </div>
        <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-200 font-bold text-sm flex items-center gap-2 shadow-sm">
          <Sparkles size={16} /> Global Top 20
        </div>
      </div>
      
      {/* User Personal Rank Banner */}
      {user && !user.isGuest && userRankNumber && (
        <div className={`mb-8 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 ${
          userRankNumber <= 3 
            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 shadow-amber-200' 
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-indigo-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left w-full sm:w-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Trophy size={30} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">Your Personal Rank</span>
                <span className="text-[10px] sm:text-xs font-bold text-white/80 min-w-0 [overflow-wrap:anywhere]">• {user.username || user.name || 'Student'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {userRankNumber <= 3 ? '🎉 Podium Ranking!' : `Rank #${userRankNumber} Global`}
              </h3>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center justify-center sm:justify-end gap-3 text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
            <div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Total Trophies</div>
              <div className="text-2xl font-black flex items-center justify-center sm:justify-end gap-2">
                {currentUserObj?.trophies || user.stars || 0} 🏆
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <Loader2 size={40} className="text-amber-500 animate-spin mb-4" />
          <p className="font-bold text-slate-500">Loading live server rankings...</p>
        </div>
      ) : boardData.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
          <p className="font-bold text-slate-400">No players registered on the leaderboard yet!</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
            <span>Rank & Student</span>
            <span>Trophies</span>
          </div>

          {/* Top 20 Ranks */}
          {top20Board.map((student, index) => (
            <div key={student.id || index} className={`flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-slate-50 last:border-0 transition-colors ${student.isCurrentUser ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}>
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-white shadow-sm ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-lg flex flex-wrap items-center gap-2 ${student.isCurrentUser ? 'text-indigo-900 font-extrabold' : 'text-slate-800'}`}>
                    <span className="min-w-0 [overflow-wrap:anywhere]">{student.name}</span>
                    {student.isCurrentUser && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <UserCheck size={12} /> You
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`font-extrabold text-xl ${student.isCurrentUser ? 'text-indigo-700' : 'text-amber-500'}`}>{student.trophies}</span>
                <Trophy size={22} className={student.isCurrentUser ? 'text-indigo-500' : 'text-amber-400'} />
              </div>
            </div>
          ))}

          {/* Sticky Rank Row if User is Outside Top 20 */}
          {isUserOutsideTop20 && currentUserObj && (
            <div className="bg-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between gap-3 shadow-lg border-t-2 border-indigo-400 animate-in fade-in">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-white shadow-sm">
                  #{userRankNumber}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-lg flex flex-wrap items-center gap-2 text-white">
                    <span className="min-w-0 [overflow-wrap:anywhere]">{currentUserObj.name}</span>
                    <span className="text-xs bg-white text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
                      You
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-extrabold text-xl text-yellow-300">{currentUserObj.trophies}</span>
                <Trophy size={22} className="text-yellow-300" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
