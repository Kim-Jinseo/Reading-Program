import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { button, secondary, say, mediaUrl, dateText } from './shared';

function SavedAudio({ path, lang }) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState('idle');
  const resource = useRef(null);
  useEffect(() => {
    const entry = { active: true, controller: new AbortController(), url: '' };
    resource.current = entry;
    return () => {
      entry.active = false;
      entry.controller.abort();
      if (entry.url) URL.revokeObjectURL(entry.url);
    };
  }, [path]);
  const listen = async () => {
    const entry = resource.current;
    setState('loading');
    try {
      const value = await mediaUrl(path, entry.controller.signal);
      if (!entry.active) { URL.revokeObjectURL(value); return; }
      entry.url = value;
      setUrl(value);
    } catch {
      if (entry.active) setState('error');
    }
  };
  return url ? <audio controls className="w-full max-w-md" src={url} /> : (
    <button className={secondary + ' w-full sm:w-auto'} disabled={state === 'loading'} onClick={listen}>
      {state === 'loading' ? say(lang, 'Loading audio…', '正在加载录音…') : state === 'error'
        ? say(lang, 'Retry audio', '重试音频') : say(lang, 'Listen to saved recording', '听已提交的录音')}
    </button>
  );
}

function AttemptDetails({ attempt: a, part, lesson, base, query, lang }) {
  const hasScore = Number.isFinite(a.score);
  const fullScore = hasScore && a.total > 0 && a.score === a.total;
  const transcript = String(a.transcript || '').trim();
  const noWords = ['', '""', "''"].includes(transcript);
  return <div className="space-y-5 min-w-0 break-words">
    <p className="text-sm text-slate-500">{say(lang, 'Saved: ', '保存时间：')}{dateText(lang, a.submittedAt)}</p>
    {hasScore && <div className={`rounded-xl border p-4 sm:p-5 ${fullScore ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
      <p className="text-sm font-semibold">{say(lang, 'Your score', '你的成绩')}</p>
      <p className="text-3xl font-extrabold mt-1">{a.score} / {a.total}</p>
      {a.automaticallyAssessed && <p className="mt-2 text-sm">{say(lang, 'Automatic speaking feedback', '口语自动反馈')}</p>}
    </div>}
    {part === 'speaking' && <div className="space-y-3">
      <p className="font-semibold leading-relaxed">{lesson.speaking.sentence}</p>
      <p className="text-slate-600 leading-relaxed">{noWords
        ? say(lang, 'No words were detected in this recording. Listen to the sentence and speak clearly when the microphone is ready.', '这段录音没有识别出单词。先听示范朗读，等麦克风准备好后再清楚地朗读。')
        : <>{say(lang, 'Heard: ', '识别内容：')}{transcript}</>}</p>
    </div>}
    {a.text && <div className="rounded-xl bg-slate-50 p-4 space-y-2">
      <p className="font-semibold">{say(lang, 'Your writing', '你的作文')}</p>
      <p className="whitespace-pre-wrap leading-relaxed">{a.text}</p>
      <p className="text-sm text-slate-500">{say(lang, 'Submitted for your teacher to review.', '已提交，等待老师查看。')}</p>
    </div>}
    {a.feedback && <p className="leading-relaxed text-slate-700">{a.feedback}</p>}
    {a.hasAudio && <SavedAudio key={a.requestId} lang={lang} path={`${base}/audio/${a.requestId}${query}`} />}
    {a.responses?.map(r => {
      const q = lesson[part]?.find(q => q.id === r.questionId);
      return <div key={r.questionId} className="border-t border-slate-100 pt-4 space-y-2">
        <p className="font-semibold">{q?.prompt}</p>
        <p className={r.correct ? 'text-emerald-800' : 'text-amber-900'}>
          {say(lang, 'Your answer: ', '你的答案：')}{q?.options.find(o => o.id === r.optionId)?.text}
          {' · '}{r.correct ? say(lang, 'Correct', '正确') : say(lang, 'Review this answer', '复习这道题')}
        </p>
        {!r.correct && <p className="text-slate-600">{say(lang, 'Correct answer: ', '正确答案：')}{q?.options.find(o => o.id === r.correctOptionId)?.text}</p>}
      </div>;
    })}
  </div>;
}

export function LessonResult({ attempts, part, lesson, base, query, lang, remaining, readOnly, onRetry }) {
  const latest = attempts[attempts.length - 1];
  const repeatable = part === 'speaking' || part === 'writing';
  const rewarded = attempts.some(a => a.rewardStars === 3);
  const details = { part, lesson, base, query, lang };
  return <div className="space-y-6" aria-label={say(lang, 'Activity result', '练习结果')} role="region">
    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
      <CheckCircle2 size={28} aria-hidden="true" className="shrink-0 text-emerald-700" />
      <div className="min-w-0">
        <h4 className="font-bold text-lg text-emerald-900" role="status">{rewarded
          ? say(lang, 'Completed · +3 stars', '已完成 · +3 颗星星')
          : say(lang, 'Activity completed', '本项练习已完成')}</h4>
        <p className="text-sm text-emerald-800 mt-1">{say(lang, 'Your work has been saved.', '你的学习结果已保存。')}</p>
        {rewarded && <p className="text-sm text-emerald-800 mt-2">{say(lang,
          'Awarded once per task. Retrying does not earn more stars.',
          '每项任务只奖励一次，重试不会重复获得星星。')}</p>}
      </div>
    </div>
    <AttemptDetails key={latest.requestId} attempt={latest} {...details} />
    {!readOnly && repeatable && <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
      <p className="text-sm text-slate-600">{remaining > 0
        ? say(lang, `${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`, `还可以尝试 ${remaining} 次`)
        : say(lang, 'All attempts used. You can still review your work.', '作答次数已用完，你仍可以复习已提交的内容。')}</p>
      {remaining > 0 && <button className={button + ' w-full sm:w-auto flex items-center justify-center gap-2'} onClick={onRetry}>
        <RotateCcw size={18} aria-hidden="true" />{say(lang, 'Try again!', '再试一次！')}
      </button>}
    </div>}
    {!repeatable && part !== 'slides' && <p className="text-sm text-slate-600 border-t pt-4">{say(lang, 'One submission only. You can review your answers here.', '本项练习只能提交一次。你可以在这里复习答案。')}</p>}
    {attempts.length > 1 && <details className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <summary className="cursor-pointer py-3 font-semibold text-slate-700">{say(lang, `Previous attempts (${attempts.length - 1})`, `以前的作答（${attempts.length - 1} 次）`)}</summary>
      <div className="mt-4 space-y-6">{attempts.slice(0, -1).reverse().map(a => <div key={a.requestId} className="border-t pt-5"><AttemptDetails attempt={a} {...details} /></div>)}</div>
    </details>}
  </div>;
}
