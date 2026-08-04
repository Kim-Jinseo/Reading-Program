import React, { useState, useMemo, useEffect } from 'react';
import { PenTool, CheckCircle2, ChevronLeft, Sparkles, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getDailyItem } from '../../utils/dailySelection';
import Pagination from '../common/Pagination';
export const WritingModule = () => {
  const { t, curriculumDb, grade, user, saveEssay, handleEarnStars, updateCompletion, markDailyComplete, getDailyStatus } = useAppContext();
  const dailyStatus = getDailyStatus('writing');
  
  const allData = useMemo(() => curriculumDb?.[grade]?.writing || [], [curriculumDb, grade]);
  const activeData = useMemo(() => allData.filter(d => !user.completedWriting?.includes(d.id)), [allData, user.completedWriting]);
  const completedData = useMemo(() => allData.filter(d => user.completedWriting?.includes(d.id)).sort((a,b) => (user.starsTracker?.[a.id] || 0) - (user.starsTracker?.[b.id] || 0)), [allData, user.completedWriting, user.starsTracker]);

  const [prompt, setPrompt] = useState(null);
  const [mode, setMode] = useState('menu');
  const [isDaily, setIsDaily] = useState(false);
  const [menuView, setMenuView] = useState('boxes'); // 'boxes', 'list'
  const [filterResult, setFilterResult] = useState('uncompleted'); // 'uncompleted', 'completed'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const currentList = filterResult === 'uncompleted' ? activeData : completedData;
  const paginatedList = currentList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);

  const [text, setText] = useState('');
  const [status, setStatus] = useState('typing'); 
  const [feedback, setFeedback] = useState(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let interval;
    if (status === 'loading') {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    } else {
      setDots('');
    }
    return () => clearInterval(interval);
  }, [status]);

  // Star animation state for writing feedback (must be above early returns)
  const [revealedStarCount, setRevealedStarCount] = useState(0);
  const [writingPurplePhase, setWritingPurplePhase] = useState(false);

  useEffect(() => {
    if (status === 'feedback' && feedback) {
      setRevealedStarCount(0);
      setWritingPurplePhase(false);
      const displayCount = Math.min(feedback.stars, 3);
      const isMp = feedback.stars >= 4;
      const timers = [];
      for (let i = 1; i <= displayCount; i++) {
        timers.push(setTimeout(() => setRevealedStarCount(i), i * 400));
      }
      if (isMp) {
        timers.push(setTimeout(() => setWritingPurplePhase(true), displayCount * 400 + 600));
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [status, feedback]);

  if (mode === 'menu') {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10">
          <div className="w-24"></div>
          
          {menuView === 'list' && (
            <div className="flex bg-slate-100 rounded-full p-1 shadow-inner">
              <button 
                onClick={() => { setFilterResult('uncompleted'); setPage(1); }} 
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'uncompleted' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Prompts
              </button>
              <button 
                onClick={() => { setFilterResult('completed'); setPage(1); }} 
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Completed
              </button>
            </div>
          )}
          
          <div className="w-24"></div>
        </div>

        {menuView === 'boxes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Daily Writing Card */}
            <div className={`p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center transition-all group h-full ${
              (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-indigo-100/60' 
                : dailyStatus.isComplete 
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-amber-100' 
                  : 'border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 shadow-indigo-100/60 hover:shadow-indigo-200/80 hover:border-indigo-300'
            }`}>
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 ${
                (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? 'bg-indigo-500 text-white shadow-indigo-200' : dailyStatus.isComplete ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200'
              }`}>
                {(dailyStatus.isComplete && dailyStatus.bestStars === 3) ? <CheckCircle2 size={48} /> : <PenTool size={48} />}
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-3">
                {t('daily_writing_goal')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('daily_mission_title')} ✏️</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('daily_mission_desc')}</p>
              <button 
                onClick={() => {
                  const promptItem = getDailyItem(allData, activeData, dailyStatus.itemId);
                  if (promptItem) { setIsDaily(true); setPrompt(promptItem); setMode('write'); setText(user.essays?.[promptItem.id] || ''); setStatus('typing'); setFeedback(null); }
                }}  
                disabled={dailyStatus.isComplete && dailyStatus.bestStars === 3}
                className={`w-full py-4 font-black text-xl rounded-2xl transition-all mt-auto ${
                  (dailyStatus.isComplete && dailyStatus.bestStars === 3)
                    ? 'bg-indigo-500 text-white shadow-none translate-y-1 cursor-not-allowed opacity-90'
                    : dailyStatus.isComplete
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgba(245,158,11,1)] active:translate-y-1 active:shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_6px_0_rgb(79,70,229)] active:shadow-none active:translate-y-1'
                }`}
              >
                {dailyStatus.isComplete ? (dailyStatus.bestStars === 3 ? t('completed_today') : t('btn_keep_practicing')) : t('start_writing_btn')}
              </button>
            </div>

            {/* Keep Practicing Card */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col items-center text-center group hover:border-slate-300 transition-all h-full">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-md shadow-slate-300 transition-transform group-hover:scale-105">
                <Sparkles size={48} />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
                {t('full_curriculum')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('keep_practicing_title')}</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('keep_practicing_desc')}</p>
              <button 
                onClick={() => setMenuView('list')} 
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(15,23,42)] active:shadow-none active:translate-y-1 transition-all mt-auto"
              >
                {t('keep_practicing_btn')}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setMenuView('boxes')} className="mb-4 text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2"><ChevronLeft size={16}/> Back to Options</button>
            {currentList.length === 0 ? (
              filterResult === 'uncompleted' ? (
                <div className="text-center p-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[2.5rem] border-2 border-indigo-200 shadow-lg my-6 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-indigo-500 text-white rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-md shadow-indigo-200">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-2">🎉 You have finished all Writing content!</h3>
                  <p className="text-slate-600 font-bold text-lg max-w-md mx-auto mb-6">
                    You have written responses for all prompts in Grade {grade}! Outstanding creativity!
                  </p>
                  <button 
                    onClick={() => { setFilterResult('completed'); setPage(1); }}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Review Completed Writing
                  </button>
                </div>
              ) : (
                <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-slate-400 font-bold mb-10">
                  No completed writing yet!
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedList.map((promptItem) => {
              const isCompleted = filterResult === 'completed';
              const starsEarned = user.starsTracker?.[promptItem.id] || 0;
              
              const getCardStyle = (stars) => {
                if (!isCompleted) return {
                  bg: 'bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 hover:from-indigo-50/50 hover:to-purple-50/50',
                  border: 'border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/60',
                  text: 'text-slate-800 font-extrabold',
                  icon: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
                  starFill: 'hidden'
                };
                if (stars >= 4) return {
                  bg: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
                  border: 'border-2 border-purple-300 shadow-purple-100 hover:border-purple-500 hover:shadow-purple-200',
                  text: 'text-purple-900 font-black',
                  icon: 'text-purple-500',
                  starFill: 'text-purple-500 fill-purple-500'
                };
                if (stars === 3) return {
                  bg: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
                  border: 'border-2 border-amber-300 shadow-amber-100 hover:border-amber-400 hover:shadow-amber-200',
                  text: 'text-amber-900 font-extrabold',
                  icon: 'text-amber-500',
                  starFill: 'text-amber-400 fill-amber-400'
                };
                return {
                  bg: 'bg-white',
                  border: 'border-2 border-slate-200 hover:border-slate-300',
                  text: 'text-slate-700 font-bold',
                  icon: 'text-slate-400',
                  starFill: 'text-slate-300 fill-slate-300'
                };
              };

              const style = getCardStyle(starsEarned);
              const displayStars = isCompleted ? Math.min(starsEarned, 3) : 0;

              return (
                <div 
                  key={promptItem.id}
                  onClick={() => { setIsDaily(false); setPrompt(promptItem); setMode('write'); setText(user.essays?.[promptItem.id] || ''); setStatus('typing'); setFeedback(null); }}
                  className={`p-6 rounded-3xl transition-all cursor-pointer flex flex-col justify-between group h-full ${style.bg} ${style.border}`}
                >
                  <div>
                    <h3 className={`text-lg line-clamp-3 mb-2 leading-snug ${style.text}`}>{promptItem.en}</h3>
                    <p className="text-xs text-slate-500 font-bold line-clamp-2">{promptItem.zh}</p>
                  </div>
                  
                  {isCompleted ? (
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                      {displayStars > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({length: displayStars}).map((_, i) => (
                            <Star key={i} size={14} className={style.starFill} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end items-center mt-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${style.icon}`}>
                        <PenTool size={18} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    );
  }

  const fallbackGrading = () => {
    const textTrimmed = text.trim();
    const words = textTrimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let baseStars = wordCount >= 10 ? 4 : wordCount >= 5 ? 3 : wordCount >= 2 ? 2 : 1;

    // Detect grammar & formatting errors
    let grammarErrors = 0;
    let grammarNotes = [];

    // 1. Capitalization check
    const sentences = textTrimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
    let uncap = 0;
    sentences.forEach(s => {
      if (s.length > 0 && s[0] !== s[0].toUpperCase() && /[a-z]/.test(s[0])) uncap++;
    });
    if (uncap > 0) { grammarErrors += uncap; grammarNotes.push("Start sentences with capital letters."); }

    // 2. Lowercase 'i' check
    const lowI = (textTrimmed.match(/\bi\b/g) || []).length;
    if (lowI > 0) { grammarErrors += lowI; grammarNotes.push("Capitalize the word 'I'."); }

    // 3. Ending punctuation check
    if (!/[.!?]$/.test(textTrimmed)) { grammarErrors += 1; grammarNotes.push("End your sentence with punctuation (.)."); }

    // Grammar deductions
    let finalStars = baseStars;
    if (grammarErrors >= 3) finalStars = Math.max(1, finalStars - 2);
    else if (grammarErrors >= 1) finalStars = Math.max(1, finalStars - 1);

    const grammarMsg = grammarNotes.length > 0
      ? `Grammar Tip: ${grammarNotes.join(' ')}`
      : "Great job writing with correct grammar, capitalization, and punctuation!";

    const earnedStars = finalStars >= 4 ? 5 : finalStars;
    handleEarnStars(earnedStars, 'writing', prompt.id);
    saveEssay(prompt.id, text);
    updateCompletion('completedWriting', prompt.id);
    if (isDaily) markDailyComplete('writing', earnedStars, prompt.id);
    setFeedback({
      stars: finalStars,
      grammar: grammarMsg,
      content: "Nice effort answering the writing prompt!",
      general: "Wonderful effort! Keep practicing your writing skills everyday!"
    });
    setStatus('feedback');
  };

  const handleSubmit = async () => {
    setStatus('loading');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch('/api/writing/grade', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: prompt.en, studentAnswer: text, grade })
      });
      const data = await response.json();
      
      if (data.success) {
        const earnedStars = data.stars >= 4 ? 5 : data.stars;
        handleEarnStars(earnedStars, 'writing', prompt.id);
        saveEssay(prompt.id, text);
        updateCompletion('completedWriting', prompt.id);
        if (isDaily) markDailyComplete('writing', earnedStars, prompt.id);
        setFeedback({ 
          stars: data.stars, 
          grammar: data.grammar,
          content: data.content,
          general: data.general
        });
        setStatus('feedback');
      } else {
        fallbackGrading();
      }
    } catch (error) {
      console.error(error);
      fallbackGrading();
    }
  };

  if (status === 'feedback' && feedback) {
    const getStarStyle = (starNum) => {
      const isRevealed = starNum <= revealedStarCount;
      if (!isRevealed) return { className: 'text-slate-200 fill-slate-100 transition-all duration-500', size: 64 };
      if (writingPurplePhase) return { className: 'text-purple-500 fill-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all duration-700 scale-110', size: 72 };
      return { className: 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] transition-all duration-500 scale-105', size: 64 };
    };

    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center animate-in zoom-in-95 mt-6">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Evaluation Complete</h2>
          <div className="flex justify-center gap-5 mb-4 items-center" style={{ minHeight: '80px' }}>
            {[1, 2, 3].map((starNum) => {
              const { className, size } = getStarStyle(starNum);
              const isRevealed = starNum <= revealedStarCount;
              return (
                <div 
                  key={starNum}
                  className={`transition-all duration-500 ease-out ${isRevealed ? 'opacity-100' : 'opacity-60'}`}
                  style={{ animation: isRevealed && starNum === revealedStarCount ? 'starBounce 0.5s ease-out' : 'none' }}
                >
                  <Star size={size} className={className} />
                </div>
              );
            })}
          </div>

          {/* Prominent Star Earnings Badge */}
          {(() => {
            const actualStars = feedback.stars >= 4 ? 5 : (feedback.stars || 0);
            return (
              <div className={`inline-flex items-center gap-2 border-2 px-6 py-2 rounded-full font-black text-lg shadow-md mb-4 transition-all duration-500 ${
                writingPurplePhase 
                  ? 'bg-gradient-to-r from-purple-100 via-fuchsia-100 to-indigo-100 border-purple-300 text-purple-900 shadow-purple-200/50' 
                  : 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-amber-300 text-amber-900 shadow-amber-200/50'
              }`}>
                <span>⭐ You earned {actualStars} Star{actualStars === 1 ? '' : 's'}! ⭐</span>
              </div>
            );
          })()}

          <p className={`font-bold mb-6 text-base transition-all duration-500 ${writingPurplePhase ? 'text-purple-600' : 'text-slate-500'}`}>
            {writingPurplePhase 
              ? "⭐ ABSOLUTE MASTERPIECE! ⭐" 
              : feedback.stars >= 3 
                ? "Great job on completing your writing task!" 
                : feedback.stars >= 2 
                  ? "Good effort! Check grammar feedback below." 
                  : feedback.stars === 1 
                    ? "Noticeable grammar errors. Let's fix them!" 
                    : "We need more effort! Let's try again."}
          </p>

          <div className="flex flex-col gap-3">
            <button onClick={() => setStatus('improving')} className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-[0_4px_0_rgb(79,70,229)] active:shadow-none active:translate-y-1 transition-all">
              Improve based on feedback
            </button>
            <div className="flex gap-3">
              <button onClick={() => {setStatus('typing'); setText('');}} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm">
                Start Again
              </button>
              <button onClick={() => setMode('menu')} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm">
                Leave
              </button>
            </div>
          </div>
          <style>{`
            @keyframes starBounce {
              0% { transform: translateY(-30px) scale(0.3); opacity: 0; }
              50% { transform: translateY(4px) scale(1.15); opacity: 1; }
              70% { transform: translateY(-3px) scale(0.95); }
              100% { transform: translateY(0) scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto pt-4 flex flex-col h-[85vh] transition-all duration-500 ${status === 'improving' ? 'max-w-6xl' : 'max-w-3xl'}`}>
      <div className="flex justify-between items-center mb-4 shrink-0">
        <button onClick={() => {
           if (status === 'improving') setStatus('feedback');
           else setMode('menu');
        }} className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm transition-all">
          <ChevronLeft size={20}/> Back
        </button>
        
        <span className="px-4 py-1.5 rounded-full font-extrabold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm flex items-center gap-1.5">
          <PenTool size={14} className="text-indigo-600" /> Writing Practice • Grade {grade}
        </span>
      </div>
      
      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Synchronized Indigo-Purple Prompt Card */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 border-2 border-indigo-200/80 p-6 sm:p-8 rounded-[2.5rem] mb-6 shadow-sm shrink-0 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                Writing Prompt
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-snug">{prompt.en}</h2>
            <p className="text-indigo-800/80 font-bold text-base sm:text-lg">{prompt.zh}</p>
          </div>

          {/* Synchronized Indigo-Purple Writing Pad */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 border-2 border-indigo-200/80 p-6 sm:p-8 rounded-[2.5rem] shadow-sm transition-all mb-4 relative">
            <textarea 
              value={text} 
              onChange={e => {
                if (e.target.value.length <= 1000) {
                  setText(e.target.value);
                }
              }} 
              placeholder="Write your story here... Take your time and express your thoughts clearly! ✏️"
              disabled={status === 'loading'}
              maxLength={1000}
              className="flex-1 w-full bg-transparent text-slate-800 text-xl leading-[2.2rem] resize-none focus:outline-none placeholder:text-slate-400 placeholder:text-lg font-sans"
            />
            
            {/* Matching Helper Bar */}
            <div className="flex justify-between items-center pt-4 border-t border-indigo-100/80 mt-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold">
                {text.trim().split(/\s+/).filter(Boolean).length === 0 ? (
                  <span className="text-slate-400">🌱 Ready to start writing</span>
                ) : text.trim().split(/\s+/).filter(Boolean).length < 10 ? (
                  <span className="text-indigo-800 bg-indigo-100/70 border border-indigo-200/60 px-3 py-1 rounded-full">✍️ {text.trim().split(/\s+/).filter(Boolean).length} words • Keep going!</span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100/70 border border-emerald-200/60 px-3 py-1 rounded-full">🌟 {text.trim().split(/\s+/).filter(Boolean).length} words • Great job!</span>
                )}
              </div>
              
              <div className="text-xs font-bold text-slate-400">
                {text.length} / 1000 chars
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={text.trim().length === 0 || status === 'loading'}
            className={`py-4 text-white font-black text-xl rounded-2xl transition-all shrink-0 ${text.trim().length === 0 || status === 'loading' ? 'bg-indigo-200 text-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_6px_0_rgb(79,70,229)] active:shadow-none active:translate-y-1'}`}
          >
            {status === 'loading' ? (t('loading').replace(/\.+$/, '') + dots) : 'Submit Writing 🚀'}
          </button>
        </div>

        {status === 'improving' && feedback && (feedback.grammar || feedback.general) && (
          <div className="w-1/3 bg-white border-2 border-indigo-200 rounded-[2.5rem] p-8 flex flex-col overflow-y-auto shadow-lg animate-in slide-in-from-right-8">
             <h3 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-2"><Sparkles className="text-indigo-500"/> AI Teacher Feedback</h3>
             
             {feedback.grammar !== undefined && (
               <div className="mb-6">
                 <h4 className="font-extrabold uppercase text-xs tracking-widest mb-2 text-indigo-600 flex items-center gap-1.5">
                   ✨ Grammar Feedback
                 </h4>
                 <p className="text-slate-700 font-medium leading-relaxed bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100">{feedback.grammar}</p>
               </div>
             )}
             
             {feedback.content !== undefined && (
               <div className="mb-6">
                 <h4 className="font-extrabold uppercase text-xs tracking-widest mb-2 text-emerald-600 flex items-center gap-1.5">
                   📝 Content Feedback
                 </h4>
                 <p className="text-slate-700 font-medium leading-relaxed bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100">{feedback.content}</p>
               </div>
             )}

             {feedback.general !== undefined && (
               <div className="mb-6">
                 <h4 className="font-extrabold uppercase text-xs tracking-widest mb-2 text-amber-600 flex items-center gap-1.5">
                   🌟 Teacher Encouragement
                 </h4>
                 <p className="text-slate-700 font-medium leading-relaxed bg-amber-50/70 p-5 rounded-2xl border border-amber-100">{feedback.general}</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
