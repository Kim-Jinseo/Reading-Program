import React, { useState, useMemo } from 'react';
import { Star, ChevronRight, BookOpen, CheckCircle2, List, Layers, ChevronLeft, Filter, Gavel, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getDailyItem } from '../../utils/dailySelection';
import { ScoreScreen } from '../common/ScoreScreen';
import Pagination from '../common/Pagination';
import { CourtroomView } from './grammar/CourtroomView';

export const GrammarModule = () => {
  const { t, curriculumDb, grade, user, handleEarnStars, calculateStars, updateCompletion, updateGrammarStat, getDailyStatus, markDailyComplete } = useAppContext();
  const dailyStatus = getDailyStatus('grammar');
  const [isDaily, setIsDaily] = useState(false);
  
  // Flatten grammar questions into a bank and group by concept
  const { questionBank, conceptList } = useMemo(() => {
    const rawData = curriculumDb?.[grade]?.grammar || [];
    let qList = [];
    let concepts = [];
    
    rawData.forEach((lesson, lIdx) => {
      let conceptName = lesson.title?.en || `Grammar Concept ${lIdx + 1}`;
      let conceptNameZh = lesson.title?.zh || '';
      let descEn = lesson.desc?.en || 'Read rules and take a quick quiz.';
      let descZh = lesson.desc?.zh || '';
      
      const conceptQuestions = [];

      lesson.questions.forEach((q, qIdx) => {
        const id = `${lesson.id}-${qIdx}`;
        const diff = q.difficulty || 1; // 1, 2, or 3 stars based on curriculum
        const qObj = {
          id,
          lessonId: lesson.id,
          concept: conceptName,
          conceptZh: conceptNameZh,
          rule: lesson.rule,
          q: q.q,
          options: q.options,
          answer: q.a,
          difficulty: diff,
          index: qList.length + 1
        };
        qList.push(qObj);
        conceptQuestions.push(qObj);
      });

      concepts.push({
        id: lesson.id,
        name: conceptName,
        nameZh: conceptNameZh,
        descEn: descEn,
        descZh: descZh,
        rule: lesson.rule,
        questions: conceptQuestions,
        total: conceptQuestions.length
      });
    });
    return { questionBank: qList, conceptList: concepts };
  }, [curriculumDb, grade]);

  const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'bank', 'courtroom'
  const [learnView, setLearnView] = useState('boxes'); // 'boxes', 'list'
  const [mode, setMode] = useState('menu'); // 'menu', 'courtroom', 'solve', 'done', 'learn_concept', 'learn_quiz', 'learn_score'
  const [activeQueue, setActiveQueue] = useState([]);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [sessionScore, setSessionScore] = useState(0); // stars earned in current session
  const [wrongQueue, setWrongQueue] = useState([]); // for grammar retry
  const [activeConcept, setActiveConcept] = useState(null);
  const [showConceptModal, setShowConceptModal] = useState(false);
  
  // Bank Filters & Pagination
  const [filterResult, setFilterResult] = useState('all'); // 'all', 'completed', 'uncompleted'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getQStat = (id, baseDifficulty) => {
    const defaultStat = { maxStars: baseDifficulty, earned: 0, solved: false, attempts: 0 };
    return user.grammarStats?.[id] || defaultStat;
  };

  // Calculate stats for a concept
  const getConceptStats = (concept) => {
    let solvedCount = 0;
    let earnedStars = 0;
    let totalMaxStars = 0;

    concept.questions.forEach(q => {
      const stat = getQStat(q.id, q.difficulty);
      if (stat.solved) solvedCount++;
      earnedStars += stat.earned;
      totalMaxStars += q.difficulty;
    });

    const isCompleted = solvedCount === concept.total;
    const accuracy = totalMaxStars > 0 ? Math.round((earnedStars / totalMaxStars) * 100) : 0;

    return { solvedCount, isCompleted, accuracy, earnedStars, totalMaxStars };
  };

  // Filter and split concepts for Bank Tab
  const { uncompletedConcepts, completedConcepts } = useMemo(() => {
    let uncomp = [];
    let comp = [];
    
    conceptList.forEach(c => {
      const stats = getConceptStats(c);
      if (stats.isCompleted) {
        if (filterResult === 'all' || filterResult === 'completed') comp.push({ ...c, stats });
      } else {
        if (filterResult === 'all' || filterResult === 'uncompleted') uncomp.push({ ...c, stats });
      }
    });

    return { uncompletedConcepts: uncomp, completedConcepts: comp };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptList, user.grammarStats, filterResult]);

  // Learn Tab Completion
  const completedLearn = user.grammar || [];
  const learnUncompleted = filterResult === 'completed' ? [] : conceptList.filter(c => !completedLearn.includes(c.id));
  const learnCompleted = filterResult === 'uncompleted' ? [] : conceptList.filter(c => completedLearn.includes(c.id));
  const allLearnItems = [...learnUncompleted, ...learnCompleted];
  
  const paginatedLearn = allLearnItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalLearnPages = Math.ceil(allLearnItems.length / ITEMS_PER_PAGE);

  const getBankItems = () => {
    if (filterResult === 'completed') return completedConcepts;
    if (filterResult === 'uncompleted') return uncompletedConcepts;
    return [...uncompletedConcepts, ...completedConcepts];
  };

  const currentBankItems = getBankItems();
  const paginatedBank = currentBankItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalBankPages = Math.ceil(currentBankItems.length / ITEMS_PER_PAGE);

  // -------- Bank Methods --------
  const startPractice = (concept = null) => {
    let pool = [];
    if (concept) {
      pool = concept.questions.filter(q => !getQStat(q.id, q.difficulty).solved);
      if (pool.length === 0) pool = concept.questions;
    } else {
      const unsolved = questionBank.filter(q => !getQStat(q.id, q.difficulty).solved);
      pool = unsolved.sort(() => Math.random() - 0.5).slice(0, 10);
      if (pool.length === 0) {
         alert("You have solved all grammar questions!");
         return;
      }
    }
    const shuffledPool = pool.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
    setActiveQueue(shuffledPool);
    setActiveQIndex(0);
    setSessionScore(0);
    setWrongQueue([]);
    setMode('solve');
  };

  const handleBankAnswer = (opt) => {
    if (selectedOpt) return; // Prevent multiple clicks
    setSelectedOpt(opt);

    const activeQ = activeQueue[activeQIndex];
    const stat = getQStat(activeQ.id, activeQ.difficulty);

    if (opt === activeQ.answer) {
      if (!stat.solved) {
        updateGrammarStat(activeQ.id, { solved: true, earned: stat.maxStars });
        if (stat.maxStars > 0) handleEarnStars(stat.maxStars, 'grammar', activeQ.id);
        setSessionScore(s => s + stat.maxStars);
      }
    } else {
      if (!wrongQueue.find(q => q.id === activeQ.id)) {
        setWrongQueue(prev => [...prev, activeQ]);
      }
    }
  };

  const nextBankQuestion = () => {
    setSelectedOpt(null);
    if (activeQIndex < activeQueue.length - 1) {
      setActiveQIndex(i => i + 1);
    } else {
      setMode('done');
    }
  };

  const handleBankTryAgain = () => {
    const shuffledWrong = wrongQueue.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
    setActiveQueue(shuffledWrong);
    setActiveQIndex(0);
    setSessionScore(0);
    setWrongQueue([]);
    setSelectedOpt(null);
    setMode('solve');
  };

  const leaveEarly = () => {
    setMode('menu');
    setActiveConcept(null);
    setSelectedOpt(null);
  };

  // -------- Learn Methods --------
  const openLearnConcept = (concept) => {
    setActiveConcept(concept);
    setMode('learn_concept');
  };

  const startLearnQuiz = () => {
    const pool = [...activeConcept.questions].sort(() => Math.random() - 0.5).slice(0, 3);
    const shuffledPool = pool.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
    setActiveQueue(shuffledPool);
    setActiveQIndex(0);
    setSessionScore(0);
    setMode('learn_quiz');
  };

  const handleLearnAnswer = (opt) => {
    const activeQ = activeQueue[activeQIndex];
    const isCorrect = opt === activeQ.answer;
    
    if (isCorrect) {
      setSessionScore(s => s + 1);
    }

    if (activeQIndex < activeQueue.length - 1) {
      setActiveQIndex(i => i + 1);
    } else {
      const finalScore = sessionScore + (isCorrect ? 1 : 0);
      const earnedStars = calculateStars(finalScore, activeQueue.length);
      if (isDaily) markDailyComplete('grammar', earnedStars, activeConcept.id);
      
      if (finalScore === activeQueue.length) {
        handleEarnStars(3, 'grammar', activeConcept.id);
        updateCompletion('grammar', activeConcept.id);
      } else {
        handleEarnStars(earnedStars, 'grammar', activeConcept.id);
      }
      setSessionScore(finalScore);
      setMode('learn_score');
    }
  };

  const resetToMenu = () => {
    setMode('menu');
    setActiveConcept(null);
  };

  // ---------------- RENDERS ----------------

  if (mode === 'courtroom') {
    return <CourtroomView onBack={() => setMode('menu')} />;
  }

  if (mode === 'menu') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex justify-center mb-10 overflow-x-auto hide-scrollbar px-4 pb-2 -mx-4 sm:mx-0 sm:px-0 sm:pb-0">
          
          <div className="flex gap-2 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-slate-200/50 whitespace-nowrap min-w-max">
            <button 
              onClick={() => { setActiveTab('learn'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${activeTab === 'learn' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers size={18}/> {t('tab_learn')}
            </button>
            <button 
              onClick={() => { setActiveTab('bank'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${activeTab === 'bank' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={18}/> {t('tab_question_bank')}
            </button>
            <button 
              onClick={() => setMode('courtroom')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md hover:scale-105`}
            >
              <Gavel size={18}/> {t('tab_courtroom_trial')}
            </button>
          </div>

        </div>

        {activeTab === 'learn' ? (
          learnView === 'boxes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4">
              {/* Daily Grammar Card */}
              <div className={`p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center transition-all group h-full ${
                learnUncompleted.length === 0 || (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
                  ? 'border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 shadow-violet-100/60' 
                  : dailyStatus.isComplete 
                    ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-amber-100' 
                    : 'border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 shadow-violet-100/60 hover:shadow-violet-200/80 hover:border-violet-300'
              }`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 rounded-[2rem] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 ${
                  learnUncompleted.length === 0 || (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? 'bg-violet-500 text-white shadow-violet-200' : dailyStatus.isComplete ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-200'
                }`}>
                  {learnUncompleted.length === 0 || (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? <CheckCircle2 size={48} /> : <BookOpen size={48} />}
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-700 mb-3">
                  {t('daily_grammar_goal')}
                </span>
                <h3 className="text-3xl font-black text-slate-800 mb-3">
                  {learnUncompleted.length === 0 ? t('all_mastered_title') : t('daily_grammar_title')}
                </h3>
                <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">
                  {learnUncompleted.length === 0 ? t('all_mastered_desc') : t('daily_grammar_desc')}
                </p>
                <button 
                  onClick={() => {
                    const c = getDailyItem(conceptList, learnUncompleted, dailyStatus.itemId);
                    if (c) { setIsDaily(true); openLearnConcept(c); }
                  }} 
                  disabled={learnUncompleted.length === 0 || (dailyStatus.isComplete && dailyStatus.bestStars === 3)}
                  className={`w-full py-4 font-black text-xl rounded-2xl transition-all mt-auto ${
                    learnUncompleted.length === 0 || (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
                      ? 'bg-violet-500 text-white shadow-none translate-y-1 cursor-not-allowed opacity-90' 
                      : dailyStatus.isComplete 
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgba(245,158,11,1)] active:translate-y-1 active:shadow-none' 
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_6px_0_rgb(124,58,237)] active:shadow-none active:translate-y-1'
                  }`}
                >
                  {learnUncompleted.length === 0 
                    ? 'Mastered ✨' 
                    : dailyStatus.isComplete 
                      ? (dailyStatus.bestStars === 3 ? t('completed_today') : t('btn_keep_practicing')) 
                      : t('btn_start_launch')}
                </button>
              </div>

              {/* Keep Learning Card */}
              <div className="bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col items-center text-center group hover:border-slate-300 transition-all h-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-md shadow-slate-300 transition-transform group-hover:scale-105">
                  <Layers size={48} />
                </div>
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
                  {t('full_curriculum')}
                </span>
                <h3 className="text-3xl font-black text-slate-800 mb-3">{t('keep_learning_grammar_title')}</h3>
                <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('keep_learning_grammar_desc')}</p>
                <button 
                  onClick={() => setLearnView('list')} 
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(15,23,42)] active:shadow-none active:translate-y-1 transition-all mt-auto"
                >
                  {t('keep_practicing_btn')}
                </button>
              </div>
            </div>
          ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <button onClick={() => setLearnView('boxes')} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2"><ChevronLeft size={16}/> Back to Options</button>
              
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar w-full sm:w-auto">
                <div className="flex items-center gap-2 text-slate-500 font-bold ml-2 shrink-0">
                  <Filter size={18}/> Filters:
                </div>
                <div className="flex gap-2 min-w-max">
                  {['all', 'completed', 'uncompleted'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => { setFilterResult(f); setPage(1); }}
                      className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${filterResult === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-10">
              {paginatedLearn.map(c => {
                const isCompleted = completedLearn.includes(c.id);
                return (
                  <button 
                    key={c.id}
                    onClick={() => { setIsDaily(false); openLearnConcept(c); }}
                    className={`p-6 rounded-2xl shadow-sm border transition-all group flex items-center justify-between text-left ${isCompleted ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${isCompleted ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 text-indigo-500'}`}>
                        {isCompleted ? <CheckCircle2 size={24} /> : <BookOpen size={24} />}
                      </div>
                      <div>
                        <h3 className={`text-xl font-extrabold transition-colors ${isCompleted ? 'text-indigo-800' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                          {c.name} {c.nameZh && <span className="text-sm font-medium text-slate-400 ml-2 font-normal">{c.nameZh}</span>}
                        </h3>
                        <p className={`font-medium mt-1 ${isCompleted ? 'text-indigo-500' : 'text-slate-500'}`}>
                          {isCompleted ? 'Mastered' : c.descEn}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={24} className={isCompleted ? 'text-indigo-300' : 'text-slate-300 group-hover:text-indigo-400'} />
                  </button>
                );
              })}
              {allLearnItems.length === 0 && (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-slate-100 border-dashed">
                  <p className="text-slate-500 font-bold">You've mastered all concepts!</p>
                </div>
              )}
            </div>

            <Pagination currentPage={page} totalPages={totalLearnPages} onPageChange={setPage} />
          </div>
          )
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4 mb-8 sm:items-center overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2 sm:gap-4 min-w-max">
                <div className="flex items-center gap-2 text-slate-500 font-bold ml-1 sm:ml-2">
                  <Filter size={18}/> Filters:
                </div>
                <div className="flex gap-2">
                  {['all', 'completed', 'uncompleted'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => { setFilterResult(f); setPage(1); }}
                      className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${filterResult === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-10">
              {paginatedBank.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col md:flex-row gap-8 justify-between items-center group hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
                      {c.name} {c.nameZh && <span className="text-lg font-medium text-slate-400 ml-2 font-normal">{c.nameZh}</span>}
                    </h3>
                    <p className="text-slate-500 font-medium mb-4">{c.descEn}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Layers size={16} /> {c.questions.length} questions</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-1 text-amber-500"><Star size={16} /> {c.stats.totalMaxStars} potential stars</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${c.stats.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${(c.stats.solvedCount / c.questions.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-2 tracking-wide uppercase">{c.stats.solvedCount} of {c.questions.length} solved</p>
                  </div>

                  <div className="flex flex-col items-center justify-center min-w-[120px]">
                    {c.stats.isCompleted ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                          <CheckCircle2 size={32} />
                        </div>
                        <span className="font-extrabold text-emerald-600 uppercase tracking-wider text-sm">Mastered</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startPractice(c)}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1 transition-all"
                      >
                        Practice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination currentPage={page} totalPages={totalBankPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    );
  }

  // LEARN - CONCEPT SCREEN
  if (mode === 'learn_concept') {
    const isCompleted = completedLearn.includes(activeConcept.id);
    return (
      <div className="max-w-3xl mx-auto pt-6 animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-8">
          <button onClick={resetToMenu} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
            <ChevronLeft size={20}/> Back
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen size={120} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-extrabold text-sm mb-6 uppercase tracking-wider relative z-10">
            <BookOpen size={16} /> Grammar Concept
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-800 mb-8 relative z-10">{activeConcept.name}</h2>
          
          <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 mb-10 relative z-10">
            <p className="text-2xl text-slate-700 font-medium leading-relaxed mb-6">
              {activeConcept.rule.en}
            </p>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              {activeConcept.rule.zh}
            </p>
          </div>

          {!isCompleted ? (
            <button 
              onClick={startLearnQuiz}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xl rounded-2xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1 transition-all relative z-10"
            >
              Start Quiz
            </button>
          ) : (
            <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
              <p className="text-emerald-700 font-bold text-lg flex items-center justify-center gap-2">
                <CheckCircle2 /> You have mastered this concept!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LEARN - QUIZ SCREEN
  if (mode === 'learn_quiz') {
    const activeQ = activeQueue[activeQIndex];
    return (
      <div className="max-w-2xl mx-auto pt-10 animate-in fade-in">
        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-extrabold text-slate-400 tracking-widest uppercase text-sm">Question {activeQIndex + 1} of {activeQueue.length}</h3>
            <div className="flex gap-2">
              {activeQueue.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i === activeQIndex ? 'bg-indigo-500 scale-125' : i < activeQIndex ? 'bg-indigo-200' : 'bg-slate-200'} transition-all`}></div>
              ))}
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-10 leading-relaxed">
            {activeQ.q}
          </h2>

          <div className="flex flex-col gap-4">
            {activeQ.options.map(opt => (
              <button 
                key={opt}
                onClick={() => handleLearnAnswer(opt)}
                className="p-5 text-left rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 font-bold text-xl text-slate-700 transition-all active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // LEARN - SCORE SCREEN
  if (mode === 'learn_score') {
    const isPerfect = sessionScore === activeQueue.length;
    return (
      <ScoreScreen 
        stars={isPerfect ? 3 : sessionScore > 0 ? 1 : 0} 
        customMessage={isPerfect ? "Perfect! Concept mastered." : "You need a perfect score to master this concept. Try again!"}
        onRetry={isPerfect ? undefined : startLearnQuiz}
        onContinue={resetToMenu}
      />
    );
  }

  // BANK - SOLVE MODE (Centered single card)
  if (mode === 'solve') {
    const activeQ = activeQueue[activeQIndex];
    const stat = getQStat(activeQ.id, activeQ.difficulty);

    return (
      <div className="max-w-3xl mx-auto pt-6 flex flex-col h-[90vh] animate-in fade-in">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={leaveEarly} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
            <ChevronLeft size={20}/> Exit Practice
          </button>
          <div className="font-extrabold text-slate-800 flex items-center gap-2">
            Question {activeQIndex + 1} of {activeQueue.length}
          </div>
          <div className="w-auto text-right flex justify-end">
             <button onClick={() => setShowConceptModal(true)} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-extrabold bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors">
               <BookOpen size={16} /> Grammar Rule
             </button>
          </div>
        </div>

        <div className="flex-1 bg-white border-2 border-slate-100 rounded-3xl p-8 md:p-12 flex flex-col shadow-lg overflow-y-auto relative">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md">
                {activeQIndex + 1}
              </span>
              <div>
                <span className="text-slate-400 font-extrabold text-sm tracking-widest uppercase block mb-1">Grammar Practice</span>
                <span className="text-slate-700 font-bold flex items-center gap-2">
                   {activeQ.concept}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-amber-50 px-5 py-2.5 rounded-full border border-amber-200">
              <span className="text-sm font-bold text-amber-700">Reward:</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < stat.maxStars ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-800 mb-12 leading-relaxed text-center">
            {activeQ.q}
          </h2>

          <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto w-full">
            {activeQ.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              let btnClass = "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md text-slate-700 bg-white";
              let letterClass = "border-slate-200 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-100";
              let icon = null;

              if (selectedOpt) {
                if (opt === activeQ.answer) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm";
                  letterClass = "border-emerald-500 bg-emerald-500 text-white";
                  icon = <CheckCircle2 className="text-emerald-600" size={28} />;
                } else if (opt === selectedOpt) {
                  btnClass = "border-rose-400 bg-rose-50 text-rose-900 shadow-sm";
                  letterClass = "border-rose-400 bg-rose-400 text-white";
                  icon = <X className="text-rose-500" size={28} />;
                } else {
                  btnClass = "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button 
                  key={opt}
                  onClick={() => handleBankAnswer(opt)}
                  disabled={!!selectedOpt}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 font-bold text-2xl transition-all group active:scale-[0.98] ${btnClass}`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-colors ${letterClass}`}>
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>

          {selectedOpt === activeQ.answer && (
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4 flex justify-between items-center z-10">
              <div>
                <h4 className="text-emerald-800 font-extrabold text-2xl mb-1 flex items-center gap-2">
                  <CheckCircle2 size={28} /> Correct!
                </h4>
                <p className="text-emerald-700 font-bold text-lg">You earned {stat.maxStars} stars.</p>
              </div>
              <button 
                onClick={nextBankQuestion}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg rounded-xl shadow-[0_6px_0_rgb(16,185,129)] active:shadow-none active:translate-y-1 transition-all"
              >
                {activeQIndex < activeQueue.length - 1 ? 'Next Question' : 'Finish Practice'}
              </button>
            </div>
          )}

          {selectedOpt && selectedOpt !== activeQ.answer && (
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
              <div>
                <h4 className="text-rose-800 font-extrabold text-2xl mb-1 flex items-center gap-2">
                  <X size={28} /> Incorrect!
                </h4>
                <p className="text-rose-700 font-bold text-lg">You can try again later.</p>
              </div>
              <button 
                onClick={nextBankQuestion}
                className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-lg rounded-xl shadow-[0_6px_0_rgb(225,29,72)] active:shadow-none active:translate-y-1 transition-all whitespace-nowrap"
              >
                {activeQIndex < activeQueue.length - 1 ? 'Next Question' : 'Finish Practice'}
              </button>
            </div>
          )}
        </div>

        {/* Concept Modal */}
        {showConceptModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 bg-indigo-50/50">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-extrabold text-xs mb-3 uppercase tracking-wider">
                  <BookOpen size={14} /> Concept Explanation
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">{activeQ.concept}</h3>
              </div>
              <div className="p-8">
                <p className="text-xl text-slate-700 font-medium leading-relaxed mb-6">
                  {activeQ.rule.en}
                </p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    {activeQ.rule.zh}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowConceptModal(false)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_4px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1 transition-all">Got it</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // BANK - DONE SCREEN
  if (mode === 'done') {
    const totalPotentialStars = activeQueue.reduce((acc, q) => acc + q.difficulty, 0);
    const starRatio = totalPotentialStars > 0 ? sessionScore / totalPotentialStars : 1;
    let earnedStars = 3;
    if (starRatio < 0.5) earnedStars = 1;
    else if (starRatio < 0.9) earnedStars = 2;

    return (
      <ScoreScreen 
        stars={earnedStars} 
        customMessage={`Great practice session! You earned ${sessionScore} stars.`} 
        onContinue={resetToMenu} 
        onRetry={wrongQueue.length > 0 ? handleBankTryAgain : undefined}
      />
    );
  }

  return null;
};
