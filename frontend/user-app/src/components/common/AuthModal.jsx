import React, { useRef, useState } from 'react';
import { UserCircle, Lock, LoaderCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AuthModal = () => {
  const { t, setUser } = useAppContext();
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const changeMode = mode => {
    if (submitting.current) return;
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setError('');
    if (name.trim().length < 2 || name.trim().length > 40 || [...name.trim()].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
      setError(t('auth_invalid_name'));
      return;
    }
    if (authMode === 'signup' && password.length < 8) {
      setError(t('auth_short_password'));
      return;
    }
    
    // Helper: save user to both state AND localStorage in one shot
    const loginAs = (userData, token) => {
      localStorage.removeItem('isGuest');
      localStorage.setItem('token', token);
      localStorage.setItem('savedUserData', JSON.stringify(userData));
      setUser(userData);
    };

    submitting.current = true;
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name.trim(), pin: password, isSignup: authMode === 'signup' }),
        signal: controller.signal
      });
      const data = await response.json();
      
      if (response.ok && data?.success && typeof data.token === 'string' && data.token.length > 0 && typeof data.user?.username === 'string') {
        const userData = { 
          ...data.user, 
          name: data.user.username, 
          isGuest: false,
          role: ['admin', 'teacher'].includes(data.user.role) ? data.user.role : 'student',
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
        setError(data?.code === 'AUTH_UNAVAILABLE' ? t('auth_unavailable') : data?.error || t('auth_connection_error'));
      }
    } catch (err) {
      setError(t('auth_connection_error'));
    } finally {
      clearTimeout(timeout);
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGuestEntry = () => {
    if (submitting.current) return;
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
    <main aria-labelledby="auth-title" className="fixed inset-0 bg-transparent z-[80] flex items-center justify-center overflow-y-auto p-4 text-slate-800">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-xl shadow-slate-200/50 animate-in zoom-in-95 relative border border-white">
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button disabled={isSubmitting} aria-pressed={authMode === 'login'} onClick={() => changeMode('login')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-wait focus-visible:outline-indigo-600 ${authMode === 'login' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{t('tab_login')}</button>
          <button disabled={isSubmitting} aria-pressed={authMode === 'signup'} onClick={() => changeMode('signup')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-wait focus-visible:outline-indigo-600 ${authMode === 'signup' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{t('tab_signup')}</button>
        </div>

        <h2 id="auth-title" className="text-3xl font-extrabold text-center text-slate-800 mb-8 tracking-tight">
          {authMode === 'login' ? t('login_title') : t('signup_title')}
        </h2>
        
        <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-4">
          <div className="relative">
            <UserCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" aria-label={t('login_name')} disabled={isSubmitting} maxLength={40} autoCapitalize="none" spellCheck={false} autoComplete="username" value={name} onChange={e=>{setName(e.target.value);setError('');}} required placeholder={t('login_name')} className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-slate-200 rounded-2xl font-bold focus:border-indigo-400 focus:outline-none transition-colors" />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="password" aria-label={t('login_pass')} disabled={isSubmitting} maxLength={128} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e=>{setPassword(e.target.value);setError('');}} required placeholder={t('login_pass')} className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-slate-200 rounded-2xl font-bold transition-colors tracking-widest focus:outline-none focus:border-indigo-400" />
          </div>

          {error && <p role="alert" className="text-rose-600 text-sm font-bold text-center leading-relaxed">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 transition-all mt-4 active:scale-95 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-indigo-600 focus-visible:outline-offset-4">
            {isSubmitting && <LoaderCircle aria-hidden="true" size={20} className="shrink-0 animate-spin motion-reduce:animate-none" />}
            <span role={isSubmitting ? 'status' : undefined}>{isSubmitting ? t(authMode === 'login' ? 'auth_logging_in' : 'auth_creating') : t(authMode === 'login' ? 'btn_login' : 'btn_signup')}</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-6">
          <button disabled={isSubmitting} onClick={handleGuestEntry} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:cursor-wait focus-visible:outline-indigo-600">
            {t('auth_guest')} &rarr;
          </button>
        </div>
      </div>
    </main>
  );
};
