import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { assignmentMediaUrl, say, card, secondary, dateText } from './shared';

function SavedAssignmentAudio({ path, lang }) {
  const [url, setUrl] = useState(''), [state, setState] = useState('idle');
  const resource = useRef(null);
  useEffect(() => {
    setUrl('');
    setState('idle');
    const entry = { active: true, controller: new AbortController(), url: '' };
    resource.current = entry;
    return () => {
      entry.active = false;
      entry.controller.abort();
      if (entry.url) URL.revokeObjectURL(entry.url);
    };
  }, [path]);
  const load = async () => {
    const entry = resource.current;
    setState('loading');
    try {
      const value = await assignmentMediaUrl(path, entry.controller.signal);
      if (!entry.active) { URL.revokeObjectURL(value); return; }
      entry.url = value; setUrl(value); setState('ready');
    } catch { if (entry.active) setState('error'); }
  };
  return url ? <audio controls className="w-full max-w-md" src={url} aria-label={say(lang, 'Saved recording', '已保存的录音')} />
    : <button type="button" className={secondary + ' w-full sm:w-auto'} disabled={state === 'loading'} onClick={load}>{state === 'loading' ? say(lang, 'Loading audio…', '正在加载录音…') : state === 'error' ? say(lang, 'Retry audio', '重试音频') : say(lang, 'Listen to saved recording', '听已提交的录音')}</button>;
}

function Attempt({ assignment, attempt, lang, reviewing, audioQuery = '' }) {
  const feedback = attempt.writingFeedback;
  const transcript = String(attempt.transcript || '').trim();
  const hasTranscript = !['', '""', "''"].includes(transcript);
  return <div className="space-y-5 min-w-0 break-words">
    <p className="text-sm text-slate-500">{say(lang, 'Submitted: ', '提交时间：')}{dateText(lang, attempt.submittedAt)}</p>
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-sm font-semibold text-slate-600">{reviewing ? say(lang, 'Student score', '学生成绩') : say(lang, 'Your score', '你的成绩')}</p>
      <p className="text-3xl font-extrabold mt-1 text-slate-900">{attempt.score} / {attempt.total}</p>
      {attempt.automaticallyAssessed && <p className="text-sm text-slate-500 mt-2">{assignment.format === 'writing' ? say(lang, 'AI writing feedback', 'AI 写作反馈') : say(lang, 'Automatic speaking feedback', '口语自动反馈')}</p>}
    </div>
    {assignment.format === 'writing' && <div className="rounded-xl bg-slate-50 p-4 space-y-2"><h5 className="font-bold">{reviewing ? say(lang, 'Student writing', '学生作文') : say(lang, 'Your writing', '你的作文')}</h5><p className="whitespace-pre-wrap leading-relaxed">{attempt.text}</p></div>}
    {feedback && <div className="space-y-3">{[
      ['feedback', say(lang, 'Feedback', '反馈')],
      ['corrections', say(lang, 'Corrections', '修改建议')],
      ['improvement', say(lang, 'One thing to try next', '下一步试一试')],
    ].map(([key, title]) => <section key={key} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"><h5 className="font-bold text-indigo-900">{title}</h5><p className="mt-2 whitespace-pre-wrap text-slate-700">{say(lang, feedback[key], feedback[`${key}Zh`])}</p></section>)}</div>}
    {assignment.format === 'speaking' && <div className="space-y-3"><p className="font-bold">{assignment.speaking?.sentence}</p><p className="text-slate-600">{attempt.speechDetected === false
      ? say(lang, 'No words were detected in this submitted recording.', '这段已提交的录音没有识别出单词。')
      : hasTranscript ? <>{say(lang, 'Heard: ', '识别内容：')}{transcript}</>
        : say(lang, 'Transcript unavailable. This does not mean the recording was silent.', '暂无识别文本，这不代表录音没有声音。')}</p>{attempt.feedback && <p className="leading-relaxed">{attempt.feedback}</p>}</div>}
    {attempt.hasAudio && <SavedAssignmentAudio path={`/assignments/${assignment.id}/audio/${attempt.requestId}${audioQuery}`} lang={lang} />}
  </div>;
}

export function AssignmentFeedback({ assignment, attempts, lang, reviewing = false, audioQuery = '', onRetry }) {
  const latest = attempts.at(-1);
  const remaining = Math.max(0, assignment.maxAttempts - attempts.length);
  if (!latest) return null;
  return <section className={card + ' space-y-6'} aria-label={say(lang, 'Assignment feedback', '作业反馈')}>
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <CheckCircle2 className="shrink-0 text-blue-600" size={26} aria-hidden="true" />
      <div><h3 className="text-xl font-extrabold" role="status">{assignment.format === 'writing' ? say(lang, 'Writing completed', '写作已完成') : say(lang, 'Speaking completed', '口语已完成')}</h3><p className="mt-1 text-slate-600">{reviewing ? say(lang, 'Submitted student work · Read-only', '学生已提交的作业 · 只读') : say(lang, 'Your work has been saved.', '你的作业已保存。')}</p></div>
    </div>
    <Attempt assignment={assignment} attempt={latest} lang={lang} reviewing={reviewing} audioQuery={audioQuery} />
    {!reviewing && <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><p className="text-sm text-slate-600">{remaining ? say(lang, `${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`, `还可以尝试 ${remaining} 次`) : say(lang, 'All attempts used. You can still review your work.', '作答次数已用完，你仍可以复习作业。')}</p>{remaining > 0 && <button type="button" className={secondary} onClick={onRetry}>{say(lang, 'Try again', '再试一次')}</button>}</div>}
    {attempts.length > 1 && <details className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer py-2 font-bold">{say(lang, `Previous attempts (${attempts.length - 1})`, `以前的作答（${attempts.length - 1} 次）`)}</summary><div className="mt-4 space-y-6">{attempts.slice(0, -1).reverse().map(attempt => <div key={attempt.requestId} className="border-t border-slate-200 pt-5"><Attempt assignment={assignment} attempt={attempt} lang={lang} reviewing={reviewing} audioQuery={audioQuery} /></div>)}</div></details>}
  </section>;
}
