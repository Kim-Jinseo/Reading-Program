import React, { useState, useMemo } from 'react';
import { BookOpen, Activity, CheckCircle2, List, X, RotateCcw, Layers, Sparkles, Volume2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getTodayString, getDailyIndexForDate } from '../../utils/dailySelection';
import { ScoreScreen } from '../common/ScoreScreen';
import Pagination from '../common/Pagination';

export const VocabModule = () => {
  const { t, curriculumDb, grade, user, handleEarnStars, calculateStars, updateVocabStat, markDailyComplete, getDailyStatus } = useAppContext();
  
  const allData = useMemo(() => curriculumDb?.[grade]?.vocab || [], [curriculumDb, grade]);
  
  // States for Tabs
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' or 'list'
  const dailyStatus = getDailyStatus('vocab');

  const audioCache = useMemo(() => new Map(), []);

  const playWordAudio = (wordText, e) => {
    if (e) e.stopPropagation();
    if (!wordText) return;
    
    try {
      const cleanWord = wordText.trim();
      let audio = audioCache.get(cleanWord);
      
      if (!audio) {
        const text = encodeURIComponent(cleanWord);
        const token = localStorage.getItem('token') || '';
        const timestamp = Date.now();
        const audioUrl = `/api/audio/tts?text=${text}&token=${token}&t=${timestamp}`;
        audio = new Audio(audioUrl);
        audioCache.set(cleanWord, audio);
      } else {
        audio.currentTime = 0;
      }
      
      audio.play().catch(err => {
        console.error('Deepgram TTS audio play error:', err);
      });
    } catch (err) {
      console.error('Deepgram TTS audio error:', err);
    }
  };
  
  // Learn Modes
  const [mode, setMode] = useState('menu'); // 'menu', 'flash_learn', 'flash_quiz', 'flash_done', 'matching', 'matching_done'
  
  // Quiz/Learn States
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState({});
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState([]);
  const [learningQueue, setLearningQueue] = useState([]);
  const [wrongQueue, setWrongQueue] = useState([]); // for flashcard retries

  // Matching States
  const [matchingData, setMatchingData] = useState({ left: [], right: [] });
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [mistakeIds, setMistakeIds] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  
  // List States
  const [filter, setFilter] = useState('all'); // 'all', 'mastered', 'unmastered'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Derive vocab status
  const getVocabStatus = (id) => {
    return user.vocabStats?.[id] || 'unexplored';
  };

  const getFilteredData = () => {
    if (filter === 'mastered') return allData.filter(w => getVocabStatus(w.id) === 'correct');
    if (filter === 'unmastered') return allData.filter(w => getVocabStatus(w.id) !== 'correct');
    return allData;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleFlip = (id) => {
    setIsFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build Quiz Data based on words
  const buildQuiz = (words) => {
    return words.map(currentWord => {
      const askForDef = Math.random() > 0.5;
      const prompt = askForDef ? currentWord.word : currentWord.def;
      const answer = askForDef ? currentWord.def : currentWord.word;
      
      const options = [answer];
      const pool = allData.filter(w => w.id !== currentWord.id);
      const shuffledPool = pool.sort(() => Math.random() - 0.5);
      
      for (let w of shuffledPool) {
        if (options.length < 3) options.push(askForDef ? w.def : w.word);
      }
      return { ...currentWord, prompt, answer, options: options.sort(() => Math.random() - 0.5) };
    }).sort(() => Math.random() - 0.5);
  };

  const startDaily = () => {
    let selected = [];
    if (dailyStatus.isComplete && dailyStatus.itemId && Array.isArray(dailyStatus.itemId)) {
      selected = allData.filter(w => dailyStatus.itemId.includes(w.id));
    }
    
    if (selected.length !== 5) {
      const unmastered = allData.filter(w => getVocabStatus(w.id) !== 'correct');
      if (unmastered.length > 0) {
        const todayStr = getTodayString();
        const startIdx = getDailyIndexForDate(todayStr, unmastered.length);
        selected = Array.from({ length: Math.min(5, unmastered.length) }).map((_, i) => unmastered[(startIdx + i) % unmastered.length]);
      } else {
        selected = allData.slice(0, 5);
      }
    }
    
    setLearningQueue(selected);
    setIdx(0);
    setIsFlipped({});
    setMode('daily_learn');
  };

  const finishDailyLearn = () => {
    setQuizData(buildQuiz(learningQueue));
    setIdx(0);
    setScore(0);
    setWrongQueue([]);
    setMode('daily_quiz');
  };

  const handleDailyAnswer = (ans) => {
    const currentQ = quizData[idx];
    if (ans === currentQ.answer) {
      setScore(s => s + 1);
      if (getVocabStatus(currentQ.id) !== 'correct') {
        updateVocabStat(currentQ.id, 'correct');
      }
    } else {
      updateVocabStat(currentQ.id, 'wrong');
      if (!wrongQueue.find(w => w.id === currentQ.id)) {
         setWrongQueue(prev => [...prev, currentQ]);
      }
    }

    if (idx < quizData.length - 1) {
      setIdx(i => i + 1);
    } else {
      const finalScore = score + (ans === currentQ.answer ? 1 : 0);
      const earnedStars = calculateStars(finalScore, quizData.length);
      const dailyId = `daily_${learningQueue.map(q => q.id).sort().join('_')}`;
      
      handleEarnStars(earnedStars, 'vocab', dailyId);
      markDailyComplete('vocab', earnedStars, learningQueue.map(q => q.id));

      if (finalScore < quizData.length) {
        const newWrong = ans !== currentQ.answer ? [...wrongQueue, currentQ] : wrongQueue;
        const uniqueWrong = Array.from(new Set(newWrong.map(a => a.id))).map(id => newWrong.find(a => a.id === id));
        setWrongQueue(uniqueWrong);
        setMode('daily_score');
      } else {
        setMode('daily_done');
      }
    }
  };

  const handleDailyTryAgain = () => {
    setQuizData(buildQuiz(learningQueue));
    setWrongQueue([]);
    setScore(0);
    setIdx(0);
    setMode('daily_quiz');
  };



  const handleMatchClick = (side, id) => {
    if (matchedIds.includes(id)) return;
    
    if (side === 'left') {
      const matchObj = matchingData.left.find(item => item.id === id);
      if (matchObj) playWordAudio(matchObj.word);
      setSelectedLeft(id);
      if (selectedRight) verifyMatch(id, selectedRight);
    } else {
      setSelectedRight(id);
      if (selectedLeft) verifyMatch(selectedLeft, id);
    }
  };

  const verifyMatch = (leftId, rightId) => {
    if (leftId === rightId) {
      const newMatched = [...matchedIds, leftId];
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      if (newMatched.length === matchingData.left.length) {
        setTimeout(() => {
          const matchId = `match_${learningQueue.map(q => q.id).sort().join('_')}`;
          let stars = 3;
          if (mistakeCount >= 3) stars = 0;
          else if (mistakeCount === 2) stars = 1;
          else if (mistakeCount === 1) stars = 2;
          
          handleEarnStars(stars, 'vocab', matchId);
          setMode('matching_done');
        }, 500);
      }
    } else {
      setMistakeCount(c => c + 1);
      setMistakeIds(prev => [...new Set([...prev, leftId, rightId])]);
      setErrorIds([leftId, rightId]);
      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  // Handlers for Flashcards
  const startFlashcards = () => {
    const pool = allData.sort(() => Math.random() - 0.5).slice(0, 5);
    setLearningQueue(pool);
    setIdx(0);
    setIsFlipped({});
    setMode('flash_learn');
  };

  const finishFlashLearn = () => {
    if (Math.random() > 0.5) {
      setQuizData(buildQuiz(learningQueue));
      setIdx(0);
      setScore(0);
      setMode('flash_quiz');
    } else {
      const leftCol = [...learningQueue].sort(() => Math.random() - 0.5);
      const rightCol = [...learningQueue].sort(() => Math.random() - 0.5);
      setMatchingData({ left: leftCol, right: rightCol });
      setMatchedIds([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setErrorIds([]);
      setMistakeIds([]);
      setMistakeCount(0);
      setMode('matching');
    }
  };

  const handleFlashAnswer = (ans) => {
    const currentQ = quizData[idx];
    if (ans === currentQ.answer) {
      setScore(s => s + 1);
      if (getVocabStatus(currentQ.id) !== 'correct') {
        updateVocabStat(currentQ.id, 'correct');
      }
    } else {
      if (getVocabStatus(currentQ.id) !== 'correct') {
        updateVocabStat(currentQ.id, 'wrong');
      }
    }

    if (idx < quizData.length - 1) {
      setIdx(i => i + 1);
    } else {
      const finalScore = score + (ans === currentQ.answer ? 1 : 0);
      const flashId = `flash_${learningQueue.map(q => q.id).sort().join('_')}`;
      handleEarnStars(calculateStars(finalScore, quizData.length), 'vocab', flashId);
      // Always show score, and let them choose whether to retry wrong ones
      if (finalScore < quizData.length) {
        const wrongOnes = quizData.filter(q => getVocabStatus(q.id) !== 'correct');
        setWrongQueue(wrongOnes);
      } else {
        setWrongQueue([]);
      }
      setMode('flash_score');
    }
  };

  const handleFlashTryAgain = () => {
    setWrongQueue([]);
    setScore(0);
    setIdx(0);
    setIsFlipped({});
    setMode('flash_learn');
  };

  const handleMatchingTryAgain = () => {
    setIdx(0);
    setIsFlipped({});
    setMode('flash_learn');
  };

  const leaveEarly = () => {
    setMode('menu');
  };

  // RENDERS
  if (mode === 'daily_learn' || mode === 'flash_learn') {
    const frontText = learningQueue[idx].word;
    const backText = learningQueue[idx].def;
    return (
      <div className="max-w-2xl mx-auto pt-16 flex flex-col items-center relative">
        <button onClick={leaveEarly} className="absolute top-0 right-0 p-4 text-slate-400 hover:text-rose-500 transition-colors">
           <X size={32} />
        </button>
        <p className="text-slate-400 font-bold mb-6 tracking-widest uppercase text-sm">Card {idx + 1} of {learningQueue.length}</p>
        <div 
          onClick={() => toggleFlip(idx)}
          className="w-full aspect-[3/2] bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center cursor-pointer relative group hover:scale-[1.02] transition-transform duration-300 p-8"
        >
          <RotateCcw className="absolute top-8 right-8 text-slate-300 group-hover:text-amber-400 transition-colors" />
          
          <button 
            onClick={(e) => playWordAudio(frontText, e)} 
            className="absolute top-8 left-8 p-3 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-2xl transition-transform active:scale-95 shadow-sm flex items-center gap-2 font-extrabold text-sm border border-sky-200/70 z-10"
            title="Listen to pronunciation"
          >
            <Volume2 size={22} />
            <span className="hidden sm:inline">Listen 🔊</span>
          </button>

          {!isFlipped[idx] ? (
             <h2 className="text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight text-center animate-in zoom-in-95">{frontText}</h2>
          ) : (
             <p className="text-2xl md:text-3xl font-medium text-slate-700 text-center leading-relaxed animate-in zoom-in-95">{backText}</p>
          )}
        </div>
        <div className="flex gap-4 w-full mt-10">
          <button 
            onClick={() => { setIsFlipped({}); setIdx(i => Math.max(0, i - 1)); }}
            disabled={idx === 0}
            className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl disabled:opacity-50 hover:bg-slate-200 transition-colors"
          >
            Prev
          </button>
          <button 
            onClick={() => {
              if (idx < learningQueue.length - 1) { setIsFlipped({}); setIdx(i => i + 1); }
              else { mode === 'daily_learn' ? finishDailyLearn() : finishFlashLearn(); }
            }}
            className="flex-[2] py-5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xl rounded-2xl shadow-[0_6px_0_rgb(14,165,233)] active:shadow-none active:translate-y-1 transition-all"
          >
            {idx < learningQueue.length - 1 ? t('btn_next') : "Start Test"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'daily_quiz' || mode === 'flash_quiz') {
    const q = quizData[idx];
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center relative">
        <button onClick={leaveEarly} className="absolute top-0 right-0 p-4 text-slate-400 hover:text-rose-500 transition-colors">
           <X size={32} />
        </button>
        <p className="text-slate-400 font-bold mb-6 uppercase tracking-wider text-sm">Question {idx + 1} of {quizData.length}</p>
        <div className="flex items-center justify-center gap-3 mb-12">
          <h2 className="text-4xl font-extrabold text-slate-800 leading-relaxed">{q.prompt}</h2>
          <button 
            onClick={(e) => playWordAudio(q.word || q.prompt, e)}
            className="p-3 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-full transition-transform active:scale-95 shadow-sm"
            title="Listen to pronunciation"
          >
            <Volume2 size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {q.options.map(opt => (
            <button 
              key={opt} 
              onClick={() => mode === 'daily_quiz' ? handleDailyAnswer(opt) : handleFlashAnswer(opt)} 
              className="p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-sky-400 hover:bg-sky-50 text-xl font-bold text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'daily_score') {
    const earnedStars = calculateStars(score, quizData.length);
    return <ScoreScreen stars={earnedStars} onRetry={handleDailyTryAgain} onContinue={() => setMode('menu')} customMessage={earnedStars < 3 ? "Review your mistakes and try again!" : undefined} />;
  }

  if (mode === 'flash_score') {
    const earnedStars = calculateStars(score, quizData.length);
    return <ScoreScreen stars={earnedStars} onRetry={handleFlashTryAgain} onContinue={() => setMode('menu')} customMessage={earnedStars < 3 ? "Review your mistakes and try again!" : undefined} />;
  }

  if (mode === 'daily_done') return <ScoreScreen stars={3} customMessage="Perfect! You have completed your daily vocab." onContinue={() => setMode('menu')} hideRetry={true} />;
  if (mode === 'flash_done') return <ScoreScreen stars={calculateStars(score, quizData.length)} onRetry={startFlashcards} onContinue={() => setMode('menu')} />;

  if (mode === 'matching_done') {
    let stars = 3;
    if (mistakeCount >= 3) stars = 0;
    else if (mistakeCount === 2) stars = 1;
    else if (mistakeCount === 1) stars = 2;
    const msg = stars === 3 ? "Perfect Match!" : "Good job, but keep practicing!";
    return <ScoreScreen stars={stars} customMessage={msg} onContinue={() => setMode('menu')} hideRetry={stars === 3} onRetry={handleMatchingTryAgain} />;
  }

  if (mode === 'matching') {
    return (
      <div className="max-w-4xl mx-auto pt-16 text-center relative">
        <button onClick={leaveEarly} className="absolute top-0 right-0 p-4 text-slate-400 hover:text-rose-500 transition-colors">
           <X size={32} />
        </button>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Match the Words!</h2>
        <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-sm">Select the English word and its matching definition</p>
        
        <div className="flex gap-8 justify-center">
          {/* Left Column (English) */}
          <div className="flex flex-col gap-4 flex-1">
            {matchingData.left.map(w => {
              const isMatched = matchedIds.includes(w.id);
              const isSelected = selectedLeft === w.id;
              const isError = errorIds.includes(w.id) && selectedLeft === w.id;
              
              let btnClass = "p-6 rounded-2xl border-2 text-xl font-extrabold transition-all duration-300 shadow-sm ";
              if (isMatched) {
                if (mistakeIds.includes(w.id)) {
                  btnClass += "bg-amber-100 border-amber-400 text-amber-600 opacity-70 pointer-events-none scale-95";
                } else {
                  btnClass += "bg-emerald-100 border-emerald-400 text-emerald-600 opacity-50 pointer-events-none scale-95";
                }
              }
              else if (isError) btnClass += "bg-rose-100 border-rose-400 text-rose-600 scale-95";
              else if (isSelected) btnClass += "bg-sky-100 border-sky-400 text-sky-700 scale-105 shadow-md";
              else btnClass += "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-slate-50";

              return (
                <button key={`l-${w.id}`} onClick={() => handleMatchClick('left', w.id)} className={btnClass}>
                  {w.word}
                </button>
              );
            })}
          </div>

          {/* Right Column (Chinese) */}
          <div className="flex flex-col gap-4 flex-1">
            {matchingData.right.map(w => {
              const isMatched = matchedIds.includes(w.id);
              const isSelected = selectedRight === w.id;
              const isError = errorIds.includes(w.id) && selectedRight === w.id;
              
              let btnClass = "p-6 rounded-2xl border-2 text-xl font-bold transition-all duration-300 shadow-sm ";
              if (isMatched) {
                if (mistakeIds.includes(w.id)) {
                  btnClass += "bg-amber-100 border-amber-400 text-amber-600 opacity-70 pointer-events-none scale-95";
                } else {
                  btnClass += "bg-emerald-100 border-emerald-400 text-emerald-600 opacity-50 pointer-events-none scale-95";
                }
              }
              else if (isError) btnClass += "bg-rose-100 border-rose-400 text-rose-600 scale-95";
              else if (isSelected) btnClass += "bg-sky-100 border-sky-400 text-sky-700 scale-105 shadow-md";
              else btnClass += "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-slate-50";

              return (
                <button key={`r-${w.id}`} onClick={() => handleMatchClick('right', w.id)} className={btnClass}>
                  {w.def}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto pt-6">
      <div className="flex justify-between items-center mb-8">
        <div className="w-24"></div>
        <div className="flex bg-slate-100 rounded-full p-1 shadow-inner">
          <button 
            onClick={() => setActiveTab('learn')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'learn' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Layers size={18}/> {t('tab_learn_mode')}
          </button>
          <button 
            onClick={() => { setActiveTab('list'); setPage(1); }} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'list' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={18}/> {t('tab_vocab_list')}
          </button>
        </div>
        <div className="w-24"></div>
      </div>

      {activeTab === 'learn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4">
          {/* Daily Vocab Card */}
          <div className={`p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center transition-all group h-full ${
            (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
              ? 'border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 shadow-sky-100/60' 
              : dailyStatus.isComplete 
                ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-amber-100' 
                : 'border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 shadow-sky-100/60 hover:shadow-sky-200/80 hover:border-sky-300'
          }`}>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 rounded-[2rem] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 ${
              (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? 'bg-sky-500 text-white shadow-sky-200' : dailyStatus.isComplete ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sky-200'
            }`}>
              {(dailyStatus.isComplete && dailyStatus.bestStars === 3) ? <CheckCircle2 size={48} /> : <BookOpen size={48} />}
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-700 mb-3">
              {t('daily_vocab_goal')}
            </span>
            <h3 className="text-3xl font-black text-slate-800 mb-3">{t('daily_vocab_title')}</h3>
            <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('daily_vocab_desc')}</p>
            <button 
              onClick={startDaily} 
              disabled={dailyStatus.isComplete && dailyStatus.bestStars === 3}
              className={`w-full py-4 font-black text-xl rounded-2xl transition-all mt-auto ${
                (dailyStatus.isComplete && dailyStatus.bestStars === 3)
                  ? 'bg-sky-500 text-white shadow-none translate-y-1 cursor-not-allowed opacity-90'
                  : dailyStatus.isComplete
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgba(245,158,11,1)] active:translate-y-1 active:shadow-none'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_6px_0_rgb(14,165,233)] active:shadow-none active:translate-y-1'
              }`}
            >
              {dailyStatus.isComplete ? (dailyStatus.bestStars === 3 ? t('completed_today') : t('btn_keep_practicing')) : t('btn_start_launch')}
            </button>
          </div>

          {/* Keep Practicing Card */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50/30 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col items-center text-center group hover:border-slate-300 transition-all h-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-md shadow-slate-300 transition-transform group-hover:scale-105">
              <Activity size={48} />
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
              {t('full_curriculum')}
            </span>
            <h3 className="text-3xl font-black text-slate-800 mb-3">{t('keep_practicing_vocab_title')}</h3>
            <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('keep_practicing_vocab_desc')}</p>
            <button onClick={startFlashcards} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(15,23,42)] active:shadow-none active:translate-y-1 transition-all mt-auto">
              {t('btn_start_launch')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <div className="flex justify-center gap-4 mb-10">
            {['all', 'mastered', 'unmastered'].map(f => (
              <button 
                key={f} 
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${filter === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-transparent text-slate-400 border-slate-200 hover:border-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {paginatedData.length === 0 ? (
            filter === 'unmastered' ? (
              <div className="text-center p-12 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-[2.5rem] border-2 border-sky-200 shadow-lg my-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-sky-500 text-white rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-md shadow-sky-200">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">🎉 You have finished all Vocab content!</h3>
                <p className="text-slate-600 font-bold text-lg max-w-md mx-auto mb-6">
                  You have mastered every single vocabulary flashcard for Grade {grade}! Exceptional word mastery!
                </p>
                <button 
                  onClick={() => { setFilter('mastered'); setPage(1); }}
                  className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95"
                >
                  Review Mastered Words
                </button>
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-slate-400 font-bold mb-10">
                No words match this filter.
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedData.map(word => {
              const status = getVocabStatus(word.id);
              const borderColor = status === 'correct' ? 'border-green-400 shadow-green-100' : status === 'wrong' ? 'border-rose-400 shadow-rose-100' : 'border-amber-300 shadow-amber-100';
              const textColor = status === 'correct' ? 'text-green-700' : status === 'wrong' ? 'text-rose-700' : 'text-amber-700';

              return (
                <div 
                  key={word.id}
                  onClick={() => toggleFlip(word.id)}
                  className={`bg-white p-6 rounded-2xl border-2 shadow-sm cursor-pointer aspect-video flex flex-col justify-center items-center relative group transition-all hover:-translate-y-1 ${borderColor}`}
                >
                  <button 
                    onClick={(e) => playWordAudio(word.word, e)}
                    className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors z-10"
                    title="Listen to pronunciation"
                  >
                    <Volume2 size={18} />
                  </button>

                  {!isFlipped[word.id] ? (
                    <span className={`font-extrabold text-lg text-slate-800 ${textColor}`}>{word.word}</span>
                  ) : (
                    <span className="font-bold text-sm text-slate-600 text-center px-2">{word.def}</span>
                  )}
                </div>
              );
            })}
          </div>
          )}

          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}
    </div>
  );
};
