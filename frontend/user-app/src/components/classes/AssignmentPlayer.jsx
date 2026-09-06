import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { say, card, button, secondary, dateText, errorText } from './shared';

const requestId = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
export const AssignmentPlayer = ({ data, lang, api, onBack }) => {
  const { assignment } = data;
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState(data.attempts || []);
  const [result, setResult] = useState(data.attempts?.at(-1) || null);
  const [review, setReview] = useState(data.review || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(null);
  const sending = useRef(false);
  const selectedCount = Object.keys(answers).length;
  useEffect(() => {
    const leave = event => { if (!result && selectedCount) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [selectedCount, result]);
  const goBack = () => {
    if (!result && selectedCount && !window.confirm(say(lang, 'Leave this extra practice? Answers that have not been submitted will be lost.', '离开这份拓展练习？尚未提交的答案将丢失。'))) return;
    onBack();
  };
  const submit = async () => {
    if (sending.current || selectedCount !== assignment.questions.length) return;
    sending.current = true; setBusy(true); setError('');
    // Keep the same payload for network retries: a lost response must not
    // create a second attempt or change an already saved answer.
    try {
      pending.current ||= { requestId: requestId(), answers: assignment.questions.map(q => ({ questionId: q.id, optionId: answers[q.id] })) };
      const response = await api(`/assignments/${assignment.id}/submit`, pending.current);
      setAttempts(previous => [...previous, response.attempt]); setResult(response.attempt); pending.current = null;
      if (response.review) setReview(response.review);
    } catch (e) {
      if (e.code === 'attempt_limit') {
        try {
          const saved = await api(`/assignments/${assignment.id}`);
          if (saved.attempts?.length) {
            setAttempts(saved.attempts); setResult(saved.attempts.at(-1)); setReview(saved.review || []); pending.current = null;
          } else setError(errorText(lang, e));
        } catch (refreshError) { setError(errorText(lang, refreshError)); }
      } else setError(errorText(lang, e));
    }
    finally { sending.current = false; setBusy(false); }
  };
  return <div className="space-y-6">
    <button className={secondary} disabled={busy} onClick={goBack}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'Back to class', '返回班级')}</button>
    <section className={card}>
      <p className="text-sm font-bold text-indigo-600 mb-2">{say(lang, 'Extra practice', '拓展练习')}</p>
      <h2 className="text-2xl sm:text-3xl font-extrabold break-words">{assignment.title}</h2>
      {assignment.instructions && <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed text-slate-600">{assignment.instructions}</p>}
      {assignment.passage && <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-4 sm:p-6 text-lg leading-loose whitespace-pre-wrap break-words">{assignment.passage}</div>}
    </section>
    {result ? <>
      <section className={card + ' text-center border-emerald-200'}>
        <CheckCircle2 className="text-emerald-600 mx-auto mb-4" size={40} />
        <h3 className="text-3xl font-extrabold">{say(lang, `${result.score} / ${result.total} correct`, `答对 ${result.score} / ${result.total} 题`)}</h3>
        <p className="mt-3 text-emerald-700">{say(lang, 'Your teacher can see your submitted results.', '老师可以查看你提交的成绩。')}</p>
        <p className="mt-2 text-sm text-slate-500">{dateText(lang, result.submittedAt)}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <button onClick={onBack} className={secondary}>{say(lang, 'Back to class', '返回班级')}</button>
          {attempts.length < assignment.maxAttempts && <button className={button} onClick={() => { setResult(null); setAnswers({}); setError(''); pending.current = null; }}>{say(lang, `Try again (${assignment.maxAttempts - attempts.length} left)`, `再试一次（还剩 ${assignment.maxAttempts - attempts.length} 次）`)}</button>}
        </div>
        <p className="mt-4 text-xs text-slate-500">{say(lang, 'All attempts remain visible to your teacher.', '老师可以查看每一次作答记录。')}</p>
      </section>
      <section className={card + ' space-y-5'}>
        <h3 className="text-xl font-extrabold">{say(lang, 'Review your answers', '查看答案')}</h3>
        {assignment.questions.map((q, index) => {
          const response = result.responses.find(r => r.questionId === q.id);
          if (!response) return null;
          const selected = q.options.find(o => o.id === response.optionId)?.text;
          const correct = q.options.find(o => o.id === response.correctOptionId)?.text;
          const explanation = review.find(r => r.id === q.id)?.explanation;
          return <div key={q.id} className={`rounded-2xl border p-4 break-words ${response.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <p className="font-bold">{index + 1}. {q.prompt}</p>
            <p className="mt-2">{say(lang, 'Your answer: ', '你的答案：')}{selected}</p>
            <p className="font-bold mt-1">{say(lang, 'Correct answer: ', '正确答案：')}{correct}</p>
            {explanation && <p className="mt-2 text-slate-600">{explanation}</p>}
          </div>;
        })}
      </section>
    </> : <>
      <p className="text-slate-500 text-sm leading-relaxed">{say(lang, 'Choose one answer for each question. You can change your choices before submitting. Leaving without submitting does not save your answers.', '每题选一个答案。提交前可以修改。未提交就离开，答案不会保存。')}</p>
      {assignment.questions.map((q, index) => <fieldset className={card + ' space-y-4'} key={q.id}>
        <legend className="px-2 text-sm font-bold text-indigo-600">{say(lang, `Question ${index + 1} of ${assignment.questions.length}`, `第 ${index + 1} / ${assignment.questions.length} 题`)}</legend>
        <h3 className="text-xl font-extrabold break-words">{q.prompt}</h3>
        <div role="radiogroup" aria-label={q.prompt} className="space-y-3">
          {q.options.map((o, i) => <button key={o.id} role="radio" aria-checked={answers[q.id] === o.id} disabled={busy || Boolean(pending.current)} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: o.id }))} className={`w-full min-h-14 flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${answers[q.id] === o.id ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'}`}>
            <span className="shrink-0 font-bold">{String.fromCharCode(65 + i)}.</span><span className="break-words min-w-0">{o.text}</span>
          </button>)}
        </div>
      </fieldset>)}
      <section className={card + ' space-y-4'}>
        <p className="font-bold text-slate-500">{say(lang, `${selectedCount} / ${assignment.questions.length} answered`, `已作答 ${selectedCount} / ${assignment.questions.length} 题`)}</p>
        {error && <p role="alert" className="text-rose-600 font-bold">{error}</p>}
        <button className={button + ' w-full'} disabled={busy || selectedCount !== assignment.questions.length} onClick={submit}>{busy ? say(lang, 'Saving…', '正在保存…') : error && pending.current ? say(lang, 'Retry saving', '重试保存') : say(lang, 'Submit extra practice', '提交拓展练习')}</button>
      </section>
    </>}
  </div>;
};
