import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { classroomApi, say, card, secondary, dateText, errorText } from '../classes/shared';

export function TeacherOversight({ role, lang = 'en', api = classroomApi }) {
  const [teacher, setTeacher] = useState(null), [classroom, setClassroom] = useState(null);
  const [cursors, setCursors] = useState([null]), [reload, setReload] = useState(0);
  const [data, setData] = useState(null), [error, setError] = useState('');
  const cursor = cursors[cursors.length - 1];
  const teacherId = teacher?.id, classId = classroom?.id;
  useEffect(() => {
    if (role !== 'admin') return;
    let active = true;
    setData(null); setError('');
    const path = classId ? `/admin/classes/${encodeURIComponent(classId)}/report`
      : teacherId ? `/admin/teachers/${encodeURIComponent(teacherId)}/classes`
        : '/admin/teachers' + (cursor ? `?after=${encodeURIComponent(cursor)}` : '');
    api(path, undefined, { fresh: true })
      .then(result => { if (active) setData(result); })
      .catch(e => { if (active) setError(errorText(lang, e)); });
    return () => { active = false; };
  }, [role, api, teacherId, classId, cursor, reload, lang]);

  if (role !== 'admin') return <p role="alert">{say(lang, 'Administrator access required.', '需要管理员权限。')}</p>;
  const navigate = action => { setData(null); setError(''); action(); };
  const stat = (label, value) => <div><dt className="text-xs sm:text-sm text-slate-500">{label}</dt><dd className="mt-1 text-lg font-bold text-slate-800">{value ?? 0}</dd></div>;
  const pending = value => stat(say(lang, 'Pending requests', '待审批申请'), value);
  return <section className="space-y-6" aria-labelledby="teacher-oversight-title">
    {teacher && <button className={secondary} onClick={() => navigate(() => classroom ? setClassroom(null) : setTeacher(null))}>
      <ArrowLeft size={17} className="inline mr-2" aria-hidden="true" />{classroom ? say(lang, 'Back to classes', '返回班级列表') : say(lang, 'Back to teachers', '返回教师列表')}
    </button>}
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{say(lang, 'Administrator overview · Read-only', '管理员概览 · 只读')}</p>
      <h2 id="teacher-oversight-title" className="text-2xl font-bold tracking-tight break-words">{classroom?.name || teacher?.name || say(lang, 'Teachers overview', '教师概览')}</h2>
      {teacher && <p className="text-sm text-slate-500">{say(lang, 'Teacher: ', '教师：')}{teacher.name}</p>}
      <p className="text-sm leading-relaxed text-slate-500">{say(lang,
        'Class activity and student lesson progress—not a teacher performance score. Student enrollments count each class separately.',
        '这里展示班级活动和学生课程进度，不是教师绩效评分。同一学生加入多个班级时分别计入在班人次。')}</p>
    </header>
    {error && <div role="alert" className={card + ' space-y-3'}><p className="text-rose-700">{error}</p><button className={secondary} onClick={() => setReload(n => n + 1)}>{say(lang, 'Try again', '重试')}</button></div>}
    {!data && !error && <p role="status" className="py-6 text-slate-500">{say(lang, 'Loading overview…', '正在加载概览…')}</p>}

    {data && !teacher && <>
      {!data.teachers.length && <p className={card}>{say(lang, 'No teachers yet.', '暂无教师。')}</p>}
      <div className="grid md:grid-cols-2 gap-4">{data.teachers.map(row => <article key={row.id} className={card + ' space-y-5'}>
        <div className="flex items-center gap-3"><GraduationCap className="text-indigo-500 shrink-0" aria-hidden="true" /><h3 className="text-lg font-bold break-words">{row.name}</h3></div>
        <dl className="grid grid-cols-3 gap-3">{stat(say(lang, 'Classes', '班级'), row.classCount)}{stat(say(lang, 'Student enrollments', '在班人次'), row.studentCount)}{pending(row.pendingCount)}</dl>
        <button className={secondary + ' w-full'} aria-label={say(lang, `View classes: ${row.name}`, `查看班级：${row.name}`)} onClick={() => navigate(() => setTeacher(row))}>{say(lang, 'View classes', '查看班级')} →</button>
      </article>)}</div>
      {(cursors.length > 1 || data.nextCursor) && <nav className="flex justify-between gap-3" aria-label={say(lang, 'Teacher pages', '教师分页')}>
        <button className={secondary} disabled={cursors.length === 1} onClick={() => navigate(() => setCursors(previous => previous.slice(0, -1)))}>{say(lang, 'Previous page', '上一页')}</button>
        <button className={secondary} disabled={!data.nextCursor} onClick={() => navigate(() => setCursors(previous => [...previous, data.nextCursor]))}>{say(lang, 'Next page', '下一页')}</button>
      </nav>}
    </>}

    {data && teacher && !classroom && <>
      {!data.classes.length && <p className={card}>{say(lang, 'This teacher has not created any classes yet.', '这位教师尚未创建班级。')}</p>}
      <div className="grid md:grid-cols-2 gap-4">{data.classes.map(row => <article key={row.id} className={card + ' space-y-5'}>
        <div className="flex items-center gap-3"><Users className="text-indigo-500 shrink-0" aria-hidden="true" /><h3 className="text-lg font-bold break-words">{row.name}</h3></div>
        <dl className="grid grid-cols-2 gap-3">{stat(say(lang, 'Students', '学生'), row.studentCount)}{pending(row.pendingCount)}</dl>
        <button className={secondary + ' w-full'} aria-label={say(lang, `View progress: ${row.name}`, `查看进度：${row.name}`)} onClick={() => navigate(() => setClassroom(row))}>{say(lang, 'View student progress', '查看学生进度')} →</button>
      </article>)}</div>
    </>}

    {data && classroom && <div className="space-y-4">
      <h3 className="text-lg font-bold">{say(lang, `Students (${data.students.length})`, `学生（${data.students.length}）`)}</h3>
      <p className="text-sm text-slate-500">{say(lang, 'Completion means all lesson activities were submitted, not that every answer was correct. Study days count submission dates, not logins.', '完成表示已提交所有课程任务，不代表全部答对。学习天数按提交日期统计，不按登录次数统计。')}</p>
      {!data.students.length && <p className={card}>{say(lang, 'No approved students in this class yet.', '本班暂无已获批准的学生。')}</p>}
      {data.students.map(student => <article key={student.id} className={card + ' space-y-4'}>
        <h4 className="font-bold text-lg break-words">{student.name}</h4>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">{stat(say(lang, 'Lessons completed', '已完成课程'), `${student.completed} / ${student.assigned}`)}{stat(say(lang, 'Study days · last 28 days', '最近 28 天学习天数'), student.studyDays28)}{stat(say(lang, 'Activities submitted', '已提交练习'), student.activitiesSubmitted)}</dl>
        <p className="text-sm text-slate-500">{say(lang, 'Last submission: ', '最近提交：')}<span>{student.lastSubmittedAt ? dateText(lang, student.lastSubmittedAt) : say(lang, 'No submissions yet', '尚未提交')}</span></p>
      </article>)}
    </div>}
  </section>;
}
