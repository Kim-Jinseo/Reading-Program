import React from 'react';
import { LessonVocabulary } from '../lessons/LessonVocabulary';
import { say, button, card } from './shared';

const bilingual = (lang, value) => value?.[lang === 'zh' ? 'zh' : 'en'] || value?.en || value?.zh || '';

export function AssignmentLearning({ assignment, lang, onStart, returning = false }) {
  const startLabel = returning ? say(lang, 'Return to quiz', '返回答题') : say(lang, 'Start quiz', '开始答题');
  if (assignment.subject === 'vocab') {
    return <section className={card + ' space-y-5'} aria-label={say(lang, 'Vocabulary learning', '词汇学习')}>
      <LessonVocabulary words={assignment.learning?.words || []} lang={lang} onStart={onStart} startLabel={startLabel} />
    </section>;
  }
  return <section className={card + ' space-y-5'} aria-label={say(lang, 'Grammar learning', '语法学习')}>
    <div>
      <h3 className="text-xl font-extrabold">{say(lang, 'Learn the grammar first', '先学语法')}</h3>
      <p className="mt-2 text-slate-600">{say(lang, 'Read the explanation and examples before answering. Learning does not use an attempt.', '先阅读讲解和例句，再开始答题。学习不会使用作答次数。')}</p>
    </div>
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-2">
      <h4 className="font-bold text-slate-800">{say(lang, 'Explanation', '讲解')}</h4>
      <p className="whitespace-pre-wrap leading-relaxed">{bilingual(lang, assignment.learning?.description)}</p>
    </div>
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5 space-y-2">
      <h4 className="font-bold text-indigo-900">{say(lang, 'Rule and examples', '规则和例句')}</h4>
      <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{bilingual(lang, assignment.learning?.rule)}</p>
    </div>
    <button type="button" className={button + ' w-full'} onClick={onStart}>{startLabel}</button>
  </section>;
}
