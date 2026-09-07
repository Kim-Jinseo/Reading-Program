import React from 'react';
import { Eye } from 'lucide-react';
import { say } from './shared';

export function StudentReviewBanner({ name, className, lang, headingRef, children }) {
  return <section className="student-review-banner" aria-label={say(lang, 'Student review', '学生作业查看')}>
    <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
      <Eye size={19} aria-hidden="true" className="shrink-0" />
      <span>{say(lang, 'Reviewing student work · Read-only', '正在查看学生作业 · 只读')}</span>
    </div>
    <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
      <h2 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="text-2xl font-bold text-slate-950 break-words min-w-0 scroll-mt-28">{name || say(lang, 'Student', '学生')}</h2>
      <p className="text-sm text-slate-600 break-words min-w-0">{className}</p>
    </div>
    {children}
  </section>;
}
