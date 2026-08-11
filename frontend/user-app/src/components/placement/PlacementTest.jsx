import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Languages, Loader2, LogOut, Mic, RotateCcw, Square, Volume2 } from 'lucide-react';
import { ADAPTIVE_PLACEMENT_BANK, ADAPTIVE_SECTION_ORDER } from '../../data/adaptivePlacementBank';
import { useAppContext } from '../../context/AppContext';

const ADAPTIVE_HISTORY_KEY = 'adaptive_placement_completed_items_v1';
const CHINESE_NAME = /^[\u3400-\u9fff]{2,10}$/u;
const TOTAL_QUESTIONS = 14;
const SECTION_COUNTS = { vocab: 5, grammar: 3, reading: 3, speaking: 3 };

const SECTION_DETAILS = {
  reading: { label: 'Reading', zh: '阅读', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  vocab: { label: 'Vocabulary', zh: '词汇', icon: Languages, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  grammar: { label: 'Grammar', zh: '语法', icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
  speaking: { label: 'Speaking', zh: '口语', icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' }
};

const makeEmptyHistory = () => ({ vocab: [], grammar: [], reading: [], speaking: [] });

const loadCompletedHistory = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ADAPTIVE_HISTORY_KEY) || '{}');
    return Object.fromEntries(ADAPTIVE_SECTION_ORDER.map(section => [
      section,
      Array.isArray(saved?.[section]) ? saved[section].filter(id => typeof id === 'string') : []
    ]));
  } catch {
    return makeEmptyHistory();
  }
};

