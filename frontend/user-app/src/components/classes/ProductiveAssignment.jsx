import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LessonSpeaking } from '../lessons/LessonSpeaking';
import { requestId } from '../lessons/shared';
import { AssignmentFeedback } from './AssignmentFeedback';
import { say, card, field, button, secondary, errorText } from './shared';
import { registerNavigationGuard } from '../../utils/navigationGuard';

const knownUnsent = new Set(['writing_unavailable', 'speech_unavailable', 'invalid_input', 'rate_limited']);

export function ProductiveAssignment({ data, lang, api, onBack }) {
  const { assignment } = data;
  const [attempts, setAttempts] = useState(data.attempts || []), [result, setResult] = useState(data.attempts?.at(-1) || null);
  const [writing, setWriting] = useState(''), [recording, setRecording] = useState(null), [micBusy, setMicBusy] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [knownRetry, setKnownRetry] = useState(false);
  const pending = useRef(null), sending = useRef(false);
  const hasDraft = Boolean(writing.trim() || recording || pending.current || micBusy);
  useEffect(() => {
    const leave = event => { if (!result && hasDraft) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [hasDraft, result]);
  useEffect(() => {
    if (result || !hasDraft) return undefined;
    return registerNavigationGuard(() => window.confirm(say(lang, 'Leave this extra practice? Unsubmitted work will be lost.', '离开这份拓展练习？尚未提交的作答将丢失。')));
  }, [hasDraft, result, lang]);
  const goBack = () => {
    if (!result && hasDraft && !window.confirm(say(lang, 'Leave this extra practice? Unsubmitted work will be lost.', '离开这份拓展练习？尚未提交的作答将丢失。'))) return;
    onBack();
  };
  const submit = async () => {
    if (sending.current || (!pending.current && (assignment.format === 'writing' ? !writing.trim() : !recording))) return;
    sending.current = true; setBusy(true); setError(''); setKnownRetry(false);
    pending.current ||= { requestId: requestId(), ...(assignment.format === 'writing' ? { text: writing } : recording) };
    try {
      const response = await api(`/assignments/${assignment.id}/submit`, pending.current);
      setAttempts(previous => previous.some(a => a.requestId === response.attempt.requestId) ? previous : [...previous, response.attempt]);
      setResult(response.attempt); pending.current = null; setWriting(''); setRecording(null);
    } catch (e) {
      if (e.code === 'attempt_limit') {
        try {
          const saved = await api(`/assignments/${assignment.id}`);
          if (saved.attempts?.length) { setAttempts(saved.attempts); setResult(saved.attempts.at(-1)); pending.current = null; }
          else setError(errorText(lang, e));
        } catch (refreshError) { setError(errorText(lang, refreshError)); }
      } else {
        if (knownUnsent.has(e.code)) { pending.current = null; setKnownRetry(true); }
        setError(errorText(lang, e));
      }
    } finally { sending.current = false; setBusy(false); }
  };
  const retry = () => { setResult(null); setWriting(''); setRecording(null); setError(''); setKnownRetry(false); pending.current = null; };
  const submitLabel = busy ? (assignment.format === 'writing' ? say(lang, 'Getting feedback and saving…', '正在获取反馈并保存…') : say(lang, 'Checking recording and saving…', '正在检查录音并保存…'))
    : pending.current ? (assignment.format === 'writing' ? say(lang, 'Retry saving writing', '重试保存作文') : say(lang, 'Retry saving recording', '重试保存录音'))
      : knownRetry ? say(lang, 'Try submission again', '重新提交')
        : assignment.format === 'writing' ? say(lang, 'Submit writing', '提交作文') : say(lang, 'Submit recording', '提交录音');
  return <div className="space-y-6">
    <button className={secondary} disabled={busy || micBusy} onClick={goBack}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'Back to class', '返回班级')}</button>
    <section className={card + ' space-y-3'}><p className="text-sm font-bold text-indigo-600">{say(lang, 'Extra practice', '拓展练习')}</p><h2 className="text-2xl sm:text-3xl font-extrabold break-words">{assignment.title}</h2>{assignment.instructions && <p className="text-slate-600 whitespace-pre-wrap">{assignment.instructions}</p>}</section>
    {result ? <AssignmentFeedback assignment={assignment} attempts={attempts} lang={lang} onRetry={retry} /> : <section className={card + ' space-y-6'}>
      {assignment.format === 'writing' ? <>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2"><p className="text-sm font-semibold text-indigo-800">{say(lang, 'Writing prompt', '写作题目')}</p><p className="text-lg font-bold whitespace-pre-wrap">{assignment.writing?.prompt}</p>{assignment.writing?.promptZh && <p className="text-slate-600">{assignment.writing.promptZh}</p>}</div>
        <label className="block font-bold">{say(lang, 'Your writing', '你的作文')}<textarea className={field + ' mt-2 min-h-48'} maxLength={2000} value={writing} disabled={busy || Boolean(pending.current)} onChange={e => setWriting(e.target.value)} /></label>
        <p className="text-sm text-slate-500 text-right">{writing.length} / 2000</p>
      </> : <LessonSpeaking key={attempts.length} sentence={assignment.speaking?.sentence} hintZh={assignment.speaking?.hintZh} lang={lang} disabled={busy || Boolean(pending.current)} onRecording={setRecording} onStatus={setMicBusy} />}
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 font-semibold text-rose-700">{error}</p>}
      <button type="button" className={button + ' w-full'} disabled={busy || micBusy || (!pending.current && (assignment.format === 'writing' ? !writing.trim() : !recording))} onClick={submit}>{submitLabel}</button>
      <p className="text-sm text-slate-500">{say(lang, `${Math.max(0, assignment.maxAttempts - attempts.length)} attempts remaining. Typing or recording alone does not submit your work.`, `还可以尝试 ${Math.max(0, assignment.maxAttempts - attempts.length)} 次。输入或录音本身不会提交作业。`)}</p>
    </section>}
  </div>;
}
