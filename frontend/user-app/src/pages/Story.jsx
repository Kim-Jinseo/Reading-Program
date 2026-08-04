import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2 } from 'lucide-react';

export default function Story() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then(res => res.json())
      .then(json => { if (json.success) setStory(json.data); });
  }, [id]);

  if (!story) return <div className="p-10 text-center font-bold text-slate-500">Loading story...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 pt-12 min-h-screen flex flex-col">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">{story.title}</h1>
      
      <div className="flex-1 space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        {story.content.map((line, idx) => (
          <div key={idx} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-slate-200 relative">
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full shadow-md"><Volume2 size={20}/></button>
            <p className="text-2xl font-bold text-slate-800 mb-2 pl-6">{line.sentence}</p>
            <p className="text-lg font-medium text-slate-500 pl-6">{line.translation}</p>
          </div>
        ))}
      </div>

      <button onClick={() => navigate(`/practice/${id}`)} className="mt-8 bg-sky-500 text-white font-extrabold text-xl py-5 rounded-2xl shadow-lg hover:bg-sky-600 transition-all flex items-center justify-center gap-3 active:scale-95">
        Next: Grammar Practice <ArrowRight />
      </button>
    </div>
  );
}