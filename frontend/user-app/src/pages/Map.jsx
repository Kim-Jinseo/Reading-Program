import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Map as MapIcon } from 'lucide-react';

export default function Map({ user }) {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || ''}/api/stories`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setStories(json.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 pt-12">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xl">{user.username.charAt(0)}</div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{user.username}'s Journey</h2>
            <p className="text-sm font-bold text-amber-500 flex items-center gap-1"><Star size={16} fill="currentColor"/> {user.stars} Stars</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((story, idx) => (
          <div key={story._id} onClick={() => navigate(`/story/${story._id}`)} className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer group flex items-center gap-6">
            <div className="w-20 h-20 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 font-extrabold text-3xl group-hover:scale-110 transition-transform">
              {idx + 1}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Level {story.difficulty}</p>
              <h3 className="text-xl font-extrabold text-slate-800">{story.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}