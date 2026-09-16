import React, { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { say, button, secondary } from './shared';

const themes = {
  neutral: { badge: 'bg-slate-50 border-slate-200 text-slate-700', border: 'border-slate-200', progress: 'bg-slate-500', selected: 'border-slate-600 bg-slate-50 text-slate-900', focus: 'focus-visible:outline-slate-600' },
  reading: { badge: 'bg-emerald-50 border-emerald-200 text-teal-800', border: 'border-emerald-200', progress: 'bg-teal-500', selected: 'border-teal-600 bg-teal-50 text-teal-900', focus: 'focus-visible:outline-teal-600' },
  vocab: { badge: 'bg-sky-50 border-sky-200 text-sky-800', border: 'border-sky-200', progress: 'bg-sky-500', selected: 'border-sky-600 bg-sky-50 text-sky-900', focus: 'focus-visible:outline-sky-600' },
  grammar: { badge: 'bg-indigo-50 border-indigo-200 text-indigo-800', border: 'border-indigo-200', progress: 'bg-indigo-500', selected: 'border-indigo-600 bg-indigo-50 text-indigo-900', focus: 'focus-visible:outline-indigo-600' },
};

export function AssignmentQuiz({ assignment, lang, answers, onAnswer, index, onIndex, locked, busy, error, retrySaving, onSubmit, onLearn }) {
  const [peek, setPeek] = useState(false);
  const heading = useRef(null), container = useRef(null), choices = useRef([]);
  const theme = themes[assignment.subject] || themes.neutral;
  const q = assignment.questions[index], total = assignment.questions.length;
  const answered = Object.keys(answers).length;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    container.current?.scrollIntoView?.({ block: 'start' });
  }, [index]);
  if (!q) return <p className="text-slate-500">{say(lang, 'No questions are available for this practice.', '此练习暂无题目。')}</p>;
  return <section ref={container} className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-8 scroll-mt-24" aria-label={say(lang, 'Practice questions', '练习题')}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${theme.badge}`}>{say(lang, `Question ${index + 1} of ${total}`, `第 ${index + 1} / ${total} 题`)}</span>
      {assignment.passage && <button type="button" aria-expanded={peek} aria-controls="assigned-story-reference" onClick={() => setPeek(value => !value)} className="inline-flex items-center gap-2 min-h-10 px-4 py-2 bg-amber-50 text-amber-800 font-bold text-sm rounded-full border border-amber-200 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"><Eye size={18} aria-hidden="true" />{peek ? say(lang, 'Hide story', '收起故事') : say(lang, 'Peek story', '查看故事')}</button>}
      {onLearn && <button type="button" className={secondary + ' text-sm'} disabled={locked} onClick={onLearn}>{assignment.subject === 'vocab' ? say(lang, 'Review word cards', '复习单词卡片') : say(lang, 'Review grammar explanation', '复习语法讲解')}</button>}
    </div>
    {assignment.passage && <div id="assigned-story-reference" hidden={!peek} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <h3 className="font-bold mb-3">{say(lang, 'Story reference', '故事参考')}</h3><p className="whitespace-pre-wrap break-words leading-loose text-lg">{assignment.passage}</p>
    </div>}
    <div role="progressbar" aria-label={say(lang, 'Question progress', '题目进度')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1} className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
      <div className={`h-full rounded-full transition-all ${theme.progress}`} style={{ width: `${(index + 1) / total * 100}%` }} />
    </div>
    <div className={`p-6 sm:p-10 rounded-[2.5rem] text-center bg-white border-2 shadow-lg ${theme.border}`}>
      <h3 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-extrabold leading-relaxed break-words outline-none">{q.prompt}</h3>
    </div>
    <div role="radiogroup" aria-label={q.prompt} className="grid grid-cols-1 gap-4">
      {q.options.map((option, i) => <button type="button" key={option.id} ref={element => { choices.current[i] = element; }} role="radio" aria-checked={answers[q.id] === option.id} tabIndex={answers[q.id] === option.id || (!answers[q.id] && i === 0) ? 0 : -1} disabled={locked} onClick={() => onAnswer(q.id, option.id)} onKeyDown={event => {
        if (locked || !['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? q.options.length - 1 : (i + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + q.options.length) % q.options.length;
        onAnswer(q.id, q.options[next].id);
        choices.current[next]?.focus();
      }} className={`w-full p-5 sm:p-6 border-2 rounded-2xl text-lg sm:text-xl font-bold transition-colors shadow-sm flex items-center gap-4 text-left disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focus} ${answers[q.id] === option.id ? theme.selected : 'bg-white border-slate-100 text-slate-800 hover:border-slate-300'}`}>
        <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0">{String.fromCharCode(65 + i)}.</span><span className="min-w-0 break-words">{option.text}</span>
        {answers[q.id] === option.id && <span aria-hidden="true" className="ml-auto text-xs font-bold shrink-0">{say(lang, 'Selected', '已选择')}</span>}
      </button>)}
    </div>
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{say(lang, `${answered} / ${total} answered · You can change answers before submitting.`, `已作答 ${answered} / ${total} 题 · 提交前可以修改答案。`)}</p>
      {error && <p role="alert" className="text-rose-600 font-bold">{error}</p>}
      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" className={secondary} disabled={locked || index === 0} onClick={() => onIndex(index - 1)}>{say(lang, 'Previous question', '上一题')}</button>
        {index < total - 1 ? <button type="button" className={button} disabled={locked || !answers[q.id]} onClick={() => onIndex(index + 1)}>{say(lang, 'Next question', '下一题')}</button>
          : <button type="button" className={button} disabled={busy || answered !== total} onClick={onSubmit}>{busy ? say(lang, 'Saving…', '正在保存…') : retrySaving ? say(lang, 'Retry saving', '重试保存') : say(lang, 'Submit extra practice', '提交拓展练习')}</button>}
      </div>
      <p className="text-xs text-slate-500">{say(lang, 'Answers are saved only when you submit. Leaving now does not save your answers.', '点击提交后才会保存答案。直接离开不会保存。')}</p>
    </div>
  </section>;
}
