import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then(res => res.json())
      .then(json => { if (json.success) setExercise(json.data.grammarExercise); });
  }, [id]);

  const handleEvaluate = () => {
    if (selected === exercise.correctAnswer) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  if (!exercise) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 pt-20 flex flex-col items-center">
      <div className="bg-white w-full p-10 rounded-3xl shadow-md border border-slate-200 text-center">
        <p className="text-sky-500 font-extrabold uppercase tracking-widest mb-4">Grammar Check</p>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-10 leading-relaxed">{exercise.sentence}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {exercise.options.map(opt => (
            <button key={opt} onClick={() => {setSelected(opt); setFeedback(null);}} className={`p-4 rounded-2xl text-xl font-bold border-2 transition-all ${selected === opt ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-200 text-slate-600 hover:border-sky-300'}`}>
              {opt}
            </button>
          ))}
        </div>

        {feedback === 'correct' ? (
          <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 animate-in zoom-in"><CheckCircle2/> Correct!</div>
        ) : feedback === 'incorrect' ? (
          <div className="p-4 bg-rose-100 text-rose-700 rounded-2xl font-bold animate-in zoom-in">Try again!</div>
        ) : (
          <button onClick={handleEvaluate} disabled={!selected} className="w-full bg-slate-900 text-white font-extrabold text-xl py-4 rounded-2xl disabled:opacity-50 transition-all">Check Answer</button>
        )}
      </div>

      {feedback === 'correct' && (
        <button onClick={() => navigate(`/pronunciation/${id}`)} className="mt-8 w-full bg-sky-500 text-white font-extrabold text-xl py-5 rounded-2xl shadow-lg hover:bg-sky-600 transition-all flex items-center justify-center gap-3 animate-in fade-in">
          Next: Pronunciation <ArrowRight />
        </button>
      )}
    </div>
  );
}