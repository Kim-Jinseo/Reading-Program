import React, { useState, useMemo } from 'react';
import { Book, CheckCircle2, ChevronLeft, Volume2, Sparkles, VolumeX, Eye, X, BookOpen, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getDailyItem } from '../../utils/dailySelection';
import { ScoreScreen } from '../common/ScoreScreen';
import Pagination from '../common/Pagination';
import localCurriculum from '../../data/curriculum.json';

export const ReadingModule = () => {
  const { t, curriculumDb, grade, user, handleEarnStars, updateCompletion, markDailyComplete, getDailyStatus } = useAppContext();
  const dailyStatus = getDailyStatus('reading');
  
  const difficultyOrder = useMemo(() => ({ easy: 1, medium: 2, hard: 3, super_hard: 4 }), []);
  const allData = useMemo(() => {
    const rawData = curriculumDb?.[grade]?.reading || localCurriculum?.[grade]?.reading || [];
    return [...rawData].sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0));
  }, [curriculumDb, grade, difficultyOrder]);
  const activeData = useMemo(() => allData.filter(d => !user.completedReading?.includes(d.id)), [allData, user.completedReading]);
  const completedData = useMemo(() => allData.filter(d => user.completedReading?.includes(d.id)).sort((a,b) => (user.starsTracker?.[a.id] || 0) - (user.starsTracker?.[b.id] || 0)), [allData, user.completedReading, user.starsTracker]);

  const [lesson, setLesson] = useState(null);
  const [mode, setMode] = useState('menu'); 
  const [isDaily, setIsDaily] = useState(false);
  const [menuView, setMenuView] = useState('boxes'); // 'boxes', 'list'
  const [filterResult, setFilterResult] = useState('uncompleted'); // 'uncompleted', 'completed'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const currentList = filterResult === 'uncompleted' ? activeData : completedData;
  const paginatedList = currentList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  // Enhanced Reader States
  const [activeStoryTab, setActiveStoryTab] = useState('english'); // 'english', 'side_by_side', 'chinese'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPeekModal, setShowPeekModal] = useState(false);

  // Dynamic random shuffling of choices for current question every time it loads
  const currentOptions = useMemo(() => {
    if (mode !== 'quiz' || !lesson || !lesson.questions || !lesson.questions[idx]) return [];
    const currentQ = lesson.questions[idx];
    const raw = currentQ.options ? [...currentQ.options] : [currentQ.a, currentQ.b, currentQ.a2, currentQ.b2].filter(Boolean);
    
    const arr = [...raw];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [mode, lesson, idx]);

  // Dynamic Theme System based on Story Difficulty
  const getDifficultyTheme = (diff) => {
    if (diff === 'super_hard') {
      return {
        name: 'Very Hard',
        badgeClass: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black border border-purple-300 shadow-md shadow-purple-500/40 animate-pulse',
        badgeText: '⚡ VERY HARD • 6 ⭐',
        cardBg: 'bg-gradient-to-br from-purple-950/20 via-indigo-900/10 to-slate-900/20 hover:from-purple-950/30 backdrop-blur-md',
        cardBorder: 'border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:border-purple-400 scale-[1.02]',
        cardText: 'text-purple-900 group-hover:text-purple-950 font-black',
        iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40',
        readerBg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-slate-100 border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] relative overflow-hidden',
        readerTitle: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-pink-200 font-black drop-shadow-md',
        readerText: 'text-slate-100 font-serif leading-[2.4rem]',
        chineseBg: 'bg-purple-900/40 border border-purple-500/40 text-purple-100',
        quizCard: 'bg-slate-900 border-2 border-purple-500 text-slate-100 shadow-[0_0_30px_rgba(168,85,247,0.4)]',
        btnBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_6px_0_rgb(109,40,217)] active:translate-y-1 active:shadow-none',
        progressBar: 'bg-gradient-to-r from-purple-500 to-pink-500',
        accentGlow: 'bg-purple-500/30 blur-3xl',
      };
    }
    if (diff === 'hard') {
      return {
        name: 'Hard',
        badgeClass: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold border border-rose-300 shadow-md shadow-rose-500/20',
        badgeText: '🔥 HARD • 5 ⭐',
        cardBg: 'bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 hover:bg-rose-50',
        cardBorder: 'border-2 border-rose-400 hover:border-rose-500 shadow-sm hover:shadow-rose-200/60 hover:shadow-md',
        cardText: 'text-slate-800 group-hover:text-rose-950 font-extrabold',
        iconBg: 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200',
        readerBg: 'bg-gradient-to-br from-rose-50/70 via-[#fdfbf7] to-amber-50/40 border-2 border-rose-400 shadow-2xl shadow-rose-900/10 relative overflow-hidden',
        readerTitle: 'text-slate-900 font-black',
        readerText: 'text-slate-800 font-serif leading-[2.3rem]',
        chineseBg: 'bg-rose-50/80 border border-rose-200/60 text-slate-800',
        quizCard: 'bg-white border-2 border-rose-300 shadow-xl',
        btnBg: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_6px_0_rgb(225,29,72)] active:translate-y-1 active:shadow-none',
        progressBar: 'bg-rose-500',
        accentGlow: 'bg-rose-500/20 blur-2xl',
      };
    }
    if (diff === 'medium') {
      return {
        name: 'Medium',
        badgeClass: 'bg-amber-100 text-amber-800 font-bold border border-amber-300',
        badgeText: '⚡ MEDIUM • 4 ⭐',
        cardBg: 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 hover:bg-amber-50/70',
        cardBorder: 'border-2 border-amber-300 hover:border-amber-400 hover:shadow-amber-100',
        cardText: 'text-slate-800 group-hover:text-amber-950 font-extrabold',
        iconBg: 'bg-amber-500 text-white shadow-md shadow-amber-200',
        readerBg: 'bg-[#fdfbf7] border-2 border-amber-300 shadow-xl shadow-amber-900/5 relative overflow-hidden',
        readerTitle: 'text-slate-800 font-black',
        readerText: 'text-slate-700 font-serif leading-[2.3rem]',
        chineseBg: 'bg-amber-50/60 border border-amber-200/50 text-slate-800',
        quizCard: 'bg-white border-2 border-amber-300 shadow-xl',
        btnBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgb(217,119,6)] active:translate-y-1 active:shadow-none',
        progressBar: 'bg-amber-500',
        accentGlow: 'bg-amber-500/20 blur-2xl',
      };
    }
    // Default Easy
    return {
      name: 'Easy',
      badgeClass: 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300',
      badgeText: '🌱 EASY • 3 ⭐',
      cardBg: 'bg-white hover:bg-teal-50/50',
      cardBorder: 'border-2 border-emerald-200 hover:border-teal-400 hover:shadow-teal-100',
      cardText: 'text-slate-800 group-hover:text-teal-950 font-extrabold',
      iconBg: 'bg-teal-500 text-white shadow-md shadow-teal-100',
      readerBg: 'bg-[#fdfbf7] border-2 border-emerald-200 shadow-xl shadow-emerald-900/5 relative overflow-hidden',
      readerTitle: 'text-slate-800 font-black',
      readerText: 'text-slate-700 font-serif leading-[2.3rem]',
      chineseBg: 'bg-emerald-50/60 border border-emerald-200/50 text-slate-800',
      quizCard: 'bg-white border-2 border-emerald-200 shadow-xl',
      btnBg: 'bg-teal-500 hover:bg-teal-600 text-white shadow-[0_6px_0_rgb(20,184,166)] active:translate-y-1 active:shadow-none',
      progressBar: 'bg-teal-500',
      accentGlow: 'bg-teal-500/20 blur-2xl',
    };
  };

  const toggleAudio = (textToRead) => {
    if (isPlayingAudio && window.currentAudioInstance) {
      window.currentAudioInstance.pause();
      window.currentAudioInstance = null;
      setIsPlayingAudio(false);
      return;
    }

    if (!textToRead) return;

    setIsPlayingAudio(true);
    try {
      const text = encodeURIComponent(textToRead);
      const timestamp = Date.now();
      const audioUrl = `/api/audio/tts?text=${text}&t=${timestamp}`;
      
      const audio = new Audio(audioUrl);
      window.currentAudioInstance = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        window.currentAudioInstance = null;
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        window.currentAudioInstance = null;
      };
      
      audio.play();
    } catch (e) {
      console.error("Audio error:", e);
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (window.currentAudioInstance) {
      window.currentAudioInstance.pause();
      window.currentAudioInstance.currentTime = 0;
    }
    setIsPlayingAudio(false);
  };

  if (mode === 'menu') {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <div className="flex justify-center items-center mb-10">
          
          {menuView === 'list' && (
            <div className="flex max-w-full overflow-x-auto hide-scrollbar bg-slate-100 rounded-full p-1 shadow-inner">
              <button 
                onClick={() => { setFilterResult('uncompleted'); setPage(1); }} 
                className={`shrink-0 px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'uncompleted' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Stories
              </button>
              <button 
                onClick={() => { setFilterResult('completed'); setPage(1); }} 
                className={`shrink-0 px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'completed' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Completed
              </button>
            </div>
          )}
          
        </div>

        {menuView === 'boxes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Daily Reading Card */}
            <div className={`p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center transition-all group h-full ${
              (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-emerald-100' 
                : dailyStatus.isComplete 
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-amber-100' 
                  : 'border-teal-100 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 shadow-teal-100/60 hover:shadow-teal-200/80 hover:border-teal-300'
            }`}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 rounded-[2rem] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 ${
                (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? 'bg-emerald-500 text-white shadow-emerald-200' : dailyStatus.isComplete ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-teal-200'
              }`}>
                {(dailyStatus.isComplete && dailyStatus.bestStars === 3) ? <CheckCircle2 size={48} /> : <Book size={48} />}
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-100 text-teal-700 mb-3">
                {t('daily_reading_goal')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('daily_reading_title')}</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('daily_reading_desc')}</p>
              <button 
                onClick={() => {
                  const lessonItem = getDailyItem(allData, activeData, dailyStatus.itemId);
                  if (lessonItem) { setIsDaily(true); setLesson(lessonItem); setMode('read'); setIdx(0); setScore(0); setActiveStoryTab('english'); }
                }} 
                disabled={dailyStatus.isComplete && dailyStatus.bestStars === 3}
                className={`w-full py-4 font-black text-xl rounded-2xl transition-all mt-auto ${
                  (dailyStatus.isComplete && dailyStatus.bestStars === 3)
                    ? 'bg-emerald-500 text-white shadow-none translate-y-1 cursor-not-allowed opacity-90'
                    : dailyStatus.isComplete
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgba(245,158,11,1)] active:translate-y-1 active:shadow-none'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-[0_6px_0_rgb(20,184,166)] active:shadow-none active:translate-y-1'
                }`}
              >
                {dailyStatus.isComplete ? (dailyStatus.bestStars === 3 ? t('completed_today') : t('btn_keep_practicing')) : t('btn_start_launch')}
              </button>
            </div>

            {/* Keep Practicing Card */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col items-center text-center group hover:border-slate-300 transition-all h-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-md shadow-slate-300 transition-transform group-hover:scale-105">
                <Sparkles size={48} />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
                {t('full_curriculum')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('keep_practicing_reading_title')}</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('keep_practicing_reading_desc')}</p>
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
                <div className="text-center p-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-[2.5rem] border-2 border-emerald-200 shadow-lg my-6 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-md shadow-emerald-200">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-2">🎉 You have finished all Reading content!</h3>
                  <p className="text-slate-600 font-bold text-lg max-w-md mx-auto mb-6">
                    You have read every single story for Level {grade === '1-2' ? '1' : grade === '3-4' ? '2' : '3'}! Outstanding achievement!
                  </p>
                  <button 
                    onClick={() => { setFilterResult('completed'); setPage(1); }}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Review Completed Stories
                  </button>
                </div>
              ) : (
                <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-slate-400 font-bold mb-10">
                  No completed reading yet!
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {paginatedList.map((lessonItem) => {
                  const isCompleted = filterResult === 'completed';
                  const starsEarned = user.starsTracker?.[lessonItem.id] || 0;
                  const theme = getDifficultyTheme(lessonItem.difficulty);
                  const maxStarsMap = { easy: 3, medium: 4, hard: 5, super_hard: 6 };
                  const displayStars = isCompleted ? Math.min(starsEarned, maxStarsMap[lessonItem.difficulty] || 3) : 0;

                  return (
                    <div 
                      key={lessonItem.id}
                      onClick={() => { setIsDaily(false); setLesson(lessonItem); setMode('read'); setIdx(0); setScore(0); setActiveStoryTab('english'); }}
                      className={`p-6 rounded-3xl transition-all cursor-pointer flex justify-between items-center group min-h-[120px] ${
                        isCompleted && starsEarned >= 5
                          ? 'bg-gradient-to-br from-purple-50 via-white to-purple-50 border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-[1.02]'
                          : `${theme.cardBg} ${theme.cardBorder}`
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider ${theme.badgeClass}`}>
                            {theme.badgeText}
                          </span>
                          <span className="text-slate-400 font-bold text-xs">{lessonItem.questions?.length || 5} Questions</span>
                        </div>
                        <h3 className={`text-xl line-clamp-2 ${theme.cardText}`}>{lessonItem.title?.en || lessonItem.title}</h3>
                      </div>
                      
                      {isCompleted ? (
                        <div className="flex justify-end items-center shrink-0 ml-4">
                          {displayStars > 0 && (
                            <div className="flex gap-0.5 mr-2">
                              {Array.from({length: displayStars}).map((_, i) => (
                                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end items-center shrink-0 ml-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${theme.iconBg}`}>
                            <Book size={24} />
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

  if (mode === 'read') {
    const theme = getDifficultyTheme(lesson.difficulty);

    return (
      <div className="max-w-4xl mx-auto pt-2 sm:pt-4 pb-8 sm:pb-12 flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-200">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 sm:mb-6">
          <button 
            onClick={() => { stopAudio(); setMode('menu'); }} 
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 shadow-sm transition-all text-xs sm:text-sm self-start sm:self-auto"
          >
            <ChevronLeft size={16}/> <span className="hidden sm:inline">Back to Stories</span><span className="sm:hidden">Back</span>
          </button>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
            {/* Audio Listen Button */}
            <button 
              onClick={() => toggleAudio(lesson.text?.en || lesson.text)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 ${
                isPlayingAudio 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-200' 
                  : theme.btnBg
              }`}
            >
              {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isPlayingAudio ? 'Stop' : 'Listen Story 🔊'}</span>
            </button>

            {/* Language Selector */}
            <div className="flex bg-slate-100/90 p-0.5 sm:p-1 rounded-full border border-slate-200 shadow-inner shrink-0">
              <button 
                onClick={() => setActiveStoryTab('english')} 
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] sm:text-xs transition-all ${
                  activeStoryTab === 'english' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                English
              </button>
              <button 
                onClick={() => setActiveStoryTab('side_by_side')} 
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] sm:text-xs transition-all ${
                  activeStoryTab === 'side_by_side' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Both
              </button>
              <button 
                onClick={() => setActiveStoryTab('chinese')} 
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] sm:text-xs transition-all ${
                  activeStoryTab === 'chinese' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                中文
              </button>
            </div>
          </div>
        </div>

        {/* Story Book Layout with Clean High-Legibility Styling */}
        <div className={`p-5 sm:p-12 rounded-3xl sm:rounded-[3rem] mb-6 sm:mb-8 ${theme.readerBg}`}>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <span className={`px-3.5 py-1 rounded-full text-xs uppercase tracking-wider ${theme.badgeClass}`}>
              {theme.badgeText}
            </span>
            <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
              📖 {lesson.questions?.length || 5} Questions
            </span>
          </div>

          <h2 className={`text-2xl sm:text-4xl mb-6 sm:mb-8 leading-tight tracking-tight relative z-10 ${theme.readerTitle}`}>
            {lesson.title?.en || lesson.title}
          </h2>

          {(activeStoryTab === 'english' || activeStoryTab === 'side_by_side') && (
            <div className={`text-lg sm:text-2xl mb-6 sm:mb-8 space-y-4 tracking-wide relative z-10 ${theme.readerText}`}>
              {(lesson.text?.en || lesson.text).split('\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          )}

          {activeStoryTab === 'side_by_side' && lesson.text?.zh && (
            <hr className="border-slate-500/20 my-6 sm:my-8 relative z-10" />
          )}

          {(activeStoryTab === 'chinese' || activeStoryTab === 'side_by_side') && lesson.text?.zh && (
            <div className={`p-4 sm:p-6 rounded-2xl relative z-10 ${theme.chineseBg}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Chinese Translation / 中文翻译</h4>
              <h3 className="text-lg sm:text-xl font-bold mb-3">{lesson.title?.zh}</h3>
              <p className="text-base sm:text-lg leading-relaxed font-sans opacity-90">{lesson.text.zh}</p>
            </div>
          )}
        </div>

        {/* Start Quiz Action */}
        <button 
          onClick={() => { stopAudio(); setMode('quiz'); }} 
          className={`w-full py-3.5 sm:py-5 px-4 font-black text-lg sm:text-2xl rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg active:scale-95 ${theme.btnBg}`}
        >
          <span>Start Quiz & Test Comprehension</span>
          <BookOpen size={22} className="shrink-0" />
        </button>
      </div>
    );
  }

  if (mode === 'quiz') {
    const q = lesson.questions[idx];
    const theme = getDifficultyTheme(lesson.difficulty);

    const handleAnswer = (ans) => {
      const correctAnswerText = q.options ? q.options[q.correct] : q.a;
      const isCorrect = ans === correctAnswerText;
      if (isCorrect) setScore(s => s + 1);
      if (idx < lesson.questions.length - 1) {
        setIdx(i => i + 1);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        const earnedStars = finalScore; // 1 star per correct question

        handleEarnStars(earnedStars, 'reading', lesson.id);
        updateCompletion('completedReading', lesson.id);
        if (isDaily) markDailyComplete('reading', earnedStars, lesson.id);
        setMode('done');
      }
    };

    return (
      <div className="max-w-2xl mx-auto pt-8 pb-12 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <span className={`text-xs uppercase tracking-wider px-3.5 py-1 rounded-full ${theme.badgeClass}`}>
            Question {idx + 1} of {lesson.questions.length}
          </span>

          <button 
            onClick={() => setShowPeekModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm rounded-full border border-amber-200 transition-all shadow-sm"
          >
            <Eye size={18} /> Peek Story 📖
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-10 border border-slate-200">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${theme.progressBar}`}
            style={{ width: `${((idx + 1) / lesson.questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className={`p-8 sm:p-10 rounded-[2.5rem] mb-8 text-center ${theme.quizCard}`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-relaxed">{q.q}</h2>
        </div>

        {/* Choice Buttons - Shuffled dynamically */}
        <div className="grid grid-cols-1 gap-4">
          {currentOptions.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            return (
              <button 
                key={opt} 
                onClick={() => handleAnswer(opt)} 
                className="answer-choice answer-choice--purple group p-5 sm:p-6 bg-white border-2 border-slate-100 rounded-2xl text-xl font-bold text-slate-800 transition-all active:scale-95 shadow-sm flex items-center gap-4 text-left"
              >
                <span className="answer-choice__badge w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0 transition-colors">
                  {letter}.
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Peek Story Modal */}
        {showPeekModal && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
            onClick={() => setShowPeekModal(false)}
          >
            <div 
              className="bg-[#fdfbf7] border-2 border-amber-200 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[calc(100dvh-2rem)] overflow-y-auto relative animate-in zoom-in-95 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPeekModal(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200 shadow-sm"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Book className="text-teal-600" size={24} />
                <h3 className="text-xl font-extrabold text-slate-800">Story Reference</h3>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-4">{lesson.title?.en || lesson.title}</h2>
              <div className="text-lg text-slate-700 leading-relaxed font-serif space-y-4">
                {(lesson.text?.en || lesson.text).split('\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'done') {
    let earnedStars = score; // 1 star per correct answer
    return <ScoreScreen stars={earnedStars} onRetry={() => {setMode('read'); setIdx(0); setScore(0);}} onContinue={() => setMode('menu')} />;
  }
};

