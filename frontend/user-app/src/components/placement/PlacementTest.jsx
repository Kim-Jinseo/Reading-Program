import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Languages, Loader2, LogOut, Mic, Square, Volume2 } from 'lucide-react';
import { ADAPTIVE_PLACEMENT_BANK, ADAPTIVE_SECTION_ORDER } from '../../data/adaptivePlacementBank';

const ADAPTIVE_HISTORY_KEY = 'adaptive_placement_completed_items_v2';
const CHINESE_NAME = /^[\u3400-\u9fff]{2,10}$/u;
const TOTAL_QUESTIONS = 20;
const SECTION_COUNTS = { vocab: 5, grammar: 5, reading: 5, speaking: 5 };
const LEVEL_POINT_VALUES = { 1: 1, 2: 2, 3: 3 };
// Vocabulary, reading, and speaking are the strongest signals for a starting
// level. Grammar still helps, but it cannot outweigh those three skills.
const SECTION_POINT_WEIGHTS = { vocab: 3, grammar: 1, reading: 3, speaking: 3 };
const CORE_SECTIONS = ['vocab', 'reading', 'speaking'];
const PLACEMENT_SCORE_MIN = 100;
const PLACEMENT_SCORE_MAX = 300;

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
const hasChineseCharacters = value => /[\u4e00-\u9fff]/.test(value || '');
const rawMaximumForItem = item => item.section === 'speaking' ? 3 : 1;
const pointMultiplierForItem = item => LEVEL_POINT_VALUES[item.level] * SECTION_POINT_WEIGHTS[item.section];

const repairLegacyReadingItem = (item) => {
  if (item?.section !== 'reading') return item;
  const visibleValues = [item.q, item.answer, ...(item.options || []), item.title?.en, item.passage?.en];
  if (!visibleValues.some(hasChineseCharacters)) return item;

  const sourcePassage = ADAPTIVE_PLACEMENT_BANK.reading.find(entry => entry.id === item.bankId);
  const questionNumber = Number(item.id.match(/-question-(\d+)$/)?.[1]);
  const sourceQuestion = sourcePassage?.questions[questionNumber - 1];
  if (!sourceQuestion) return item;

  // Keep a student's choice in the same A/B/C/D position if a test was
  // already in progress when the old mixed-language bank was replaced.
  const previousAnswerIndex = item.options?.indexOf(item.answer);
  const answerIndex = previousAnswerIndex >= 0 ? previousAnswerIndex : sourceQuestion.correct;
  const options = sourceQuestion.options.filter(option => option !== sourceQuestion.answer);
  options.splice(answerIndex, 0, sourceQuestion.answer);

  return {
    ...item,
    q: sourceQuestion.q,
    answer: sourceQuestion.answer,
    options,
    title: sourcePassage.title,
    passage: sourcePassage.text
  };
};

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const calculatePlacement = (items, answers) => {
  const levelScores = { 1: { score: 0, max: 0 }, 2: { score: 0, max: 0 }, 3: { score: 0, max: 0 } };
  const sectionScores = {
    reading: { score: 0, max: 0, rawScore: 0, rawMax: 0 },
    vocab: { score: 0, max: 0, rawScore: 0, rawMax: 0 },
    grammar: { score: 0, max: 0, rawScore: 0, rawMax: 0 },
    speaking: { score: 0, max: 0, rawScore: 0, rawMax: 0 }
  };

  items.forEach((item, index) => {
    const rawMax = rawMaximumForItem(item);
    const rawScore = Math.max(0, Math.min(rawMax, Number(answers[index]?.score || 0)));
    const multiplier = pointMultiplierForItem(item);
    const score = rawScore * multiplier;
    const max = rawMax * multiplier;
    levelScores[item.level].score += score;
    levelScores[item.level].max += max;
    sectionScores[item.section].score += score;
    sectionScores[item.section].max += max;
    sectionScores[item.section].rawScore += rawScore;
    sectionScores[item.section].rawMax += rawMax;
  });

  const totalScore = Object.values(levelScores).reduce((sum, item) => sum + item.score, 0);
  const totalMax = Object.values(levelScores).reduce((sum, item) => sum + item.max, 0);
  const sectionRate = section => sectionScores[section].max ? sectionScores[section].score / sectionScores[section].max : 0;
  const totalRate = totalMax ? totalScore / totalMax : 0;
  const coreScore = CORE_SECTIONS.reduce((sum, section) => sum + sectionScores[section].score, 0);
  const coreMax = CORE_SECTIONS.reduce((sum, section) => sum + sectionScores[section].max, 0);
  const coreRate = coreMax ? coreScore / coreMax : 0;
  const strongCoreSkills = CORE_SECTIONS.filter(section => sectionRate(section) >= 0.6).length;
  const grammarRate = sectionRate('grammar');
  const difficultyWeight = item => rawMaximumForItem(item) * SECTION_POINT_WEIGHTS[item.section];
  const difficultyTotal = items.reduce((sum, item) => sum + difficultyWeight(item), 0);
  const averageDifficulty = difficultyTotal
    ? items.reduce((sum, item) => sum + item.level * difficultyWeight(item), 0) / difficultyTotal
    : 1;
  // This is a transparent, child-friendly scale—not a College Board score.
  // Core skills supply 90% of the answer evidence while grammar supplies 10%.
  // Reaching harder questions raises the score, but never more than correct work.
  const evidenceRate = (coreRate * 0.9) + (grammarRate * 0.1);
  const difficultySignal = (averageDifficulty - 1) / 2;
  const scaledScore = Math.round(Math.max(PLACEMENT_SCORE_MIN, Math.min(
    PLACEMENT_SCORE_MAX,
    PLACEMENT_SCORE_MIN + ((PLACEMENT_SCORE_MAX - PLACEMENT_SCORE_MIN) * ((evidenceRate * 0.85) + (difficultySignal * 0.15)))
  )));
  const sectionResults = Object.fromEntries(ADAPTIVE_SECTION_ORDER.map(section => {
    let correct = 0;
    let total = 0;
    items.forEach((item, index) => {
      if (item.section !== section) return;
      total += 1;
      const score = Number(answers[index]?.score || 0);
      const isCorrect = item.section === 'speaking' ? score >= 2 : score === 1;
      correct += Number(isCorrect);
    });
    return [section, { correct, total }];
  }));
  const recommendedLevel = coreRate >= 0.72 && strongCoreSkills >= 2 && totalRate >= 0.66
    ? '3'
    : coreRate >= 0.38 && totalRate >= 0.34
      ? '2'
      : '1';

  return { recommendedLevel, levelScores, sectionScores, sectionResults, totalScore, totalMax, coreRate, totalRate, scaledScore, averageDifficulty };
};

