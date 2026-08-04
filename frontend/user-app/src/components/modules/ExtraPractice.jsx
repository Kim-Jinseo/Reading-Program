import React, { useState } from 'react';
import { Sparkles, Brain, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ScoreScreen } from '../common/ScoreScreen';

export const ExtraPractice = () => {
  const { grade, setView, handleEarnStars, calculateStars } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState('menu');

  const generatePractice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ grade })
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Map data to quiz
        const newQuiz = data.data.map(item => {
          return {
            id: item.id,
            prompt: item.word,
            answer: item.answer,
            options: item.options.sort(() => Math.random() - 0.5)
          };
        });
        setQuizData(newQuiz);
        setScore(0);
        setIdx(0);
        setMode('quiz');
      } else {
        alert("Failed to generate practice: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error contacting AI server.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'menu') {
    return (
      <div className="max-w-3xl mx-auto pt-16 text-center">
        <div className="mb-10"></div>
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-6 tracking-tight">Infinite Extra Practice</h2>
        <p className="text-lg text-slate-500 font-medium mb-10 max-w-xl mx-auto">
          Our AI teacher will instantly generate brand new, never-before-seen vocabulary words matching your exact grade level! You can practice as much as you want.
        </p>
        <button 
          onClick={generatePractice} 
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xl font-extrabold px-10 py-5 rounded-[2rem] shadow-[0_6px_0_rgb(234,88,12)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
        >
          {loading ? <Loader2 size={28} className="animate-spin" /> : <Brain size={28} />}
          {loading ? "Generating..." : "Generate New Practice Quiz"}
        </button>
      </div>
    );
  }

  if (mode === 'quiz') {
    const q = quizData[idx];
    const handleAnswer = (ans) => {
      const isCorrect = ans === q.answer;
      const finalScore = score + (isCorrect ? 1 : 0);
      if (isCorrect) setScore(finalScore);

      if (idx < quizData.length - 1) {
        setIdx(i => i + 1);
      } else {
        const earnedStars = calculateStars(finalScore, quizData.length);
        handleEarnStars(earnedStars, 'extra', 'infinite_quiz');
        setMode('done');
      }
    };

    return (
      <div className="max-w-xl mx-auto pt-16">
        <p className="text-center text-slate-400 font-bold mb-4 uppercase tracking-widest text-sm">New Word {idx + 1} of {quizData.length}</p>
        <h2 className="text-center text-5xl font-extrabold text-slate-800 mb-10 tracking-tight leading-relaxed">{q.prompt}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-orange-400 hover:bg-orange-50 text-lg font-bold text-slate-700 transition-all text-center shadow-sm active:scale-95 leading-relaxed min-h-[120px] flex items-center justify-center">
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'done') {
    return <ScoreScreen stars={calculateStars(score, quizData.length)} customMessage="Great practice! Want to generate even more words?" onRetry={generatePractice} onContinue={() => setView('dashboard')} />;
  }

  return null;
};
