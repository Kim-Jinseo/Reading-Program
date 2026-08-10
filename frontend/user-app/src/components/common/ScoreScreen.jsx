import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ScoreScreen = ({ stars, onRetry, onContinue, customMessage }) => {
  const { t } = useAppContext();
  
  // Phase 1: Stars start gray
  // Phase 2: Gold stars land one by one (left, middle, right)
  // Phase 3: If masterpiece, gold stars transform to purple
  const [revealedCount, setRevealedCount] = useState(0);
  const [isPurplePhase, setIsPurplePhase] = useState(false);

  const displayStars = Math.min(stars, 3); // Cap visual at 3
  const isMasterpiece = stars >= 4;

  useEffect(() => {
    // Reset on mount
    setRevealedCount(0);
    setIsPurplePhase(false);

    // Stagger reveal: star 1 at 400ms, star 2 at 800ms, star 3 at 1200ms
    const timers = [];
    for (let i = 1; i <= displayStars; i++) {
      timers.push(setTimeout(() => setRevealedCount(i), i * 400));
    }

    // If masterpiece: after all 3 gold stars are shown, transform to purple
    if (isMasterpiece) {
      timers.push(setTimeout(() => setIsPurplePhase(true), displayStars * 400 + 600));
    }

    return () => timers.forEach(clearTimeout);
  }, [stars, displayStars, isMasterpiece]);

  const getStarStyle = (starNum) => {
    const isRevealed = starNum <= revealedCount;
    
    if (!isRevealed) {
      // Gray empty star
      return {
        className: 'text-slate-200 fill-slate-100 transition-all duration-500',
        size: 64,
      };
    }

    if (isPurplePhase) {
      // Purple masterpiece star — steady glow, no blinking
      return {
        className: 'text-purple-500 fill-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-all duration-700 scale-110',
        size: 72,
      };
    }

    // Gold active star
    return {
      className: 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] transition-all duration-500 scale-105',
      size: 64,
    };
  };

  return (
    <div className="bg-white p-10 rounded-[2rem] shadow-lg border border-slate-100 text-center max-w-md mx-auto animate-in zoom-in-95 mt-10">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">{t('score_title')}</h2>
      
      <div className="flex justify-center gap-5 mb-4 items-center" style={{ minHeight: '90px' }}>
        {[1, 2, 3].map((starNum) => {
          const { className, size } = getStarStyle(starNum);
          const isRevealed = starNum <= revealedCount;
          
          return (
            <div 
              key={starNum}
              className={`transition-all duration-500 ease-out ${isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-60 translate-y-0 scale-100'}`}
              style={{
                animation: isRevealed && starNum === revealedCount ? 'starBounce 0.5s ease-out' : 'none',
              }}
            >
              <Star size={size} className={className} />
            </div>
          );
        })}
      </div>
      
      {/* Prominent Star Earnings Badge */}
      {(() => {
        const actualStars = stars || 0;
        return (
          <div className={`inline-flex items-center gap-2 border-2 px-6 py-2 rounded-full font-black text-lg shadow-md mb-6 transition-all duration-500 ${
            isPurplePhase 
              ? 'bg-gradient-to-r from-purple-100 via-fuchsia-100 to-indigo-100 border-purple-300 text-purple-900 shadow-purple-200/50' 
              : 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-amber-300 text-amber-900 shadow-amber-200/50'
          }`}>
            <span>⭐ You earned {actualStars} Star{actualStars === 1 ? '' : 's'}! ⭐</span>
          </div>
        );
      })()}

      <p className={`font-bold mb-8 text-lg transition-all duration-500 ${isPurplePhase ? 'text-purple-600' : 'text-slate-500'}`}>
        {customMessage || (isPurplePhase ? "⭐ ABSOLUTE MASTERPIECE! ⭐" : stars >= 3 ? "Perfect! Excellent work." : stars >= 2 ? "Good job! Keep practicing." : "Let's try that again!")}
      </p>
      
      <div className="flex gap-4">
        {onRetry && (
          <button onClick={onRetry} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">
            {t('btn_retry')}
          </button>
        )}
        <button onClick={onContinue} className={`flex-1 py-4 font-bold rounded-2xl active:shadow-none active:translate-y-1 transition-all ${isPurplePhase ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_4px_0_rgb(126,34,206)]' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_0_rgb(217,119,6)]'}`}>
          {t('btn_continue')}
        </button>
      </div>

      {/* Keyframe for the bounce landing animation */}
      <style>{`
        @keyframes starBounce {
          0% { transform: translateY(-30px) scale(0.3); opacity: 0; }
          50% { transform: translateY(4px) scale(1.15); opacity: 1; }
          70% { transform: translateY(-3px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
