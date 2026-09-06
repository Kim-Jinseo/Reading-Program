import React, { useEffect, useRef, useState } from 'react';
import { ClassReport } from './ClassReport';
import { say, card, secondary, dateText } from './shared';
import { lessonError } from '../lessons/shared';

export function StudentProfile({ student, report, lessonReport, classId, className, lang, api, lessonsApi, onBack, onOpen, refreshKey, visible = true }) {
  const [tab, setTab] = useState('overview'), [work, setWork] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const epoch = useRef(0), language = useRef(lang), heading = useRef(null);
  language.current = lang;
  useEffect(() => { heading.current?.focus(); heading.current?.scrollIntoView?.({ block: 'start' }); }, []);
  const lessonProgress = lessonReport.students.find(s => s.id === student.id);
  const practice = report.students.find(s => s.id === student.id);
  const last = [lessonProgress?.lastSubmittedAt, practice?.lastSubmittedAt].filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];
  useEffect(() => {
    if (tab !== 'lessons' || !visible) return;
    let active = true;
    const requests = epoch;
    requests.current++;
    setBusy(true); setError('');
    lessonsApi(`/classes/${classId}/students/${student.id}`, undefined, { fresh: refreshKey > 0 || reload > 0 })
      .then(data => { if (active) setWork(data); })
      .catch(e => { if (active) { setWork(null); setError(lessonError(e, language.current)); } })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; requests.current++; };
  }, [lessonsApi, classId, student.id, tab, refreshKey, reload, visible]);
  useEffect(() => {
    const requests = epoch;
    return () => { requests.current++; };
  }, []);
  const openLesson = async id => {
    if (busy) return;
    const request = epoch.current;
    setBusy(true); setError('');
    try {
      const data = await lessonsApi(`/classes/${classId}/lessons/${id}?studentId=${encodeURIComponent(student.id)}`);
      if (request === epoch.current) onOpen(data, student.id);
    } catch (e) { if (request === epoch.current) setError(lessonError(e, language.current)); }
    finally { if (request === epoch.current) setBusy(false); }
  };
  const stat = (label, value) => <div className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-2 text-2xl font-extrabold">{value}</dd></div>;
  return <section className="space-y-6" aria-label={say(lang, 'Student profile', '学生学习档案')}>
    <button className={secondary} onClick={onBack}>{say(lang, 'Back to students', '返回学生列表')}</button>
    <header className={card + ' space-y-2'}><p className="text-sm font-semibold text-indigo-600">{className} · {say(lang, 'Student profile', '学生学习档案')}</p><h2 ref={heading} tabIndex={-1} className="text-2xl sm:text-3xl font-extrabold break-words scroll-mt-28">{student.name}</h2><p className="text-slate-500 text-sm">{say(lang, 'Last submission: ', '最近提交：')}{last ? dateText(lang, last) : say(lang, 'No submissions yet', '尚未提交')}</p></header>
    <nav aria-label={say(lang, 'Student profile sections', '学生档案栏目')} className="grid grid-cols-3 gap-2">
      {['overview', 'lessons', 'practice'].map((key, i) => <button key={key} aria-pressed={tab === key} className={secondary + (tab === key ? ' !bg-indigo-50 !border-indigo-400 !text-indigo-700' : '')} onClick={() => { if (key === tab) return; epoch.current++; setTab(key); setError(''); }}>{say(lang, ['Overview', 'Lesson work', 'Extra practice'][i], ['概览', '课程作业', '拓展练习'][i])}</button>)}
    </nav>
    {tab === 'overview' && <div className="space-y-5">
      <section className={card + ' space-y-4'}><h3 className="text-xl font-bold">{say(lang, 'Lesson progress', '课程进度')}</h3><dl className="grid grid-cols-2 gap-3">{stat(say(lang, 'Lessons completed', '已完成课程'), lessonProgress ? `${lessonProgress.completed} / ${lessonProgress.assigned}` : '—')}{stat(say(lang, 'Study days · last 28 days', '最近 28 天的学习天数'), lessonProgress?.studyDays28 ?? '—')}</dl><p className="text-sm text-slate-500 leading-relaxed">{say(lang, 'Study days count submitted activities, not logins or time spent. All five submitted tasks complete a lesson; completion does not mean every answer was correct.', '学习天数统计提交练习的日期，不计算登录或学习时长。五项任务均提交即为完成一课，不代表全部答对。')}</p></section>
      <section className={card + ' space-y-4'}><h3 className="text-xl font-bold">{say(lang, 'Assigned extra practice', '老师布置的拓展练习')}</h3><dl className="grid grid-cols-2 gap-3">{stat(say(lang, 'Completed', '已完成'), practice ? `${practice.completed} / ${practice.assigned}` : '—')}{stat(say(lang, 'Average latest score', '最近成绩平均分'), practice?.averagePercent == null ? '—' : `${practice.averagePercent}%`)}</dl><p className="text-sm text-slate-500">{say(lang, 'These scores are separate from lesson results.', '此处成绩与课程作业成绩分开记录。')}</p></section>
    </div>}
    {tab === 'lessons' && <div className="space-y-4">
      {busy && <p role="status">{say(lang, 'Loading lesson work…', '正在加载课程作业…')}</p>}
      {error && <div role="alert" className={card}><p className="text-rose-700">{error}</p><button className={secondary + ' mt-3'} onClick={() => setReload(n => n + 1)}>{say(lang, 'Try loading again', '重新加载')}</button></div>}
      {work?.lessons.map(lesson => <button key={lesson.id} className={card + ' w-full text-left space-y-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'} disabled={busy} onClick={() => openLesson(lesson.id)}>
        <span className="font-bold block break-words">{say(lang, lesson.title, lesson.titleZh)}</span>
        <span className="text-sm text-slate-500 block">{lesson.progress.done.length} / 5 {say(lang, 'activities completed', '项任务已完成')}{lesson.archived ? say(lang, ' · Earlier course', ' · 往期课程') : ''}</span>
        <span className="text-indigo-600 font-semibold block">{say(lang, 'View activities and feedback →', '查看作答和反馈 →')}</span>
      </button>)}
      {work && !work.lessons.length && <p className={card}>{say(lang, 'No lesson work is available yet.', '暂无课程作业。')}</p>}
    </div>}
    {tab === 'practice' && <ClassReport key={`${student.id}:${refreshKey}`} report={{ ...report, class: { id: classId } }} lang={lang} api={api} profileStudentId={student.id} />}
  </section>;
}