const shuffle = (values) => {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const clampLevel = level => Math.max(1, Math.min(3, level));
const nextLevel = (level, wasCorrect) => clampLevel(level + (wasCorrect ? 1 : -1));
const levelForRate = (rate) => (rate >= 0.8 ? 3 : rate >= 0.45 ? 2 : 1);

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const calculatePlacement = (items, answers) => {
  const levelScores = { 1: { score: 0, max: 0 }, 2: { score: 0, max: 0 }, 3: { score: 0, max: 0 } };
  const sectionScores = { reading: { score: 0, max: 0 }, vocab: { score: 0, max: 0 }, grammar: { score: 0, max: 0 }, speaking: { score: 0, max: 0 } };

  items.forEach((item, index) => {
    const max = item.section === 'speaking' ? 3 : 1;
    const score = Math.max(0, Math.min(max, Number(answers[index]?.score || 0)));
    levelScores[item.level].score += score;
    levelScores[item.level].max += max;
    sectionScores[item.section].score += score;
    sectionScores[item.section].max += max;
  });

  const totalScore = Object.values(levelScores).reduce((sum, item) => sum + item.score, 0);
  const totalMax = Object.values(levelScores).reduce((sum, item) => sum + item.max, 0);
  const sectionRate = section => sectionScores[section].max ? sectionScores[section].score / sectionScores[section].max : 0;
  const totalRate = totalMax ? totalScore / totalMax : 0;
  const recommendedLevel = sectionRate('vocab') >= 0.8 && sectionRate('grammar') >= (2 / 3) && sectionRate('reading') >= (2 / 3) && sectionRate('speaking') >= (2 / 3) && totalRate >= 0.72
    ? '3'
    : sectionRate('vocab') >= 0.4 && sectionRate('grammar') >= (1 / 3) && sectionRate('reading') >= (1 / 3) && totalRate >= 0.48
      ? '2'
      : '1';

  return { recommendedLevel, levelScores, sectionScores, totalScore, totalMax };
};

export const PlacementTest = () => {
  const { lang } = useAppContext();
  const isChinese = lang === 'zh';
  const text = (en, zh) => (isChinese ? zh : en);
  const sectionName = section => text(SECTION_DETAILS[section].label, SECTION_DETAILS[section].zh);
  const [stage, setStage] = useState('intro');
  const [chineseName, setChineseName] = useState('');
  const [currentGrade, setCurrentGrade] = useState('');
  const [items, setItems] = useState([]);
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
  const completedHistoryRef = useRef(makeEmptyHistory());
  const usedThisAttemptRef = useRef(new Set());
  const adaptivePathRef = useRef([]);

  const activeItem = items[activeIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsRecording(false);
  };

  const selectEntry = (section, preferredLevel) => {
    const history = completedHistoryRef.current[section] || [];
    const excluded = new Set([...history, ...usedThisAttemptRef.current]);
    const allEntries = ADAPTIVE_PLACEMENT_BANK[section];
    const preferredEntries = allEntries.filter(entry => entry.level === preferredLevel && !excluded.has(entry.id));
    const fallbackEntries = allEntries.filter(entry => !excluded.has(entry.id));
    const choices = preferredEntries.length ? preferredEntries : fallbackEntries;

    // The bank has 30 unique entries at every level in every section. If a
    // learner ever exhausts the bank, only then may a previously used item be
    // offered again, with its choices reshuffled.
    const reusable = allEntries.filter(entry => entry.level === preferredLevel);
    const entry = choices.length
      ? choices[Math.floor(Math.random() * choices.length)]
      : reusable[Math.floor(Math.random() * reusable.length)] || allEntries[Math.floor(Math.random() * allEntries.length)];

    usedThisAttemptRef.current.add(entry.id);
    adaptivePathRef.current.push({ id: entry.id, section, level: entry.level });
    return entry;
  };

  const prepareEntry = (entry) => {
    if (entry.section !== 'reading') return [{ ...entry, bankId: entry.id, options: entry.options ? shuffle(entry.options) : undefined }];
    return entry.questions.map((question, index) => ({
      ...question,
      id: `${entry.id}-question-${index + 1}`,
      bankId: entry.id,
      section: 'reading',
      level: entry.level,
      title: entry.title,
      passage: entry.text,
      options: shuffle(question.options)
    }));
  };

  const sectionRateSoFar = (sections) => {
    let score = 0;
    let max = 0;
    items.forEach((item, index) => {
      if (!sections.includes(item.section)) return;
      const itemMax = item.section === 'speaking' ? 3 : 1;
      score += Math.max(0, Math.min(itemMax, Number(answers[index]?.score || 0)));
      max += itemMax;
    });
    return max ? score / max : 0;
  };

  const appendSection = (section, level) => {
    const prepared = prepareEntry(selectEntry(section, clampLevel(level)));
    setItems(previous => [...previous, ...prepared]);
    setActiveIndex(index => index + 1);
  };

  const beginTest = () => {
    const trimmedName = chineseName.trim();
    if (!CHINESE_NAME.test(trimmedName)) {
      setRecordingError(text('Please use 2–10 Chinese characters for the Chinese name.', '请用 2–10 个汉字填写中文姓名。'));
      return;
    }
    if (!/^[1-6]$/.test(currentGrade)) {
      setRecordingError(text('Please choose your current grade.', '请选择当前年级。'));
      return;
    }

    completedHistoryRef.current = loadCompletedHistory();
    usedThisAttemptRef.current = new Set();
    adaptivePathRef.current = [];
    const firstItem = prepareEntry(selectEntry('vocab', 2));
    setItems(firstItem);
    setAnswers({});
    setActiveIndex(0);
    setResult(null);
    setSaveState('idle');
    setRecordingError('');
    setStage('test');
  };

  const leaveTest = () => {
    if (!window.confirm(text('Leave this placement test? Your answers and result will not be saved.', '要退出分级测试吗？你的答案和结果不会被保存。'))) return;
    stopRecording();
    setItems([]);
    setAnswers({});
    setActiveIndex(0);
    setResult(null);
    setRecordingError('');
    setStage('intro');
  };

  const recordAnswer = (score, details = {}) => {
    setAnswers(previous => {
      const index = activeIndexRef.current;
      // The student's first response is the only response that counts.
      if (previous[index]) return previous;
      return { ...previous, [index]: { score, ...details } };
    });
  };

  const evaluateAudio = async (blob, target) => {
    setIsEvaluating(true);
    setRecordingError('');
    try {
      const base64Audio = await toBase64(blob);
      const response = await fetch('/api/audio/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) },
        body: JSON.stringify({ audioBase64: base64Audio, mimeType: blob.type || 'audio/webm', targetSentence: target })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'We could not assess that recording.');
      recordAnswer(data.score || 0, { feedback: data.feedback || '', transcript: data.transcript || '' });
    } catch (error) {
      setRecordingError(text('We could not assess that recording. Please try again.', '无法检查这段录音，请再试一次。'));
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
      const stream = streamRef.current?.active ? streamRef.current : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const options = {};
      if (window.MediaRecorder?.isTypeSupported?.('audio/webm')) options.mimeType = 'audio/webm';
      else if (window.MediaRecorder?.isTypeSupported?.('audio/mp4')) options.mimeType = 'audio/mp4';
      if (!window.MediaRecorder) throw new Error('This browser cannot record audio.');

      const recorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        if (blob.size > 0 && activeItem?.target) evaluateAudio(blob, activeItem.target);
        else setRecordingError(text('No audio was recorded. Please try again.', '没有录到声音，请再试一次。'));
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      setRecordingError(text('Please allow microphone access and try again.', '请允许使用麦克风后再试一次。'));
    }
  };

  const saveCompletedHistory = () => {
    const updated = loadCompletedHistory();
    adaptivePathRef.current.forEach(({ id, section }) => {
      if (!updated[section].includes(id)) updated[section].push(id);
    });
    Object.keys(updated).forEach(section => { updated[section] = updated[section].slice(-90); });
    localStorage.setItem(ADAPTIVE_HISTORY_KEY, JSON.stringify(updated));
  };

  const finishTest = async () => {
    const completedResult = calculatePlacement(items, answers);
    saveCompletedHistory();
    setResult(completedResult);
    setStage('result');
    setSaveState('saving');
    try {
      const response = await fetch('/api/placement-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) },
        body: JSON.stringify({
          chineseName: chineseName.trim(),
          currentGrade: Number(currentGrade),
          formId: 'adaptive-v1',
          recommendedLevel: completedResult.recommendedLevel,
          totalScore: completedResult.totalScore,
          totalMax: completedResult.totalMax,
          levelScores: completedResult.levelScores,
          sectionScores: completedResult.sectionScores,
          adaptivePath: adaptivePathRef.current
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
    setRecordingError('');
    const nextQueued = items[activeIndex + 1];
    if (nextQueued?.section === activeItem.section) {
      setActiveIndex(index => index + 1);
      return;
    }

    const answeredInCurrentSection = items.filter((item, index) => item.section === activeItem.section && answers[index]).length;
    if (answeredInCurrentSection < SECTION_COUNTS[activeItem.section]) {
      const wasCorrect = activeItem.section === 'speaking'
        ? Number(answers[activeIndex]?.score || 0) >= 2
        : Number(answers[activeIndex]?.score || 0) === 1;
      appendSection(activeItem.section, nextLevel(activeItem.level, wasCorrect));
      return;
    }

    if (activeItem.section === 'vocab') {
      appendSection('grammar', levelForRate(sectionRateSoFar(['vocab'])));
      return;
    }
    if (activeItem.section === 'grammar') {
      appendSection('reading', levelForRate(sectionRateSoFar(['vocab', 'grammar'])));
      return;
    }
    if (activeItem.section === 'reading') {
      appendSection('speaking', levelForRate(sectionRateSoFar(['vocab', 'grammar', 'reading'])));
      return;
    }
    if (activeItem.section === 'speaking' && activeIndex === TOTAL_QUESTIONS - 1) {
      finishTest();
      return;
    }
  };

  if (stage === 'intro') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-indigo-100 shadow-sm p-6 sm:p-9">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 shrink-0 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center"><BookOpen size={28} /></div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{text('Adaptive Placement Test', '自适应分级测试')}</h2>
            <p className="text-slate-600 font-medium leading-relaxed mt-1.5">{text('Each answer helps choose the next question and your starting level.', '每一道答案都会帮助系统选择下一题和适合你的起始等级。')}</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {ADAPTIVE_SECTION_ORDER.map(key => {
            const Icon = SECTION_DETAILS[key].icon;
            return <div key={key} className={`min-h-24 rounded-2xl border p-3 flex flex-col items-center justify-center ${SECTION_DETAILS[key].bg}`}><Icon size={20} className={`shrink-0 ${SECTION_DETAILS[key].color}`} /><p className="font-black text-slate-800 mt-2 leading-tight">{SECTION_COUNTS[key]} {sectionName(key)}</p></div>;
          })}
        </div>
        <p className="mt-3 text-center text-sm font-bold text-slate-500">{text('Vocabulary → Grammar → Reading → Speaking', '词汇 → 语法 → 阅读 → 口语')}</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-7">
          <label className="block">
            <span className="block text-sm font-extrabold text-slate-700 mb-2">{text('Chinese name', '中文姓名')}</span>
            <input value={chineseName} onChange={event => setChineseName(event.target.value.replace(/\s/g, ''))} placeholder={text('For example: 王小明', '例如：王小明')} maxLength={10} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 font-bold shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="block text-sm font-extrabold text-slate-700 mb-2">{text('Current grade', '当前年级')}</span>
            <select value={currentGrade} onChange={event => setCurrentGrade(event.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 font-bold shadow-sm outline-none transition-colors focus:border-indigo-500 bg-white">
              <option value="">{text('Choose grade', '请选择年级')}</option>
              {[1, 2, 3, 4, 5, 6].map(grade => <option key={grade} value={grade}>{text(`Grade ${grade}`, `${grade} 年级`)}</option>)}
            </select>
          </label>
        </div>
        <p className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs text-slate-600 leading-relaxed mt-5">{text('Only a completed test is saved for the teacher. Completed attempts use new questions whenever possible. You may leave at any time; if you leave before finishing, nothing is saved.', '只有完成的测试才会保存给老师。完成后的再次测试会尽量使用新题。你可以随时退出；如果没有完成，任何内容都不会保存。')}</p>
        {recordingError && <p className="mt-3 text-sm font-bold text-rose-600">{recordingError}</p>}
        <button onClick={beginTest} className="mt-6 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-[0_5px_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none transition-all">{text('Start Adaptive Placement Test', '开始自适应分级测试')}</button>
      </div>
    );
  }

  if (stage === 'result' && result) {
    const messages = {
      1: { en: 'Level 1 is a strong place to begin. Build your foundation with short, clear English.', zh: '建议从 Level 1 开始，先把简单英语基础学扎实。' },
      2: { en: 'Level 2 is a good fit. You can build on your foundation with longer sentences and new words.', zh: '建议从 Level 2 开始。你可以在已有基础上学习更长的句子和新词。' },
      3: { en: 'Level 3 is a good fit. You are ready for longer reading and more detailed English.', zh: '建议从 Level 3 开始。你已经可以学习较长的阅读和更丰富的英语表达。' }
    };
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-emerald-100 shadow-sm p-5 sm:p-9 text-center">
        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={36} /></div>
        <p className="mt-5 text-sm font-extrabold tracking-widest uppercase text-emerald-600">{text('Placement complete', '分级测试完成')}</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2">{text(`Suggested Level ${result.recommendedLevel}`, `建议等级 ${result.recommendedLevel}`)}</h2>
        <p className="text-slate-600 font-medium mt-4 max-w-xl mx-auto">{messages[result.recommendedLevel][isChinese ? 'zh' : 'en']}</p>
        <div className="grid sm:grid-cols-4 gap-3 mt-8 text-left">
          {ADAPTIVE_SECTION_ORDER.map(section => {
            const score = result.sectionScores[section];
            const detail = SECTION_DETAILS[section];
            const Icon = detail.icon;
            return <div key={section} className={`border rounded-2xl p-4 ${detail.bg}`}><Icon size={20} className={detail.color} /><p className="font-extrabold text-slate-700 mt-2">{sectionName(section)}</p><p className="text-slate-500 text-sm">{Math.round(score.score)} / {score.max}</p></div>;
          })}
        </div>
        <p className={`mt-6 text-sm font-bold ${saveState === 'saved' ? 'text-emerald-600' : saveState === 'error' ? 'text-amber-700' : 'text-slate-500'}`}>
          {saveState === 'saving' && text('Saving your result…', '正在保存你的结果…')}
          {saveState === 'saved' && text('Your result has been saved.', '你的结果已保存。')}
          {saveState === 'error' && text('Your suggested level is ready, but saving did not work. Please ask your teacher to check the connection.', '你的建议等级已生成，但结果没有保存成功。请让老师检查网络连接。')}
        </p>
        <button onClick={beginTest} className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold"><RotateCcw size={18} /> {text('Take another adaptive test', '再做一次自适应测试')}</button>
      </div>
    );
  }

  const section = SECTION_DETAILS[activeItem.section];
  const Icon = section.icon;
  const answer = answers[activeIndex];
  const isSpeaking = activeItem.section === 'speaking';
  const canContinue = Boolean(answer) && !isEvaluating && !isRecording;
  const isLastQuestion = activeIndex === TOTAL_QUESTIONS - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 text-sm font-extrabold text-slate-500">
        <span>{text(`Question ${activeIndex + 1} of ${TOTAL_QUESTIONS}`, `第 ${activeIndex + 1} 题，共 ${TOTAL_QUESTIONS} 题`)}</span>
        <button onClick={leaveTest} disabled={isEvaluating || isRecording} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 disabled:opacity-50"><LogOut size={16} /> {text('Leave without saving', '退出且不保存')}</button>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${((activeIndex + 1) / TOTAL_QUESTIONS) * 100}%` }} /></div>
      <p className="mb-6 text-xs font-semibold text-slate-500">{text('Leaving before the final result means this test will not be saved.', '在看到最终结果前退出，这次测试不会被保存。')}</p>
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-5 sm:p-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-extrabold ${section.bg} ${section.color}`}><Icon size={16} /> {sectionName(activeItem.section)}</div>
        {activeItem.section === 'reading' && <div className="mt-5 p-4 sm:p-5 bg-amber-50 border border-amber-100 rounded-2xl text-slate-700 font-medium leading-relaxed"><p className="font-black text-slate-800 mb-2">{text(activeItem.title.en, activeItem.title.zh)}</p>{text(activeItem.passage.en, activeItem.passage.zh)}</div>}
        {isSpeaking ? (
          <div className="mt-7 text-center">
            <p className="text-slate-500 font-bold">{text('Read this sentence aloud:', '请大声朗读这句话：')}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed mt-3">“{activeItem.target}”</p>
            <button onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(activeItem.target))} className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-extrabold hover:text-indigo-800"><Volume2 size={19} /> {text('Hear it', '听一听')}</button>
            <div className="mt-7">
              <button disabled={isEvaluating || Boolean(answer)} onClick={toggleRecording} className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center text-white font-black shadow-lg transition-transform active:scale-95 disabled:opacity-60 ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isEvaluating ? <Loader2 className="animate-spin" size={30} /> : isRecording ? <Square size={28} /> : <Mic size={30} />}
                <span className="text-xs mt-2">{isEvaluating ? text('Checking…', '检查中…') : isRecording ? text('Stop', '停止') : answer ? text('Saved', '已保存') : text('Record', '录音')}</span>
              </button>
              {answer && <p className={`mt-4 font-extrabold ${answer.score >= 2 ? 'text-emerald-600' : 'text-amber-700'}`}>{answer.score >= 2 ? text('Good clear speech. Your recording is saved.', '朗读很清楚，录音已保存。') : text('Your recording is saved.', '录音已保存。')}</p>}
              <button disabled={isRecording || isEvaluating || Boolean(answer)} onClick={() => recordAnswer(0, { skipped: true })} className="block mx-auto mt-4 text-sm font-bold text-slate-500 hover:text-slate-800 underline disabled:opacity-50">{text('No microphone? Skip this speaking item', '没有麦克风？跳过这道口语题')}</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed mt-7">{activeItem.q}</h2>
            <div className="grid gap-3 mt-7">
              {activeItem.options.map((option, index) => {
                const isSelected = answer?.selected === option;
                return <button key={option} disabled={Boolean(answer)} onClick={() => recordAnswer(option === activeItem.answer ? 1 : 0, { selected: option })} className={`text-left p-4 rounded-2xl border-2 font-bold transition-all disabled:cursor-not-allowed ${isSelected ? (option === activeItem.answer ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900') : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 disabled:hover:border-slate-200 disabled:hover:bg-white'}`}><span className="inline-flex mr-3 w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-sm">{String.fromCharCode(65 + index)}</span>{option}</button>;
              })}
            </div>
            {answer && <p className={`mt-4 font-extrabold ${answer.score ? 'text-emerald-600' : 'text-rose-600'}`}>{answer.score ? text('Correct. Your answer is locked.', '回答正确，答案已锁定。') : text('This answer is not correct. It is locked.', '这个答案不正确，已锁定。')}</p>}
          </>
        )}
        {recordingError && <p className="mt-5 text-sm font-bold text-rose-600">{recordingError}</p>}
        <button disabled={!canContinue} onClick={nextItem} className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isLastQuestion ? text('See my suggested level', '查看我的建议等级') : text('Next question', '下一题')} <ChevronRight size={20} /></button>
      </div>
    </div>
  );
};
