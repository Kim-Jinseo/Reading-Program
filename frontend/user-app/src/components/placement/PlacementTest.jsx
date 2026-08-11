import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Languages, Loader2, Mic, RotateCcw, Square, Volume2 } from 'lucide-react';
import { getPlacementItems, PLACEMENT_TEST_FORMS } from '../../data/placementTestForms';

const FORM_HISTORY_KEY = 'placement_test_form_history';
const CHINESE_NAME = /^[\u3400-\u9fff]{2,10}$/u;

const SECTION_DETAILS = {
  reading: { label: 'Reading', zh: '阅读', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  vocab: { label: 'Vocabulary', zh: '词汇', icon: Languages, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  grammar: { label: 'Grammar', zh: '语法', icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
  speaking: { label: 'Speaking', zh: '口语', icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' }
};

const getNextForm = () => {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(FORM_HISTORY_KEY) || '[]');
  } catch {
    history = [];
  }

  const validHistory = history.filter(id => PLACEMENT_TEST_FORMS.some(form => form.id === id));
  const available = PLACEMENT_TEST_FORMS.filter(form => !validHistory.includes(form.id));
  const choices = available.length ? available : PLACEMENT_TEST_FORMS;
  const selected = choices[Math.floor(Math.random() * choices.length)];
  const updatedHistory = available.length ? [...validHistory, selected.id] : [selected.id];
  localStorage.setItem(FORM_HISTORY_KEY, JSON.stringify(updatedHistory));
  return selected;
};

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const calculatePlacement = (items, answers) => {
  const levelScores = {
    1: { score: 0, max: 0 },
    2: { score: 0, max: 0 },
    3: { score: 0, max: 0 }
  };
  const sectionScores = {
    reading: { score: 0, max: 0 },
    vocab: { score: 0, max: 0 },
    grammar: { score: 0, max: 0 },
    speaking: { score: 0, max: 0 }
  };

  items.forEach((item, index) => {
    const max = item.section === 'speaking' ? 3 : 1;
    const score = Math.max(0, Math.min(max, Number(answers[index]?.score || 0)));
    levelScores[item.level].score += score;
    levelScores[item.level].max += max;
    sectionScores[item.section].score += score;
    sectionScores[item.section].max += max;
  });

  const rate = level => levelScores[level].max ? levelScores[level].score / levelScores[level].max : 0;
  const totalScore = Object.values(levelScores).reduce((sum, item) => sum + item.score, 0);
  const totalMax = Object.values(levelScores).reduce((sum, item) => sum + item.max, 0);
  const totalRate = totalMax ? totalScore / totalMax : 0;

  let recommendedLevel = '1-2';
  if (rate(1) >= 0.8 && rate(2) >= 0.7 && rate(3) >= 0.6 && totalRate >= 0.72) {
    recommendedLevel = '5-6';
  } else if (rate(1) >= 0.6 && rate(2) >= 0.45 && totalRate >= 0.5) {
    recommendedLevel = '3-4';
  }

  return { recommendedLevel, levelScores, sectionScores, totalScore, totalMax, totalRate };
};

export const PlacementTest = () => {
  const [stage, setStage] = useState('intro');
  const [chineseName, setChineseName] = useState('');
  const [currentGrade, setCurrentGrade] = useState('');
  const [form, setForm] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [result, setResult] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const activeIndexRef = useRef(0);

  const items = useMemo(() => form ? getPlacementItems(form) : [], [form]);
  const activeItem = items[activeIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const beginTest = () => {
    const trimmedName = chineseName.trim();
    if (!CHINESE_NAME.test(trimmedName)) {
      setRecordingError('请用 2–10 个汉字填写中文姓名。');
      return;
    }
    if (!/^[1-6]$/.test(currentGrade)) {
      setRecordingError('请选择当前年级。');
      return;
    }
    setRecordingError('');
    setForm(getNextForm());
    setAnswers({});
    setActiveIndex(0);
    setResult(null);
    setSaveState('idle');
    setStage('test');
  };

  const recordAnswer = (score, details = {}) => {
    setAnswers(previous => ({ ...previous, [activeIndexRef.current]: { score, ...details } }));
  };

  const evaluateAudio = async (blob, target) => {
    setIsEvaluating(true);
    setRecordingError('');
    try {
      const base64Audio = await toBase64(blob);
      const response = await fetch('/api/audio/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: blob.type || 'audio/webm',
          targetSentence: target
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'We could not assess that recording.');
      recordAnswer(data.score || 0, { feedback: data.feedback || '', transcript: data.transcript || '' });
    } catch (error) {
      setRecordingError(error.message || 'We could not assess that recording. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      setRecordingError('');
      const stream = streamRef.current?.active ? streamRef.current : await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      streamRef.current = stream;
      const options = {};
      if (window.MediaRecorder?.isTypeSupported?.('audio/webm')) options.mimeType = 'audio/webm';
      else if (window.MediaRecorder?.isTypeSupported?.('audio/mp4')) options.mimeType = 'audio/mp4';
      if (!window.MediaRecorder) throw new Error('This browser cannot record audio.');

      const recorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        if (blob.size > 0 && activeItem?.target) evaluateAudio(blob, activeItem.target);
        else setRecordingError('No audio was recorded. Please try again.');
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      setRecordingError(error.message || 'Please allow microphone access and try again.');
    }
  };

  const finishTest = async () => {
    const completedResult = calculatePlacement(items, answers);
    setResult(completedResult);
    setStage('result');
    setSaveState('saving');
    try {
      const response = await fetch('/api/placement-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        },
        body: JSON.stringify({
          chineseName: chineseName.trim(),
          currentGrade: Number(currentGrade),
          formId: form.id,
          recommendedLevel: completedResult.recommendedLevel,
          totalScore: completedResult.totalScore,
          totalMax: completedResult.totalMax,
          levelScores: completedResult.levelScores,
          sectionScores: completedResult.sectionScores
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Could not save the test.');
      setSaveState('saved');
    } catch (error) {
      console.error('Placement test save failed:', error);
      setSaveState('error');
    }
  };

  const nextItem = () => {
    if (activeIndex === items.length - 1) {
      finishTest();
      return;
    }
    setRecordingError('');
    setActiveIndex(index => index + 1);
  };

  if (stage === 'intro') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-indigo-100 shadow-sm p-5 sm:p-8">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-5"><BookOpen size={28} /></div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Placement Test</h2>
        <p className="text-slate-600 font-medium leading-relaxed mt-2">Find the best starting level for your English learning.</p>
        <p className="text-slate-500 mt-1">完成阅读、词汇、语法和口语小测试，获得学习等级建议。</p>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[['1', 'reading', 'reading'], ['5', 'vocab', 'vocabulary'], ['3', 'grammar', 'grammar'], ['3', 'speaking', 'speaking']].map(([count, key, label]) => {
            const Icon = SECTION_DETAILS[key].icon;
            return <div key={key} className={`rounded-2xl border p-3 ${SECTION_DETAILS[key].bg}`}><Icon size={20} className={`mx-auto ${SECTION_DETAILS[key].color}`} /><p className="font-black text-slate-800 mt-1">{count} {label}</p></div>;
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <label className="block">
            <span className="block text-sm font-extrabold text-slate-700 mb-2">Chinese name / 中文姓名</span>
            <input value={chineseName} onChange={event => setChineseName(event.target.value.replace(/\s/g, ''))} placeholder="例如：王小明" maxLength={10} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="block text-sm font-extrabold text-slate-700 mb-2">Current grade / 当前年级</span>
            <select value={currentGrade} onChange={event => setCurrentGrade(event.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-indigo-500 bg-white">
              <option value="">Choose grade / 请选择</option>
              {[1, 2, 3, 4, 5, 6].map(grade => <option key={grade} value={grade}>Grade {grade} / {grade} 年级</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-4">Your name, current grade, and recommended level are saved for the teacher. Each new attempt uses a different test form until all forms have been used.</p>
        {recordingError && <p className="mt-3 text-sm font-bold text-rose-600">{recordingError}</p>}
        <button onClick={beginTest} className="mt-6 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-[0_5px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none transition-all">Start Placement Test</button>
      </div>
    );
  }

  if (stage === 'result' && result) {
    const messages = {
      '1-2': ['Level 1 is a strong place to begin. Build your foundation with short, clear English.', '建议从 Level 1 开始，先把简单英语基础学扎实。'],
      '3-4': ['Level 2 is a good fit. You can build on your foundation with longer sentences and new words.', '建议从 Level 2 开始。你可以在已有基础上学习更长的句子和新词。'],
      '5-6': ['Level 3 is a good fit. You are ready for longer reading and more detailed English.', '建议从 Level 3 开始。你已经可以学习较长的阅读和更丰富的英语表达。']
    };
    const [message, messageZh] = messages[result.recommendedLevel];
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-5 sm:p-9 text-center">
        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={36} /></div>
        <p className="mt-5 text-sm font-extrabold tracking-widest uppercase text-emerald-600">Placement complete</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2">Suggested Level {result.recommendedLevel}</h2>
        <p className="text-slate-600 font-medium mt-4 max-w-xl mx-auto">{message}</p>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">{messageZh}</p>
        <div className="grid sm:grid-cols-4 gap-3 mt-8 text-left">
          {Object.entries(result.sectionScores).map(([section, score]) => {
            const detail = SECTION_DETAILS[section];
            const Icon = detail.icon;
            return <div key={section} className={`border rounded-2xl p-4 ${detail.bg}`}><Icon size={20} className={detail.color} /><p className="font-extrabold text-slate-700 mt-2">{detail.label}</p><p className="text-slate-500 text-sm">{Math.round(score.score)} / {score.max}</p></div>;
          })}
        </div>
        <p className={`mt-6 text-sm font-bold ${saveState === 'saved' ? 'text-emerald-600' : saveState === 'error' ? 'text-amber-700' : 'text-slate-500'}`}>
          {saveState === 'saving' && 'Saving your result…'}
          {saveState === 'saved' && 'Your result has been saved.'}
          {saveState === 'error' && 'Your suggested level is ready, but saving did not work. Please ask your teacher to check the connection.'}
        </p>
        <button onClick={beginTest} className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold"><RotateCcw size={18} /> Try a different test</button>
      </div>
    );
  }

  const section = SECTION_DETAILS[activeItem.section];
  const Icon = section.icon;
  const answer = answers[activeIndex];
  const isSpeaking = activeItem.section === 'speaking';
  const canContinue = Boolean(answer) && !isEvaluating && !isRecording;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 text-sm font-extrabold text-slate-500">
        <span>Question {activeIndex + 1} of {items.length}</span>
        <span>{section.label} / {section.zh}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-6"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }} /></div>
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-5 sm:p-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-extrabold ${section.bg} ${section.color}`}><Icon size={16} /> {section.label}</div>
        {activeItem.section === 'reading' && <div className="mt-5 p-4 sm:p-5 bg-amber-50 border border-amber-100 rounded-2xl text-slate-700 font-medium leading-relaxed">{form.reading.passage}</div>}
        {isSpeaking ? (
          <div className="mt-7 text-center">
            <p className="text-slate-500 font-bold">Read this sentence aloud:</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed mt-3">“{activeItem.target}”</p>
            <button onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(activeItem.target))} className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-extrabold hover:text-indigo-800"><Volume2 size={19} /> Hear it</button>
            <div className="mt-7">
              <button disabled={isEvaluating} onClick={toggleRecording} className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center text-white font-black shadow-lg transition-transform active:scale-95 disabled:opacity-60 ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isEvaluating ? <Loader2 className="animate-spin" size={30} /> : isRecording ? <Square size={28} /> : <Mic size={30} />}
                <span className="text-xs mt-2">{isEvaluating ? 'Checking…' : isRecording ? 'Stop' : answer ? 'Try again' : 'Record'}</span>
              </button>
              {answer && <p className={`mt-4 font-extrabold ${answer.score >= 2 ? 'text-emerald-600' : 'text-amber-700'}`}>{answer.score >= 2 ? 'Good clear speech!' : 'Nice try. You can record again for a clearer score.'}</p>}
              <button disabled={isRecording || isEvaluating} onClick={() => recordAnswer(0, { skipped: true })} className="block mx-auto mt-4 text-sm font-bold text-slate-500 hover:text-slate-800 underline disabled:opacity-50">No microphone? Skip this speaking item</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed mt-7">{activeItem.q}</h2>
            <div className="grid gap-3 mt-7">
              {activeItem.options.map((option, index) => {
                const isSelected = answer?.selected === option;
                return <button key={option} onClick={() => recordAnswer(option === activeItem.answer ? 1 : 0, { selected: option })} className={`text-left p-4 rounded-2xl border-2 font-bold transition-all ${isSelected ? (option === activeItem.answer ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900') : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700'}`}><span className="inline-flex mr-3 w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-sm">{String.fromCharCode(65 + index)}</span>{option}</button>;
              })}
            </div>
          </>
        )}
        {recordingError && <p className="mt-5 text-sm font-bold text-rose-600">{recordingError}</p>}
        <button disabled={!canContinue} onClick={nextItem} className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">{activeIndex === items.length - 1 ? 'See my suggested level' : 'Next question'} <ChevronRight size={20} /></button>
      </div>
    </div>
  );
};
