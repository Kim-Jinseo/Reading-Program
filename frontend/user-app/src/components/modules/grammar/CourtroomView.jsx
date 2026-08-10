import React, { useState } from 'react';
import { ChevronLeft, Heart, CheckCircle2, XCircle, Star, Lock, Play, RotateCcw, ArrowRight, Shield } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { COURTROOM_CASES_BY_GRADE } from '../../../data/courtroomCases';

export const CourtroomView = ({ onBack }) => {
  const { t, grade, user, handleEarnStars, handleEarnBattleStars } = useAppContext();
  const isAdmin = user?.role === 'admin' || user?.name?.toLowerCase() === 'teacher2026' || user?.username?.toLowerCase() === 'teacher2026';
  const equippedShield = user?.equippedShield || (user?.inventory?.includes('shield_gold') ? 'shield_gold' : user?.inventory?.includes('shield_silver') ? 'shield_silver' : user?.inventory?.includes('shield_bronze') ? 'shield_bronze' : (isAdmin ? 'shield_gold' : null));
  const hasGavel = isAdmin || user?.inventory?.includes('court_gavel');
  const COURTROOM_CASES = COURTROOM_CASES_BY_GRADE[grade] || COURTROOM_CASES_BY_GRADE['3-4'] || [];
  
  const [levelIndex, setLevelIndex] = useState(0); // 0 to 29 (30 levels total)
  const [levelCases, setLevelCases] = useState([]); // 5 sampled cases for current level
  const [caseInLevel, setCaseInLevel] = useState(0); // 0 to 4
  
  const [gameState, setGameState] = useState('level_select'); // level_select, judgment, present_evidence, verdict_won, verdict_lost
  const [strikes, setStrikes] = useState(3);
  const [shieldBlocks, setShieldBlocks] = useState(0);
  const [shieldAbsorbFlash, setShieldAbsorbFlash] = useState(false);
  const [shatteringShieldIndex, setShatteringShieldIndex] = useState(null);
  const [shake, setShake] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  
  const currentCase = levelCases[caseInLevel];
  
  const [isFlawed, setIsFlawed] = useState(true);
  const [displayedTestimony, setDisplayedTestimony] = useState("");
  const [currentEvidenceOptions, setCurrentEvidenceOptions] = useState([]);

  const totalLevels = 30;

  const fisherYatesShuffle = (array) => {
    const arr = [...(array || [])];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Setup trial state explicitly for a specific case and level difficulty
  const initCaseForLevel = (caseObj, lvlIdx) => {
    if (!caseObj) return;

    const levelNum = lvlIdx + 1;
    // Levels 1-9: 3 choices (A,B,C), Levels 10-19: 4 choices (A,B,C,D), Levels 20-30: 5 choices (A,B,C,D,E)
    const choiceCount = levelNum < 10 ? 3 : levelNum < 20 ? 4 : 5;

    const correctOpt = caseObj.evidenceOptions.find(o => o.isCorrect);
    const wrongOpts = caseObj.evidenceOptions.filter(o => !o.isCorrect);
    const sampledWrongs = fisherYatesShuffle(wrongOpts).slice(0, choiceCount - 1);
    const finalOptions = fisherYatesShuffle([correctOpt, ...sampledWrongs]);
    
    setCurrentEvidenceOptions(finalOptions);

    const flawless = Math.random() < 0.5;
    setIsFlawed(!flawless);

    if (flawless) {
      setDisplayedTestimony(correctOpt ? correctOpt.text : caseObj.testimony);
    } else {
      setDisplayedTestimony(caseObj.testimony);
    }
  };

  const handleMistake = () => {
    // Check if player has an active shield block
    if (shieldBlocks > 0) {
      const shieldToShatter = shieldBlocks - 1;
      setShatteringShieldIndex(shieldToShatter);
      setShieldBlocks(prev => prev - 1);
      setShieldAbsorbFlash(true);
      setTimeout(() => setShatteringShieldIndex(null), 600);
      setTimeout(() => setShieldAbsorbFlash(false), 2200);
      return;
    }

    setShake(true);
    setDamageFlash(true);
    const newStrikes = Math.max(0, strikes - 1);
    setStrikes(newStrikes);
    setTimeout(() => { setShake(false); setDamageFlash(false); }, 800);
    
    if (newStrikes === 0) {
      setGameState('verdict_lost');
    }
  };

  const triggerCorrectFlash = (cb) => {
    setCorrectFlash(true);
    setTimeout(() => {
      setCorrectFlash(false);
      if (cb) cb();
    }, 600);
  };

  const advanceCase = () => {
    const nextCaseInLevel = caseInLevel + 1;
    
    if (nextCaseInLevel >= 5) {
      // Level cleared!
      setGameState('verdict_won');
      const heartsLeft = strikes + shieldBlocks;
      const baseStars = heartsLeft * 2; // 2 stars per heart left!
      const starsWon = hasGavel ? baseStars * 2 : baseStars;
      handleEarnStars(starsWon, 'grammar', `courtroom_level_${grade}_${levelIndex}`);
      handleEarnBattleStars(starsWon);
    } else {
      // Next case in the same level
      setCaseInLevel(nextCaseInLevel);
      initCaseForLevel(levelCases[nextCaseInLevel], levelIndex);
      setGameState('judgment');
    }
  };

  const handleJudgment = (guess) => {
    if (guess === 'correct') {
      if (!isFlawed) {
        triggerCorrectFlash(() => advanceCase());
      } else {
        handleMistake();
      }
    } else if (guess === 'wrong') {
      if (isFlawed) {
        setGameState('present_evidence');
      } else {
        handleMistake();
      }
    }
  };

  const handlePresentEvidence = (evidence) => {
    if (evidence.isCorrect) {
      setDisplayedTestimony(evidence.text);
      triggerCorrectFlash(() => advanceCase());
    } else {
      handleMistake();
    }
  };

  const startLevel = (idx) => {
    setLevelIndex(idx);
    const levelNum = idx + 1;
    const pool = COURTROOM_CASES.filter(c => c.level === levelNum);
    const selected5 = fisherYatesShuffle(pool).slice(0, 5);
    setLevelCases(selected5);
    setCaseInLevel(0);
    setStrikes(3);
    
    // Bronze = 1 Heart covered, Silver = 2 Hearts covered, Gold = 3 Hearts covered
    const initialBlocks = equippedShield === 'shield_gold' ? 3 : equippedShield === 'shield_silver' ? 2 : equippedShield === 'shield_bronze' ? 1 : 0;
    setShieldBlocks(initialBlocks);

    if (selected5.length > 0) {
      initCaseForLevel(selected5[0], idx);
    }
    setGameState('judgment');
  };

  const returnToMenu = () => {
    setGameState('level_select');
  };

  // --- RENDERS ---
  
  // LEVEL SELECTOR
  if (gameState === 'level_select') {
    return (
      <div className="max-w-5xl mx-auto pt-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
            <ChevronLeft size={20}/> Exit Grammar Court
          </button>
          
          <div className="bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm font-black text-indigo-600">
            {t('courtroom_select_level')}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {Array.from({ length: totalLevels }).map((_, idx) => {
            const isAdmin = user?.role === 'admin' || user?.name?.toLowerCase() === 'teacher2026' || user?.username?.toLowerCase() === 'teacher2026';
            // Level 1 (idx 0) is always unlocked; subsequent levels require ALL previous levels to be cleared (bypassed for teacher2026/admin)
            const isUnlocked = isAdmin || idx === 0 || Array.from({ length: idx }, (_, i) => i).every(prevIdx => (user?.starsTracker?.[`courtroom_level_${grade}_${prevIdx}`] || 0) > 0);
            const starsEarned = user?.starsTracker?.[`courtroom_level_${grade}_${idx}`] || 0;
            const baseStarsEarned = hasGavel ? Math.floor(starsEarned / 2) : starsEarned;
            const heartsEarned = starsEarned > 0 ? Math.min(3, Math.max(1, Math.floor(baseStarsEarned / 2))) : 0;
            const isPurple = starsEarned > 6;
            const isCompleted = starsEarned > 0;
            
            return (
              <button
                key={idx}
                disabled={!isUnlocked}
                onClick={() => startLevel(idx)}
                className={`relative p-5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all min-h-[160px] ${
                  isUnlocked 
                    ? isCompleted
                      ? isPurple
                        ? 'bg-white border-purple-400 hover:border-purple-600 shadow-md shadow-purple-100/50 cursor-pointer group'
                        : 'bg-white border-emerald-300 hover:border-emerald-500 shadow-sm cursor-pointer group' 
                      : 'bg-white border-slate-200 hover:border-indigo-400 shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
                    : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed grayscale'
                }`}
              >
                {!isUnlocked ? (
                  <div className="flex flex-col items-center text-slate-400">
                    <Lock size={32} className="mb-2" />
                    <span className="font-bold text-sm">Locked</span>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm mb-3 group-hover:scale-110 transition-transform flex items-center justify-center font-black text-2xl ${
                      isPurple ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`font-black text-lg mb-2 ${isPurple ? 'text-purple-900' : isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                      Level {idx + 1}
                    </span>
                    {isCompleted && (
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart 
                            key={i} 
                            size={16} 
                            className={
                              i < (heartsEarned || 3) 
                                ? isPurple ? 'text-purple-500 fill-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'text-rose-500 fill-rose-500' 
                                : 'text-slate-200 fill-slate-100'
                            } 
                          />
                        ))}
                      </div>
                    )}
                    {!isCompleted && (
                      <div className="absolute inset-0 bg-indigo-500/90 rounded-[1.3rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={32} className="text-white fill-white" />
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // COURTROOM GAMEPLAY
  const currentCaseInLevel = caseInLevel + 1;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-12">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={returnToMenu} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
          <ChevronLeft size={20}/> Leave Level
        </button>

        <div className="flex items-center gap-6 bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Damage Flash Effect over Health Bar */}
          {damageFlash && <div className="absolute inset-0 bg-rose-500/20 animate-pulse"></div>}
          
          <div className="flex items-center gap-1.5 relative z-10">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mr-1">Level:</span>
            <span className="text-lg font-black text-indigo-600">{levelIndex + 1}</span>
          </div>

          <div className="h-4 w-px bg-slate-200 relative z-10"></div>
          
          <div className="flex items-center gap-1.5 relative z-10">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mr-1">Case:</span>
            <span className="text-lg font-black text-indigo-600">{currentCaseInLevel} / 5</span>
          </div>

          <div className="h-4 w-px bg-slate-200 relative z-10"></div>

          <div className="flex items-center gap-1.5 relative z-10">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mr-1">Health:</span>
            
            {/* Per-Heart Armored Shield Coverage */}
            <div className={`flex items-center gap-2.5 transition-transform ${damageFlash ? 'scale-125' : ''}`}>
              {Array.from({ length: 3 }).map((_, i) => {
                const maxCovered = equippedShield === 'shield_gold' ? 3 : equippedShield === 'shield_silver' ? 2 : equippedShield === 'shield_bronze' ? 1 : 0;
                const isHeartCovered = i < maxCovered;
                const isShieldActive = i < shieldBlocks;
                const isShattering = i === shatteringShieldIndex;
                const isHeartAlive = i < strikes;

                return (
                  <div key={i} className="relative flex items-center justify-center p-1.5">
                    {/* Metallic Armor Frame around Heart */}
                    {isHeartCovered && (
                      <div 
                        className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                          isShattering 
                            ? 'animate-ping border-4 border-amber-300 bg-amber-400/80 scale-150 opacity-0 z-30' 
                            : isShieldActive 
                              ? equippedShield === 'shield_gold'
                                ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-200/50 via-yellow-100/70 to-amber-300/50 shadow-[0_0_10px_rgba(245,158,11,0.6)] ring-2 ring-amber-300/60'
                                : equippedShield === 'shield_silver'
                                  ? 'border-2 border-slate-300 bg-gradient-to-br from-slate-200/50 via-white to-slate-300/50 shadow-sm ring-1 ring-slate-200'
                                  : 'border-2 border-amber-500/80 bg-amber-100/50 shadow-sm'
                              : 'border border-slate-200/60 bg-slate-100/20 opacity-30'
                        }`}
                      />
                    )}

                    {/* Armored Shield Crest Icon at top corner */}
                    {isHeartCovered && isShieldActive && !isShattering && (
                      <Shield 
                        size={13} 
                        className={`absolute -top-1 -right-1 z-20 transition-all ${
                          equippedShield === 'shield_gold' 
                            ? 'text-amber-700 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.8)] animate-pulse' 
                            : equippedShield === 'shield_silver'
                              ? 'text-slate-700 fill-slate-300 drop-shadow-[0_2px_4px_rgba(100,116,139,0.5)]'
                              : 'text-amber-800 fill-amber-500 drop-shadow'
                        }`} 
                      />
                    )}

                    {/* Heart Icon */}
                    <Heart 
                      size={22} 
                      className={`relative z-10 transition-all duration-300 ${
                        isHeartAlive 
                          ? 'text-rose-500 fill-rose-500 drop-shadow-[0_2px_4px_rgba(244,63,94,0.4)]' 
                          : 'text-slate-300 fill-slate-200 opacity-40 scale-90'
                      } ${damageFlash && i === strikes ? 'animate-ping opacity-0' : ''}`} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className={`relative bg-white rounded-[3rem] border-4 shadow-xl overflow-hidden p-10 transition-all duration-300 ${
        shake 
          ? 'animate-shake border-rose-500 shadow-rose-200 bg-rose-50/30' 
          : correctFlash 
            ? 'border-emerald-500 shadow-emerald-200 bg-emerald-50/40 ring-4 ring-emerald-300/50' 
            : 'border-slate-200'
      }`}>
        
        {/* Shield Absorb Mistake Floating Toast Banner */}
        {shieldAbsorbFlash && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white font-black px-6 py-2.5 rounded-full shadow-2xl border-2 border-yellow-200 flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300 text-sm whitespace-nowrap">
            <Shield size={20} className="text-yellow-100 fill-yellow-200 animate-bounce shrink-0" />
            <span>🛡️ SHIELD ABSORBED THE MISTAKE! (+1 Heart Saved)</span>
          </div>
        )}
        
        {/* The Dialogue Area (Always visible unless case cleared or lost) */}
        {gameState !== 'verdict_lost' && gameState !== 'verdict_won' && (
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-end gap-6 w-full max-w-2xl">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-indigo-50 border-4 border-indigo-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm mb-2">
                  <img src={currentCase.witnessImage} alt={currentCase.witnessName} className="w-full h-full object-cover" />
                </div>
                <span className="font-extrabold text-slate-700 text-lg text-center max-w-[120px] leading-tight">{currentCase.witnessName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase text-center max-w-[120px]">{currentCase.witnessTitle}</span>
              </div>
              
              <div className="flex-1 relative">
                {/* Speech Bubble Arrow */}
                <div className="absolute -left-4 bottom-10 w-0 h-0 border-t-[15px] border-t-transparent border-r-[20px] border-r-slate-100 border-b-[15px] border-b-transparent"></div>
                
                <div className={`rounded-3xl p-8 shadow-inner border transition-all relative ${correctFlash ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 scale-[1.02]' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                  <p className="text-2xl font-bold leading-relaxed">
                    "{displayedTestimony}"
                  </p>
                  {correctFlash && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-bounce">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE 1: JUDGMENT */}
        {gameState === 'judgment' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-slate-500 font-bold text-xl mb-6">
              {t('courtroom_examine_statement')}
            </p>
            <div className="flex gap-6">
              <button 
                onClick={() => handleJudgment('correct')}
                className="px-10 py-5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-2 border-emerald-300 font-black text-2xl rounded-2xl shadow-sm active:translate-y-1 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={28} /> {t('courtroom_statement_correct')}
              </button>
              <button 
                onClick={() => handleJudgment('wrong')}
                className="px-10 py-5 bg-rose-100 hover:bg-rose-200 text-rose-700 border-2 border-rose-300 font-black text-2xl rounded-2xl shadow-sm active:translate-y-1 transition-all flex items-center gap-2"
              >
                <XCircle size={28} /> {t('courtroom_statement_flawed')}
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: PRESENT EVIDENCE */}
        {gameState === 'present_evidence' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
                Identify the Correction
              </h3>
              <span className="text-sm font-bold text-slate-500">Select the correct version of the sentence:</span>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
              {(currentEvidenceOptions.length ? currentEvidenceOptions : currentCase.evidenceOptions).map((option, idx) => (
                <button
                  key={option.id}
                  onClick={() => handlePresentEvidence(option)}
                  className="p-6 rounded-3xl bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 text-left transition-all group shadow-sm flex items-start gap-5"
                >
                  <span className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>

                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-700 mb-2 group-hover:text-indigo-900 transition-colors">
                      "{option.text}"
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATE 3: VERDICT WON (LEVEL CLEARED) */}
        {gameState === 'verdict_won' && (() => {
          const heartsLeft = strikes + shieldBlocks;
          const baseStars = heartsLeft * 2;
          const starsWon = hasGavel ? baseStars * 2 : baseStars;
          const isPurple = heartsLeft > 3;

          return (
            <div className="animate-in zoom-in-95 duration-300 text-center py-6">
              <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full flex items-center justify-center mb-6 shadow-md ${
                isPurple 
                  ? 'bg-purple-100 border-4 border-purple-500 text-purple-600 animate-pulse shadow-[0_0_25px_rgba(168,85,247,0.5)]' 
                  : 'bg-emerald-100 border-4 border-emerald-400 text-emerald-500 animate-bounce shadow-sm'
              }`}>
                {isPurple ? <Star size={64} className="fill-purple-500 text-purple-600" /> : <CheckCircle2 size={64} />}
              </div>

              <h2 className={`text-4xl sm:text-5xl font-black mb-4 tracking-tight ${
                isPurple ? 'text-purple-600 drop-shadow-sm' : 'text-emerald-500'
              }`}>
                LEVEL {levelIndex + 1} CLEARED!
              </h2>

              {isPurple ? (
                <div className="flex flex-col items-center gap-2 mb-8">
                  <div className="inline-flex items-center gap-3 bg-purple-100 border-2 border-purple-300 px-6 py-3 rounded-full text-purple-700 font-black text-2xl shadow-md">
                    <Star size={32} className="fill-purple-500 text-purple-600 animate-bounce" />
                    <span>+{starsWon} Stars Earned!</span>
                  </div>
                  <span className="text-sm font-extrabold text-purple-500">
                    💜 PURPLE OVERCHARGE ({heartsLeft} Hearts Left)
                  </span>
                  {hasGavel && (
                    <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-bold">
                      ⚖️ 2x Gavel Bonus Applied
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-center gap-2 mb-4">
                     {Array.from({ length: 3 }).map((_, i) => (
                       <Heart 
                         key={i} 
                         size={48} 
                         className={i < strikes ? 'text-rose-500 fill-rose-500' : 'text-slate-300 fill-slate-200'} 
                       />
                     ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xl font-black text-amber-500 mb-8">
                    <Star size={24} className="fill-amber-500 text-amber-500" /> +{starsWon} Stars Earned! {hasGavel && <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">⚖️ 2x Gavel Bonus</span>}
                  </div>
                </>
              )}

              <button
                onClick={returnToMenu}
                className={`px-10 py-5 font-black text-2xl rounded-2xl shadow-md active:translate-y-1 transition-all inline-flex items-center gap-2 text-white ${
                  isPurple ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                Return to Level Select <ArrowRight size={24} />
              </button>
            </div>
          );
        })()}

        {/* STATE 4: VERDICT LOST */}
        {gameState === 'verdict_lost' && (
          <div className="animate-in zoom-in-95 duration-300 text-center py-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-rose-100 border-4 border-rose-500 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <XCircle size={64} />
            </div>

            <h2 className="text-4xl font-black text-rose-500 mb-2 tracking-tight">
              OUT OF HEALTH!
            </h2>
            <p className="text-xl font-bold text-slate-500 mb-8">
              You made too many mistakes and failed Level {levelIndex + 1}.
            </p>

            <button
              onClick={() => startLevel(levelIndex)}
              className="px-10 py-5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xl rounded-2xl shadow-md active:translate-y-1 transition-all mr-4 inline-flex items-center gap-2"
            >
              <RotateCcw size={20} /> Retry Level
            </button>
            <button
              onClick={returnToMenu}
              className="px-10 py-5 bg-white text-slate-700 font-black text-xl rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 active:translate-y-1 transition-all"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