export const PlacementTest = ({ onExit }) => {
  // Placement is an English assessment, so its instructions and questions
  // always stay in English even when the rest of the app is set to Chinese.
  const text = en => en;
  const sectionName = section => SECTION_DETAILS[section].label;
  const [stage, setStage] = useState('intro');
  const [chineseName, setChineseName] = useState('');
  const [currentGrade, setCurrentGrade] = useState('');
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingMic, setIsPreparingMic] = useState(false);
  const [isMicReady, setIsMicReady] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [result, setResult] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const targetAudioRef = useRef(new Map());
  const completedHistoryRef = useRef(makeEmptyHistory());
  const usedThisAttemptRef = useRef(new Set());
  const adaptivePathRef = useRef([]);

  const activeItem = items[activeIndex];

  useEffect(() => {
    const migrations = [];
    const repairedItems = items.map((item, index) => {
      const repaired = repairLegacyReadingItem(item);
      if (repaired !== item) migrations.push({ index, oldOptions: item.options || [], newOptions: repaired.options || [] });
      return repaired;
    });
    if (!migrations.length) return;

    setItems(repairedItems);
    setAnswers(previous => {
      const updated = { ...previous };
      migrations.forEach(({ index, oldOptions, newOptions }) => {
        const selected = previous[index]?.selected;
        const selectedIndex = oldOptions.indexOf(selected);
        if (selectedIndex >= 0 && newOptions[selectedIndex]) updated[index] = { ...previous[index], selected: newOptions[selectedIndex] };
      });
      return updated;
    });
  }, [items]);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    targetAudioRef.current.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
  }, []);

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsRecording(false);
    setIsPreparingMic(false);
    setIsMicReady(false);
  };

  const playTargetAudio = (target) => {
    if (!target) return;

    let audio = targetAudioRef.current.get(target);
    if (!audio) {
      const token = localStorage.getItem('token') || '';
      audio = new Audio(`/api/audio/tts?text=${encodeURIComponent(target)}&token=${encodeURIComponent(token)}&t=${Date.now()}`);
      targetAudioRef.current.set(target, audio);
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      targetAudioRef.current.delete(target);
      setRecordingError('We could not play the example audio. Please try again.');
    });
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
    // Reading used to queue three questions from one passage at one level.
    // Selecting one question from a fresh passage makes every reading response
    // route the very next reading question up or down, like the other skills.
    const questionIndex = Math.floor(Math.random() * entry.questions.length);
    const question = entry.questions[questionIndex];
    return [{
      ...question,
      id: `${entry.id}-question-${questionIndex + 1}`,
      bankId: entry.id,
      section: 'reading',
      level: entry.level,
      title: entry.title,
      passage: entry.text,
      options: shuffle(question.options)
    }];
  };

  const sectionRateSoFar = (sections, answerSet = answers) => {
    let score = 0;
    let max = 0;
    items.forEach((item, index) => {
      if (!sections.includes(item.section)) return;
      const rawMax = rawMaximumForItem(item);
      const rawScore = Math.max(0, Math.min(rawMax, Number(answerSet[index]?.score || 0)));
      const multiplier = pointMultiplierForItem(item);
      score += rawScore * multiplier;
      max += rawMax * multiplier;
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
    // Every student begins with a Level 1 vocabulary item. A correct answer
    // immediately moves up; a wrong answer keeps the next item at the easiest
    // level instead of continuing with a question that is too difficult.
    const firstItem = prepareEntry(selectEntry('vocab', 1));
    setItems(firstItem);
    setAnswers({});
    setPendingAnswer(null);
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
    setPendingAnswer(null);
    setActiveIndex(0);
    setResult(null);
    setRecordingError('');
    setStage('intro');
  };

  const exitCompletedTest = () => {
    stopRecording();
    if (onExit) onExit();
    else setStage('intro');
  };

  const recordAnswer = (score, details = {}) => {
    setPendingAnswer({ score, ...details });
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
      setIsPreparingMic(true);
      setRecordingError('');
      if (!window.MediaRecorder) throw new Error('This browser cannot record audio.');
      const stream = streamRef.current?.active ? streamRef.current : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      setIsMicReady(true);
      const options = {};
      if (window.MediaRecorder?.isTypeSupported?.('audio/webm')) options.mimeType = 'audio/webm';
      else if (window.MediaRecorder?.isTypeSupported?.('audio/mp4')) options.mimeType = 'audio/mp4';

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
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsMicReady(false);
      setRecordingError(text('Please allow microphone access and try again.', '请允许使用麦克风后再试一次。'));
    } finally {
      setIsPreparingMic(false);
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

  const finishTest = async (completedAnswers = answers) => {
    // A completed speaking answer has already been assessed, so it is safe to
    // release the microphone before showing the placement result.
    stopRecording();
    const completedResult = calculatePlacement(items, completedAnswers);
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
          formId: 'adaptive-v4',
          recommendedLevel: completedResult.recommendedLevel,
          totalScore: completedResult.totalScore,
          totalMax: completedResult.totalMax,
          scaledScore: completedResult.scaledScore,
          levelScores: completedResult.levelScores,
          sectionScores: completedResult.sectionScores,
          adaptivePath: adaptivePathRef.current,
          adaptiveResponses: items.map((item, index) => ({
            section: item.section,
            level: item.level,
            score: Math.max(0, Math.min(rawMaximumForItem(item), Number(completedAnswers[index]?.score || 0)))
          }))
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
    if (!pendingAnswer) return;

    // A selection or recording remains a draft until the student deliberately
    // chooses Next question. Only then can it affect adaptive routing.
    const completedAnswers = { ...answers, [activeIndex]: pendingAnswer };
    setAnswers(completedAnswers);
    setPendingAnswer(null);

    const nextQueued = items[activeIndex + 1];
    if (nextQueued?.section === activeItem.section) {
      setActiveIndex(index => index + 1);
      return;
    }

    const answeredInCurrentSection = items.filter((item, index) => item.section === activeItem.section && completedAnswers[index]).length;
    if (answeredInCurrentSection < SECTION_COUNTS[activeItem.section]) {
      const wasCorrect = activeItem.section === 'speaking'
        ? Number(pendingAnswer.score || 0) >= 2
        : Number(pendingAnswer.score || 0) === 1;
      appendSection(activeItem.section, nextLevel(activeItem.level, wasCorrect));
      return;
    }

    if (activeItem.section === 'vocab') {
      // Grammar is deliberately capped at Level 2 on entry. It remains
      // adaptive within its own questions, but has less pressure overall.
      appendSection('grammar', Math.min(2, levelForRate(sectionRateSoFar(['vocab'], completedAnswers))));
      return;
    }
    if (activeItem.section === 'grammar') {
      appendSection('reading', levelForRate(sectionRateSoFar(['vocab', 'grammar'], completedAnswers)));
      return;
    }
    if (activeItem.section === 'reading') {
      appendSection('speaking', levelForRate(sectionRateSoFar(['vocab', 'grammar', 'reading'], completedAnswers)));
      return;
    }
    if (activeItem.section === 'speaking' && activeIndex === TOTAL_QUESTIONS - 1) {
      finishTest(completedAnswers);
      return;
    }
  };

  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-[1.75rem] sm:rounded-[2rem] border-2 border-indigo-100 shadow-sm p-5 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center"><BookOpen size={30} /></div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{text('Adaptive Placement Test', '自适应分级测试')}</h2>
            <p className="max-w-2xl text-slate-600 font-medium leading-relaxed mt-2">Correct answers move up, and wrong answers move down to find a good starting level.</p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
          {ADAPTIVE_SECTION_ORDER.map(key => {
            const Icon = SECTION_DETAILS[key].icon;
            return <div key={key} className={`min-h-28 sm:min-h-32 rounded-2xl border p-3 sm:p-4 flex flex-col items-center justify-center ${SECTION_DETAILS[key].bg}`}><Icon size={22} className={`shrink-0 ${SECTION_DETAILS[key].color}`} /><p className="font-black text-sm sm:text-base text-slate-800 mt-2 leading-tight">{SECTION_COUNTS[key]} {sectionName(key)}</p></div>;
          })}
        </div>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-10">
          <label className="block">
            <span className="block text-sm font-extrabold text-slate-700 mb-2">{text('Chinese name', '中文姓名')}</span>
            <input value={chineseName} onChange={event => setChineseName(event.target.value.replace(/\s/g, ''))} placeholder="For example: a Chinese name" maxLength={10} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 font-bold shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500" />
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
      <div className="max-w-4xl mx-auto bg-white rounded-[1.75rem] sm:rounded-[2rem] border-2 border-emerald-100 shadow-sm p-5 sm:p-8 md:p-10 text-center">
        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={36} /></div>
        <p className="mt-5 text-sm font-extrabold tracking-widest uppercase text-emerald-600">{text('Placement complete', '分级测试完成')}</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2">{text(`Suggested Level ${result.recommendedLevel}`, `建议等级 ${result.recommendedLevel}`)}</h2>
        <p className="text-slate-600 font-medium mt-4 max-w-xl mx-auto">{messages[result.recommendedLevel].en}</p>
        <div className="mt-7 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
          {ADAPTIVE_SECTION_ORDER.map(section => {
            const detail = SECTION_DETAILS[section];
            const Icon = detail.icon;
            const score = result.sectionResults[section];
            return <div key={section} className={`rounded-2xl border p-4 sm:p-5 ${detail.bg}`}>
              <Icon size={20} className={detail.color} />
              <p className="mt-2 text-sm font-extrabold text-slate-700">{sectionName(section)}</p>
              <p className="mt-1 text-2xl sm:text-3xl font-black leading-none text-slate-800">{score.correct}<span className="ml-1 text-sm sm:text-base text-slate-500">/ {score.total}</span></p>
            </div>;
          })}
        </div>
        <p className={`mt-6 text-sm font-bold ${saveState === 'saved' ? 'text-emerald-600' : saveState === 'error' ? 'text-amber-700' : 'text-slate-500'}`}>
          {saveState === 'saving' && text('Saving your result…', '正在保存你的结果…')}
          {saveState === 'saved' && text('Your result has been saved.', '你的结果已保存。')}
          {saveState === 'error' && text('Your suggested level is ready, but saving did not work. Please ask your teacher to check the connection.', '你的建议等级已生成，但结果没有保存成功。请让老师检查网络连接。')}
        </p>
        <button onClick={exitCompletedTest} className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold"><LogOut size={18} /> Exit Test</button>
      </div>
    );
  }

  const section = SECTION_DETAILS[activeItem.section];
  const Icon = section.icon;
  const answer = pendingAnswer;
  const isSpeaking = activeItem.section === 'speaking';
  const canContinue = Boolean(answer) && !isEvaluating && !isRecording && !isPreparingMic;
  const isLastQuestion = activeIndex === TOTAL_QUESTIONS - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 text-sm font-extrabold text-slate-500">
        <span>{text(`Question ${activeIndex + 1} of ${TOTAL_QUESTIONS}`, `第 ${activeIndex + 1} 题，共 ${TOTAL_QUESTIONS} 题`)}</span>
        <button onClick={leaveTest} disabled={isEvaluating || isRecording || isPreparingMic} className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 disabled:opacity-50"><LogOut size={16} /> {text('Leave without saving', '退出且不保存')}</button>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${((activeIndex + 1) / TOTAL_QUESTIONS) * 100}%` }} /></div>
      <p className="mb-6 text-xs font-semibold text-slate-500">{text('Leaving before the final result means this test will not be saved.', '在看到最终结果前退出，这次测试不会被保存。')}</p>
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-5 sm:p-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-extrabold ${section.bg} ${section.color}`}><Icon size={16} /> {sectionName(activeItem.section)}</div>
        {activeItem.section === 'reading' && <div className="mt-5 p-4 sm:p-5 bg-amber-50 border border-amber-100 rounded-2xl text-slate-700 font-medium leading-relaxed"><p className="font-black text-slate-800 mb-2">{activeItem.title.en}</p>{activeItem.passage.en}</div>}
        {isSpeaking ? (
          <div className="mt-7 text-center">
            <p className="text-slate-500 font-bold">{text('Read this sentence aloud:', '请大声朗读这句话：')}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed mt-3">“{activeItem.target}”</p>
            <button onClick={() => playTargetAudio(activeItem.target)} className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-extrabold hover:text-indigo-800"><Volume2 size={19} /> Hear it</button>
            <div className="mt-7">
              <div aria-live="polite" className={`min-h-6 flex items-center justify-center gap-2 text-sm font-extrabold ${isRecording ? 'text-rose-600' : isMicReady ? 'text-emerald-600' : 'text-slate-500'}`}>
                {isPreparingMic ? <><Loader2 size={17} className="animate-spin" /> Getting microphone ready…</> : isEvaluating ? <><Loader2 size={17} className="animate-spin" /> Checking your speech…</> : isRecording ? <><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Listening… Tap the microphone when you finish.</> : answer ? <><CheckCircle2 size={17} /> Recording ready. Record again or choose Next question.</> : isMicReady ? <><CheckCircle2 size={17} /> Microphone ready. Tap to record.</> : <><Mic size={17} /> Tap the microphone to get ready.</>}
              </div>
              <button disabled={isEvaluating || isPreparingMic} onClick={toggleRecording} className={`w-32 h-32 rounded-full mx-auto mt-3 flex flex-col items-center justify-center text-white font-black shadow-lg transition-transform active:scale-95 disabled:opacity-60 ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isPreparingMic || isEvaluating ? <Loader2 className="animate-spin" size={30} /> : isRecording ? <Square size={28} /> : <Mic size={30} />}
                <span className="text-xs mt-2">{isPreparingMic ? 'Preparing…' : isEvaluating ? 'Checking…' : isRecording ? 'Stop' : answer ? 'Record again' : 'Record'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeItem.section === 'grammar' && (
              <p className="mt-7 text-sm sm:text-base font-extrabold text-violet-700">Choose the correct word for the blank.</p>
            )}
            <h2 className={`text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed ${activeItem.section === 'grammar' ? 'mt-3' : 'mt-7'}`}>{activeItem.q}</h2>
            <div className="grid gap-3 mt-7">
              {activeItem.options.map((option, index) => {
                const isSelected = answer?.selected === option;
                return <button key={option} onClick={() => recordAnswer(option === activeItem.answer ? 1 : 0, { selected: option })} className={`text-left p-4 rounded-2xl border-2 font-bold transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700'}`}><span className="inline-flex mr-3 w-7 h-7 rounded-full bg-slate-100 items-center justify-center text-sm">{String.fromCharCode(65 + index)}</span>{option}</button>;
              })}
            </div>
            {answer && <p className="mt-4 font-extrabold text-slate-500">Choose Next question to save this answer.</p>}
          </>
        )}
        {recordingError && <p className="mt-5 text-sm font-bold text-rose-600">{recordingError}</p>}
        <button disabled={!canContinue} onClick={nextItem} className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isLastQuestion ? text('See my suggested level', '查看我的建议等级') : text('Next question', '下一题')} <ChevronRight size={20} /></button>
      </div>
    </div>
  );
};
