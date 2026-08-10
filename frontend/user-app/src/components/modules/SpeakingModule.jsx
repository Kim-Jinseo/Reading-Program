import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Mic, CheckCircle2, ChevronLeft, Volume2, Sparkles, Star, Gamepad2, Zap, Layers, Square, Loader2 } from 'lucide-react';
import { VoiceJump } from './speaking/VoiceJump';

import { useAppContext } from '../../context/AppContext';
import { getDailyItem } from '../../utils/dailySelection';
import { ScoreScreen } from '../common/ScoreScreen';
import Pagination from '../common/Pagination';

export const SpeakingModule = () => {
  const { t, curriculumDb, grade, user, handleEarnStars, updateCompletion, markDailyComplete, getDailyStatus } = useAppContext();
  const dailyStatus = getDailyStatus('speaking');
  
  const allData = useMemo(() => curriculumDb?.[grade]?.speaking || [], [curriculumDb, grade]);
  const activeData = useMemo(() => allData.filter(d => !user.completedSpeaking?.includes(d.id)), [allData, user.completedSpeaking]);
  const completedData = useMemo(() => allData.filter(d => user.completedSpeaking?.includes(d.id)).sort((a,b) => (user.starsTracker?.[a.id] || 0) - (user.starsTracker?.[b.id] || 0)), [allData, user.completedSpeaking, user.starsTracker]);

  const [prompt, setPrompt] = useState(null);
  const [mode, setMode] = useState('menu');
  const [isDaily, setIsDaily] = useState(false);
  const [activeTab, setActiveTab] = useState('learn');
  const [menuView, setMenuView] = useState('boxes'); // 'boxes', 'list'
  const [filterResult, setFilterResult] = useState('uncompleted'); // 'uncompleted', 'completed'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const currentList = filterResult === 'uncompleted' ? activeData : completedData;
  const paginatedList = currentList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const [isRecording, setIsRecording] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [status, setStatus] = useState('ready'); 
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const cancelSubmissionRef = useRef(false);
  const maxRecordingTimerRef = useRef(null);
  
  // Volume Meter Refs
  const [micVolume, setMicVolume] = useState(0);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafIdRef = useRef(null);
  const micStreamRef = useRef(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let interval;
    if (status === 'loading') {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    } else {
      setDots('');
    }
    return () => clearInterval(interval);
  }, [status]);

  const stopMeter = () => {
     if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
     // DO NOT stop the hardware micStreamRef here, we cache it to prevent Android/WeChat permanent locks!
     if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch(e){}
     }
     rafIdRef.current = null;
     audioCtxRef.current = null;
     setMicVolume(0);
  };
  
  // Actually completely terminate the microphone hardware on unmount
  useEffect(() => {
    return () => {
      stopMeter();
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  // Auto-start microphone when entering speaking practice mode; auto-close when leaving or on feedback
  useEffect(() => {
    let timerId;
    if (mode === 'speak' && prompt && status === 'ready') {
      // Auto-start disabled per user request
    } else if (mode !== 'speak' || status === 'feedback') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      setIsRecording(false);
      stopMeter();
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, prompt, status]);

  // Unmount safety cleanup
  useEffect(() => {
    return () => {

      stopMeter();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === 'menu') {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10">
          <div className="w-24">
            {menuView === 'list' && activeTab === 'learn' && (
              <button onClick={() => setMenuView('boxes')} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
            )}
          </div>
          
          {menuView === 'list' && activeTab === 'learn' ? (
            <div className="flex gap-2 bg-slate-100/80 backdrop-blur-md rounded-full p-1 shadow-inner border border-slate-200/50">
              <button 
                onClick={() => { setFilterResult('uncompleted'); setPage(1); }} 
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'uncompleted' ? 'bg-white text-rose-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Prompts
              </button>
              <button 
                onClick={() => { setFilterResult('completed'); setPage(1); }} 
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${filterResult === 'completed' ? 'bg-white text-rose-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Completed
              </button>
            </div>
          ) : (
            <div className="flex gap-2 bg-slate-100/80 backdrop-blur-md rounded-full p-1.5 shadow-inner border border-slate-200/50">
              <button 
                onClick={() => { setActiveTab('learn'); setMenuView('boxes'); }} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${activeTab === 'learn' ? 'bg-white text-rose-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
              >
              >
                <Layers size={18}/> {t('tab_learn')}
              </button>
              <button 
                onClick={() => setMode('voice_jump')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:scale-105`}
              >
                <Gamepad2 size={18}/> {t('tab_voice_battle_mode')}
              </button>
            </div>
          )}
          
          <div className="w-24"></div>
        </div>

        {activeTab === 'learn' && menuView === 'boxes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Daily Speaking Card */}
            <div className={`p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center transition-all group h-full ${
              (dailyStatus.isComplete && dailyStatus.bestStars === 3) 
                ? 'border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 shadow-rose-100/60' 
                : dailyStatus.isComplete 
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 shadow-amber-100' 
                  : 'border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 shadow-rose-100/60 hover:shadow-rose-200/80 hover:border-rose-300'
            }`}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 rounded-[2rem] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 ${
                (dailyStatus.isComplete && dailyStatus.bestStars === 3) ? 'bg-rose-500 text-white shadow-rose-200' : dailyStatus.isComplete ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-200'
              }`}>
                {(dailyStatus.isComplete && dailyStatus.bestStars === 3) ? <CheckCircle2 size={48} /> : <Mic size={48} />}
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 mb-3">
                {t('daily_speaking_goal')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('daily_speaking_title')}</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('daily_speaking_desc')}</p>
              <button 
                onClick={() => {
                  const promptItem = getDailyItem(allData, activeData, dailyStatus.itemId);
                  if (promptItem) { setIsDaily(true); setPrompt(promptItem); setMode('speak'); setStatus('ready'); setFeedback(null); }
                }} 
                disabled={dailyStatus.isComplete && dailyStatus.bestStars === 3}
                className={`w-full py-4 font-black text-xl rounded-2xl transition-all mt-auto ${
                  (dailyStatus.isComplete && dailyStatus.bestStars === 3)
                    ? 'bg-rose-500 text-white shadow-none translate-y-1 cursor-not-allowed opacity-90'
                    : dailyStatus.isComplete
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_6px_0_rgba(245,158,11,1)] active:translate-y-1 active:shadow-none'
                      : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-[0_6px_0_rgb(244,63,94)] active:shadow-none active:translate-y-1'
                }`}
              >
                {dailyStatus.isComplete ? (dailyStatus.bestStars === 3 ? t('completed_today') : t('btn_keep_practicing')) : t('btn_start_launch')}
              </button>
            </div>

            {/* Keep Practicing Card */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col items-center text-center group hover:border-slate-300 transition-all h-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-md shadow-slate-300 transition-transform group-hover:scale-105">
                <Sparkles size={48} />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
                {t('full_curriculum')}
              </span>
              <h3 className="text-3xl font-black text-slate-800 mb-3">{t('keep_practicing_speaking_title')}</h3>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-sm">{t('keep_practicing_speaking_desc')}</p>
              <button 
                onClick={() => setMenuView('list')} 
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(15,23,42)] active:shadow-none active:translate-y-1 transition-all mt-auto"
              >
                {t('btn_browse_all')}
              </button>
            </div>
          </div>
        )}
        


        {activeTab === 'learn' && menuView === 'list' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            
            {currentList.length === 0 ? (
              filterResult === 'uncompleted' ? (
                <div className="text-center p-12 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 rounded-[2.5rem] border-2 border-rose-200 shadow-lg my-6 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-md shadow-rose-200">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-2">🎉 You have finished all Speaking content!</h3>
                  <p className="text-slate-600 font-bold text-lg max-w-md mx-auto mb-6">
                    You have practiced all speaking challenges for Grade {grade}! Excellent fluency!
                  </p>
                  <button 
                    onClick={() => { setFilterResult('completed'); setPage(1); }}
                    className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Review Completed Speaking
                  </button>
                </div>
              ) : (
                <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-slate-400 font-bold mb-10">
                  No completed speaking yet!
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {paginatedList.map((promptItem) => {
              const isCompleted = filterResult === 'completed';
              const starsEarned = user.starsTracker?.[promptItem.id] || 0;
              
              const getCardStyle = (stars) => {
                if (!isCompleted) return {
                  bg: 'bg-white hover:bg-rose-50/50',
                  border: 'border-slate-100 hover:border-rose-400 hover:shadow-rose-100',
                  text: 'text-slate-800',
                  icon: 'bg-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
                  starFill: 'hidden'
                };
                if (stars >= 5) return {
                  bg: 'bg-gradient-to-br from-purple-50 via-white to-purple-50',
                  border: 'border-purple-300 shadow-purple-100 hover:border-purple-500 hover:shadow-purple-200',
                  text: 'text-purple-700 group-hover:text-purple-900',
                  icon: 'text-purple-400',
                  starFill: 'text-purple-400 fill-purple-400'
                };
                if (stars === 3) return {
                  bg: 'bg-gradient-to-br from-amber-50 via-white to-amber-50',
                  border: 'border-amber-400 shadow-amber-100 hover:border-amber-500 hover:shadow-amber-200',
                  text: 'text-amber-800 group-hover:text-amber-900',
                  icon: 'text-amber-400',
                  starFill: 'text-amber-400 fill-amber-400'
                };
                if (stars === 2) return {
                  bg: 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50',
                  border: 'border-yellow-300 shadow-yellow-50 hover:border-yellow-400 hover:shadow-yellow-100',
                  text: 'text-yellow-700 group-hover:text-yellow-800',
                  icon: 'text-yellow-400',
                  starFill: 'text-yellow-400 fill-yellow-400'
                };
                if (stars === 1) return {
                  bg: 'bg-white',
                  border: 'border-yellow-200 shadow-sm hover:border-yellow-300 hover:shadow-md',
                  text: 'text-yellow-600 group-hover:text-yellow-700',
                  icon: 'text-yellow-400',
                  starFill: 'text-yellow-400 fill-yellow-400'
                };
                return {
                  bg: 'bg-slate-50 grayscale-[0.5]',
                  border: 'border-slate-200 shadow-none hover:border-slate-300 hover:bg-slate-100',
                  text: 'text-slate-500 group-hover:text-slate-700',
                  icon: 'text-slate-300',
                  starFill: 'text-slate-300 fill-slate-300'
                };
              };

              const style = getCardStyle(starsEarned);
              const displayStars = isCompleted ? Math.min(starsEarned, 3) : 0;

              return (
                <div 
                  key={promptItem.id}
                  onClick={() => { setIsDaily(false); setPrompt(promptItem); setMode('speak'); setStatus('ready'); setFeedback(null); }}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center group ${style.bg} ${style.border}`}
                >
                  <div className="flex-1">
                    <h3 className={`text-lg font-extrabold line-clamp-2 mb-2 ${style.text}`}>{promptItem.en}</h3>
                    {!isCompleted && <p className="text-slate-500 font-medium text-sm line-clamp-1">{promptItem.zh}</p>}
                  </div>
                  
                  {isCompleted ? (
                    <div className="flex justify-end items-center mt-auto shrink-0 ml-4">
                      {displayStars > 0 && (
                        <div className="flex gap-0.5 mr-2">
                          {Array.from({length: displayStars}).map((_, i) => (
                            <Star key={i} size={14} className={style.starFill} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end items-center shrink-0 ml-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${style.icon}`}>
                         <Mic size={20} />
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    );
  }

  if (mode === 'voice_jump') return <VoiceJump onBack={() => setMode('menu')} />;

  const handlePlayAudio = () => {
    try {
      const text = encodeURIComponent(prompt.en);
      const token = localStorage.getItem('token');
      const timestamp = Date.now();
      const audioUrl = `/api/audio/tts?text=${text}&token=${token}&t=${timestamp}`;
      
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.error("Error playing audio:", e);
    }
  };


  const handleAudioSubmit = async (blob, ext = 'webm') => {
    try {
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = reader.result.split(',')[1];
          resolve(b64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const audioMimeType = blob.type || `audio/${ext}`;
      const authHeader = `Bearer ${localStorage.getItem('token')}`;

      const res = await fetch('/api/audio/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: audioMimeType,
          targetSentence: prompt.en,
          grade: grade || '3rd Grade',
        }),
      });
      const data = await res.json();
      
      setIsRecording(false);
      setStatus('ready');

      if (data.success) {
        const earnedStars = data.score;
        handleEarnStars(earnedStars, 'speaking', prompt.id);
        updateCompletion('completedSpeaking', prompt.id);
        if (isDaily) markDailyComplete('speaking', earnedStars, prompt.id);
        
        if (earnedStars === 3) {
          setFeedback({
            stars: earnedStars,
            text: `Perfect! You pronounced it beautifully.`
          });
        } else if (earnedStars > 0) {
          const phon = prompt.enPhonetic || prompt.en;
          const phonMsg = (prompt.enPhonetic && prompt.enPhonetic !== prompt.en) ? ` Hint: "${phon}".` : '';
          setFeedback({
            stars: earnedStars,
            text: `Good try! But maybe focus on saying "${prompt.en}" clearly.${phonMsg}`
          });
        } else {
          setFeedback({ stars: 0, text: data.feedback || "Missed! Try to speak clearer!" });
        }
      } else {
        setFeedback({ stars: 0, text: data.error || "Didn't hear you clearly. Try again!" });
      }
      setStatus('feedback');
    } catch (err) {
      console.error('[SpeakingModule] submit error:', err);
      setStatus('ready');
      setFeedback({ stars: 0, text: 'Network error.' });
      setIsRecording(false);
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      if (isWarmingUp) {
         cancelSubmissionRef.current = true; // Block spam clicks
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
         mediaRecorderRef.current.stop();
         if (!isWarmingUp) {
           setStatus('loading');
         }
      }
      setIsRecording(false);
      setIsWarmingUp(false);
      stopMeter();
      if (maxRecordingTimerRef.current) clearTimeout(maxRecordingTimerRef.current);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio hardware or secure HTTPS context not found on this device.");
      }
      
      let stream = micStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        micStreamRef.current = stream;
      }
      
      let options = { audioBitsPerSecond: 16000 };
      let ext = 'webm';
      
      if (typeof window.MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) options.mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) { options.mimeType = 'audio/mp4'; ext = 'mp4'; }
        else if (MediaRecorder.isTypeSupported('audio/aac')) { options.mimeType = 'audio/aac'; ext = 'aac'; }
      }
      
      if (typeof window.MediaRecorder === 'undefined') {
         throw new Error("Your browser is too old and does not support audio recording.");
      }
      
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (cancelSubmissionRef.current) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        handleAudioSubmit(audioBlob, ext);
      };

      cancelSubmissionRef.current = false;
      recorder.start();
      setIsRecording(true);
      setIsWarmingUp(true);
      setStatus('ready');
      setFeedback(null); // Clear previous feedback

      setTimeout(() => {
        setIsWarmingUp(false);
      }, 500);

      if (maxRecordingTimerRef.current) clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = setTimeout(() => {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            cancelSubmissionRef.current = true;
            mediaRecorderRef.current.stop();
            setStatus('ready');
            setIsRecording(false);
            setIsWarmingUp(false);
            setFeedback({ stars: 0, text: "Recording stopped (Max 12s limit reached)." });
            stopMeter();
         }
      }, 12000);
    } catch (err) {
      console.error("Mic start failed", err);
      setIsRecording(false);
      setFeedback({ stars: 0, text: "Microphone access denied." });
      return;
    }

    // Live Volume Meter setup
    (async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           console.warn("Audio hardware not supported on this device.");
           return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        micStreamRef.current = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          let maxDeviation = 0;
          for(let i = 0; i < bufferLength; i++) {
            const deviation = Math.abs(dataArray[i] - 128);
            if (deviation > maxDeviation) maxDeviation = deviation;
          }
          
          const volume = Math.min(100, Math.floor(maxDeviation * 15));
          setMicVolume(volume);
          rafIdRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (e) {
         console.error("Volume meter failed", e);
      }
    })();
  };

  if (status === 'feedback' && feedback) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <ScoreScreen stars={feedback.stars} onRetry={() => {setStatus('ready');}} onContinue={() => setMode('menu')} />
        <div className="mt-8 bg-rose-50 border border-rose-200 p-6 rounded-2xl animate-in fade-in">
          <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-2"><Sparkles size={18}/> {t('feedback_ai')}</h3>
          <p className="text-rose-700 leading-relaxed font-medium">{feedback.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-6 flex flex-col items-center flex-1">
      <div className="flex justify-between items-center w-full mb-12">
        <button onClick={() => setMode('menu')} className="text-slate-400 hover:text-slate-700 flex items-center gap-2 font-bold"><ChevronLeft size={20}/> Back</button>
      </div>
      
      <div className="bg-white border-2 border-rose-100 p-12 rounded-[3rem] shadow-xl w-full text-center mb-12 relative">
        <button 
          onClick={handlePlayAudio} 
          className="mx-auto text-rose-300 hover:text-rose-500 transition-colors mb-6 block focus:outline-none hover:scale-110 active:scale-95"
          title="Listen to native pronunciation"
        >
          <Volume2 size={48} className="mx-auto" />
        </button>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-6 leading-relaxed">{prompt.en}</h2>
        <p className="text-slate-500 font-bold text-xl">{prompt.zh}</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[350px]">
        {status === 'loading' ? (
          <div className="text-rose-500 font-bold animate-pulse text-2xl">{t('loading').replace(/\.+$/, '')}{dots}</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`h-8 mb-4 transition-opacity duration-300`}>
              {isRecording ? (
                <div className={`text-rose-500 font-bold text-xl flex items-center gap-2 ${isWarmingUp ? '' : 'animate-pulse'}`}>
                  <Zap size={20} className="fill-rose-500 text-rose-500" /> {isWarmingUp ? "Getting ready..." : "Listening... Click mic to submit!"}
                </div>
              ) : (
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2">
                  Click the mic to start
                </div>
              )}
            </div>
            
            {/* Mic Button */}
            <div className="relative flex items-center justify-center w-48 h-48 mb-6">
              {isRecording && !isWarmingUp && (
                <>
                  <div 
                    className="absolute inset-0 bg-rose-400 rounded-full opacity-30 transition-all duration-75 blur-md"
                    style={{ transform: `scale(${1 + (micVolume / 100)})` }}
                  ></div>
                  <div className="absolute inset-0 border-4 border-rose-500 rounded-full animate-ping opacity-30"></div>
                </>
              )}
              <button 
                onClick={handleRecord}
                disabled={status === 'loading'}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? isWarmingUp
                      ? 'bg-amber-400 text-white shadow-[0_0_60px_rgba(251,191,36,0.8)] scale-110'
                      : 'bg-rose-500 text-white shadow-[0_0_60px_rgba(244,63,94,0.8)] scale-110' 
                    : status === 'loading'
                      ? 'bg-slate-300 text-slate-500'
                      : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 shadow-[0_8px_0_rgb(225,29,72)] active:shadow-none active:translate-y-2'
                }`}
              >
                {isRecording ? (
                  isWarmingUp ? <Loader2 size={48} className="animate-spin" /> : <Square size={40} className="fill-white" />
                ) : (
                  <Mic size={48} />
                )}
              </button>
            </div>
            
            {/* Bottom Status & Volume Bar */}
            <div className={`flex flex-col items-center w-64 transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm tracking-widest mb-3 uppercase">
                 <div className={`w-3 h-3 rounded-full ${isWarmingUp ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`}></div>
                 {isWarmingUp ? "WARMING UP..." : "MIC ON - SPEAK NOW"}
              </div>
              
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                 <div 
                    className="h-full bg-amber-400 transition-all duration-75 rounded-full" 
                    style={{ width: `${Math.max(5, micVolume)}%` }}
                 ></div>
              </div>
              
              <div className="text-slate-400 text-sm font-bold">
                 {micVolume < 15 ? "Too quiet..." : micVolume < 60 ? "Good volume" : "Perfect!"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
