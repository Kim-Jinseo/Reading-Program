import React, { useEffect, useRef, useState } from 'react';
import { button, secondary, say } from './shared';

export function LessonQuiz({ questions, answers, onChange, lang, disabled, busy, pending, readOnly, onSubmit, onLearn }) {
  const [index, setIndex] = useState(0);
  const heading = useRef(null), first = useRef(true);
  useEffect(() => {
    if (first.current) first.current = false;
    else heading.current?.focus();
  }, [index]);
  const q = questions[index];
  const frozen = disabled || busy || pending;
  const complete = questions.every(item => answers[item.id]);
  return <div className="max-w-2xl mx-auto space-y-6">
    {onLearn && <button type="button" className={secondary} disabled={frozen} onClick={onLearn}>{say(lang, 'Back to word cards', '返回单词卡片')}</button>}
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-wide font-bold text-slate-500">{say(lang, `Question ${index + 1} of ${questions.length}`, `第 ${index + 1} / ${questions.length} 题`)}</p>
      <p className="text-slate-600">{say(lang, 'Choose the correct answer.', '请选择正确答案。')}</p>
    </div>
    <fieldset disabled={frozen} className="space-y-3">
      <legend ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-extrabold leading-snug mb-6 break-words focus:outline-none">{q.prompt}</legend>
      {q.options.map((o, i) => {
        const selected = answers[q.id] === o.id;
        return <label key={o.id} className={`relative flex items-center gap-3 sm:gap-4 border-2 rounded-2xl p-4 sm:p-5 min-h-[72px] focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${frozen ? 'cursor-default' : 'cursor-pointer'} ${selected ? 'bg-indigo-50 border-indigo-500 text-indigo-950' : 'border-slate-200 bg-white text-slate-700'}`}>
          <input type="radio" className="sr-only" name={q.id} value={o.id} aria-label={`${String.fromCharCode(65 + i)}. ${o.text}`}
            checked={selected} onChange={() => onChange({ ...answers, [q.id]: o.id })} />
          <span aria-hidden="true" className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{String.fromCharCode(65 + i)}</span>
          <span className="min-w-0 flex-1 font-semibold text-lg break-words">{o.text}</span>
          {selected && <span aria-hidden="true" className="text-xs font-bold text-indigo-700 shrink-0">{say(lang, 'Selected', '已选择')}</span>}
        </label>;
      })}
    </fieldset>
    {!readOnly && <p className="text-sm text-slate-500">{say(lang, 'One submission only. You can go back and change your answers before submitting the whole activity.', '只能提交一次。提交整项练习前，可以返回修改答案。')}</p>}
    <div className="flex flex-col sm:flex-row gap-3">
      <button type="button" className={secondary + ' sm:flex-1'} disabled={index === 0 || busy || pending} onClick={() => setIndex(value => value - 1)}>{say(lang, 'Previous question', '上一题')}</button>
      {index < questions.length - 1
        ? <button type="button" className={button + ' sm:flex-1'} disabled={busy || pending || (!readOnly && !answers[q.id])} onClick={() => setIndex(value => value + 1)}>{say(lang, 'Next question', '下一题')}</button>
        : !readOnly && <button type="button" className={button + ' sm:flex-1'} disabled={disabled || busy || (!complete && !pending)} onClick={onSubmit}>{busy ? say(lang, 'Saving…', '正在保存…') : pending ? say(lang, 'Retry saving this answer', '重试保存这份答案') : say(lang, 'Submit this activity', '提交本项练习')}</button>}
    </div>
  </div>;
}
