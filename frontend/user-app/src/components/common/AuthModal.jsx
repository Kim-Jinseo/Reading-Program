import React, { useState } from 'react';
import { UserCircle, Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AuthModal = () => {
  const { t, setUser } = useAppContext();
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (authMode === 'signup' && password.length < 8) {
      setError("New passwords must be at least 8 characters.");
      return;
    }
    
    // Helper: save user to both state AND localStorage in one shot
    const loginAs = (userData, token) => {
      localStorage.removeItem('isGuest');
      localStorage.setItem('token', token);
      localStorage.setItem('savedUserData', JSON.stringify(userData));
      setUser(userData);
    };

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, pin: password, isSignup: authMode === 'signup' })
      });
      const data = await response.json();
      
      if (data.success) {
        const userData = { 
          ...data.user, 
          name: data.user.username, 
          isGuest: false,
          role: data.user.role === 'admin' ? 'admin' : 'student',
          inventory: data.user.inventory || [],
          unlockedChars: data.user.unlockedChars || [],
          unlockedPets: data.user.unlockedPets || [],
          clearedVoiceStages: data.user.clearedVoiceStages || {},
          masteredVocab: data.user.masteredVocab || [],
          completedGrammar: data.user.completedGrammar || [],
          completedWriting: data.user.completedWriting || [],
          completedSpeaking: data.user.completedSpeaking || [],
          completedReading: data.user.completedReading || [],
          stats: data.user.stats || { vocab: 0, grammar: 0, writing: 0, speaking: 0, reading: 0 },
          starsTracker: data.user.starsTracker || {},
          essays: data.user.essays || {},
          stars: data.user.stars || 0,
          trophies: data.user.trophies || data.user.stars || 0,
        };
        loginAs(userData, data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Try continuing as guest.");
    }
  };

  const handleGuestEntry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('savedUserData');
    localStorage.removeItem('voiceBattleCleared');
    localStorage.setItem('isGuest', 'true');
    setUser({ 
      name: 'Guest Student', 
      stars: 0, 
      isGuest: true,
      role: 'student',
      masteredVocab: [],
      completedGrammar: [],
      completedWriting: [],
      completedSpeaking: [],
      completedReading: [],
      clearedVoiceStages: [],
      stats: { vocab: 0, grammar: 0, writing: 0, speaking: 0, reading: 0 },
      starsTracker: {},
      essays: {}
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl animate-in zoom-in-95 relative border border-slate-100">
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{t('tab_login')}</button>
          <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${authMode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{t('tab_signup')}</button>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-8 tracking-tight">
          {authMode === 'login' ? t('login_title') : t('signup_title')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" autoComplete="username" value={name} onChange={e=>setName(e.target.value)} required placeholder={t('login_name')} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold focus:border-indigo-400 focus:outline-none transition-colors" />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder={t('login_pass')} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold transition-colors tracking-widest focus:outline-none focus:border-indigo-400" />
          </div>

          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all mt-4 active:scale-95">
            {authMode === 'login' ? t('btn_login') : t('btn_signup')}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-6">
          <button onClick={handleGuestEntry} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Continue as {t('guest')} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
