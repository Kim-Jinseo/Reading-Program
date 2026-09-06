import React, { useEffect, useRef, useState } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { authHeaders, button, secondary, say } from './shared';

function WordAudio({ word, lang }) {
  const [state, setState] = useState('idle');
  const resource = useRef(null);
  useEffect(() => {
    const entry = { active: true, busy: false, controller: new AbortController() };
    resource.current = entry;
    return () => {
      entry.active = false;
      entry.controller.abort();
      entry.audio?.pause();
      if (entry.url) URL.revokeObjectURL(entry.url);
    };
  }, []);
  const listen = async () => {
    const entry = resource.current;
    if (!entry || entry.busy) return;
    entry.busy = true;
    setState('loading');
    const finish = (value) => { if (entry.active) { entry.busy = false; setState(value); } };
    try {
      if (!entry.audio) {
        const response = await fetch(`/api/audio/tts?text=${encodeURIComponent(word)}`, { headers: authHeaders(), signal: entry.controller.signal });
        if (!response.ok) throw Error('Audio unavailable');
        const blob = await response.blob();
        if (!entry.active) return;
        entry.url = URL.createObjectURL(blob);
        entry.audio = new Audio(entry.url);
        entry.audio.onended = () => finish('idle');
        entry.audio.onerror = () => finish('error');
        entry.audio.onpause = () => { if (entry.busy) finish('idle'); };
        const interrupted = () => { entry.audio.pause(); finish('error'); };
        entry.audio.onstalled = interrupted;
        entry.audio.onabort = interrupted;
      }
      entry.audio.currentTime = 0;
      await entry.audio.play();
      if (entry.active && entry.busy) setState('playing');
    } catch { finish('error'); }
  };
  return <div className="space-y-2 text-center">
    <button type="button" className={secondary + ' inline-flex items-center justify-center gap-2 w-full sm:w-auto'} disabled={state === 'loading' || state === 'playing'} onClick={listen}>
      <Volume2 size={20} aria-hidden="true" />{state === 'loading' ? say(lang, 'Loading audio…', '正在加载发音…')
        : state === 'playing' ? say(lang, 'Playing…', '正在播放…') : say(lang, 'Hear the word', '听单词发音')}
    </button>
    {state === 'error' && <p role="alert" className="text-sm text-rose-700">{say(lang, 'Audio could not play. Tap to try again.', '发音播放失败，请点击重试。')}</p>}
  </div>;
}

export function LessonVocabulary({ words, lang, onStart }) {
  const [index, setIndex] = useState(0), [flipped, setFlipped] = useState(false);
  const current = words[index];
  if (!current) return null;
  const move = next => { setIndex(next); setFlipped(false); };
  return <div className="max-w-2xl mx-auto space-y-5">
    <div className="space-y-2">
      <h4 className="text-xl font-extrabold">{say(lang, 'Learn the words first', '先学单词')}</h4>
      <p className="text-slate-600 leading-relaxed">{say(lang, 'Listen, then flip each card to see its Chinese meaning. When you are ready, try the questions.', '先听发音，再翻卡片看中文意思。准备好后再答题。')}</p>
    </div>
    <p className="text-sm font-bold text-slate-500 text-center" aria-live="polite">{say(lang, `Word ${index + 1} of ${words.length}`, `第 ${index + 1} / ${words.length} 个单词`)}</p>
    <button type="button" aria-label={say(lang, 'Flip card: ' + (flipped ? current.meaningZh : current.word), '翻卡片：' + (flipped ? current.meaningZh : current.word))}
      aria-pressed={flipped} onClick={() => setFlipped(value => !value)}
      className={`w-full min-h-56 sm:min-h-64 p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 ${flipped ? 'bg-emerald-50 border-emerald-300' : 'bg-sky-50 border-sky-200'}`}>
      <span className="text-sm font-semibold text-slate-500">{flipped ? say(lang, 'Chinese meaning', '中文意思') : say(lang, 'English word', '英语单词')}</span>
      <span className="text-3xl sm:text-4xl font-extrabold break-words max-w-full" lang={flipped ? 'zh-CN' : 'en'}>{flipped ? current.meaningZh : current.word}</span>
      <span className="text-sm text-slate-600 flex items-center gap-2"><RotateCcw size={16} aria-hidden="true" />{say(lang, 'Tap to flip', '点击翻面')}</span>
    </button>
    <WordAudio key={current.word} word={current.word} lang={lang} />
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className={secondary} disabled={index === 0} onClick={() => move(index - 1)}>{say(lang, 'Previous word', '上一个单词')}</button>
      <button type="button" className={secondary} disabled={index === words.length - 1} onClick={() => move(index + 1)}>{say(lang, 'Next word', '下一个单词')}</button>
    </div>
    {onStart && <button type="button" className={button + ' w-full'} onClick={onStart}>{say(lang, 'Start vocabulary practice', '开始词汇练习')}</button>}
    <p className="text-sm text-slate-500 text-center">{say(lang, 'Learning the cards does not submit the task or use your attempt.', '学习卡片不会提交任务，也不会使用作答次数。')}</p>
  </div>;
}
