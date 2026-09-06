import React, { useEffect, useRef, useState } from 'react';
import { Users, ShieldCheck, Plus, ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AssignmentEditor } from '../components/classes/AssignmentEditor';
import { AssignmentPlayer } from '../components/classes/AssignmentPlayer';
import { ClassReport } from '../components/classes/ClassReport';
import { classroomApi, say, card, field, button, secondary, subjectName, errorText } from '../components/classes/shared';
import { lessonApi, lessonError } from '../components/lessons/shared';
import { CoursePicker } from '../components/lessons/CoursePicker';
import { ClassLessons } from '../components/lessons/ClassLessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { LessonLibrary } from '../components/lessons/LessonLibrary';

export const ClassesView = ({ api = classroomApi, lessonsApi = lessonApi }) => {
  const { user, setUser, lang } = useAppContext();
  const [classes, setClasses] = useState([]);
  const [mode, setMode] = useState('home');
  const [detail, setDetail] = useState(null);
  const [report, setReport] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(!user.isGuest);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [code, setCode] = useState('');
  const [studentName, setStudentName] = useState(user.name || '');
  const [className, setClassName] = useState('');
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState('');
  const [lesson, setLesson] = useState(null);
  const [lessonRefresh, setLessonRefresh] = useState(0);
  const [teacherCode, setTeacherCode] = useState('');
  const [issued, setIssued] = useState(null);
  const teacher = ['teacher', 'admin'].includes(user.role);
  useEffect(() => {
    if (user.isGuest || !teacher) return;
    let active = true;
    lessonsApi('/collections').then(data => { if (active) setCollections(data.collections); }).catch(e => { if (active) setError(lessonError(e, lang)); });
    return () => { active = false; };
  }, [lessonsApi, user.isGuest, teacher, lang, mode]);
  const language = useRef(lang);
  language.current = lang;
  useEffect(() => {
    if (user.isGuest) return;
    let active = true;
    setLoading(true);
    api('/classes').then(data => { if (active) { setClasses(data.classes); setError(''); } }).catch(e => { if (active) setError(errorText(language.current, e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, user.isGuest, user.username, user.role]);
  const run = async action => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(errorText(lang, e)); } finally { setBusy(false); }
  };
  const openClass = async id => {
    const data = await api(`/classes/${id}`);
    const results = data.isOwner ? await api(`/classes/${id}/report`) : null;
    setDetail(data); setReport(results); setLessonRefresh(v => v + 1); setMode('detail');
  };
  const goHome = () => run(async () => { const data = await api('/classes'); setClasses(data.classes); setDetail(null); setMode('home'); });
  const copyCode = async text => {
    try { await navigator.clipboard.writeText(text); setNotice(say(lang, 'Code copied.', '邀请码已复制。')); }
    catch { setNotice(say(lang, 'Select and copy the code shown here.', '请选中并复制这里显示的邀请码。')); }
  };
  const verify = event => {
    event.preventDefault();
    run(async () => {
      const data = await api('/teacher/verify', { code: teacherCode });
      localStorage.setItem('token', data.token);
      setUser(previous => ({ ...previous, ...data.user, name: data.user.username || previous.name, isGuest: false }));
      setTeacherCode(''); setMode('home');
      setNotice(say(lang, 'Teacher verified. You can now create a class.', '教师身份验证成功。现在可以创建班级了。'));
    });
  };
  if (user.isGuest) return <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-3xl font-extrabold">{say(lang, 'Classes', '班级')}</h1>
    <section className={card + ' space-y-5'}><Users className="text-indigo-600" size={36} /><h2 className="text-xl font-bold">{say(lang, 'Sign in to join your class', '登录后加入班级')}</h2><p className="text-slate-500">{say(lang, 'Use your own account so your teacher can see your assignment results.', '请使用自己的账号，以便老师查看你的作业成绩。')}</p><button className={button} onClick={() => { localStorage.removeItem('isGuest'); setUser(null); }}>{say(lang, 'Sign in / Create account', '登录 / 注册')}</button></section>
  </div>;
  return <div className="max-w-6xl mx-auto pb-6 space-y-6 sm:space-y-8">
    {!['lesson', 'library'].includes(mode) && <header className="flex items-start gap-4"><div className="rounded-2xl bg-indigo-100 text-indigo-600 p-3 shrink-0"><Users size={28} /></div><div><h1 className="text-3xl font-extrabold">{say(lang, 'Classes', '班级')}</h1><p className="mt-2 text-slate-500 leading-relaxed">{teacher ? say(lang, 'Set assignments and follow your students’ learning.', '布置作业，了解学生的学习情况。') : say(lang, 'Join your class, finish assignments, and review your answers.', '加入班级，完成作业，复习答案。')}</p></div></header>}
    {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 break-words">{error}</div>}
    {notice && <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {loading ? <p role="status" className="p-6 text-slate-500">{say(lang, 'Loading classes…', '正在加载班级…')}</p> : <>
      {mode === 'home' && <>
        <section className={card}>
          {teacher ? <form onSubmit={e => { e.preventDefault(); run(async () => { const data = await api('/classes', { name: className, ...(collectionId ? { collectionId } : {}) }); setClassName(''); await openClass(data.class.id); }); }} className="space-y-4">
            <h2 className="text-xl font-extrabold">{say(lang, 'Create a class', '创建班级')}</h2>
            <label className="block font-bold">{say(lang, 'Class name', '班级名称')}<input className={field + ' mt-2'} maxLength={80} required value={className} onChange={e => setClassName(e.target.value)} placeholder={say(lang, 'For example: Monday English', '例如：星期一英语班')} /></label>
            <CoursePicker collections={collections} value={collectionId} onChange={setCollectionId} lang={lang} required={collections.length > 0} />
            <button disabled={busy} className={button} type="submit"><Plus size={18} className="inline mr-2" />{say(lang, 'Create class', '创建班级')}</button>
          </form> : <form onSubmit={e => { e.preventDefault(); run(async () => { const data = await api('/classes/join', { code, displayName: studentName }); setCode(''); await openClass(data.class.id); }); }} className="space-y-5">
            <h2 className="text-xl font-extrabold">{say(lang, 'Join a class', '加入班级')}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block font-bold">{say(lang, 'Class invitation code', '班级邀请码')}<input className={field + ' mt-2 uppercase tracking-wider'} required value={code} onChange={e => setCode(e.target.value)} maxLength={30} autoCapitalize="characters" autoCorrect="off" spellCheck={false} /></label>
              <label className="block font-bold">{say(lang, 'Your name for the teacher', '老师认识的姓名')}<input className={field + ' mt-2'} required maxLength={40} value={studentName} onChange={e => setStudentName(e.target.value)} /></label>
            </div>
            <p className="text-sm text-slate-500">{say(lang, 'When you join, this teacher can see your name, submitted answers, writing, speaking recordings and scores, practice completion counts, and days you submit lesson activities.', '加入后，本班老师可以查看你的姓名、已提交的答案、作文、口语录音和成绩，以及练习完成数量和提交课程练习的学习天数。')}</p>
            <button className={button} disabled={busy} type="submit">{say(lang, 'Join class', '加入班级')}</button>
          </form>}
        </section>
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{say(lang, 'My classes', '我的班级')}</h2><button className={secondary} onClick={goHome} disabled={busy}><RefreshCw size={16} className="inline mr-2" />{say(lang, 'Refresh', '刷新')}</button></div>
          {!classes.length && <p className="text-slate-500">{say(lang, 'No classes yet. Use the form above to get started.', '目前还没有班级。请使用上方的表单开始。')}</p>}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{classes.map(row => <button key={row.id} className={card + ' text-left hover:border-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'} disabled={busy} onClick={() => run(() => openClass(row.id))}><Users className="text-indigo-500 mb-4" size={25} /><h3 className="text-xl font-extrabold break-words">{row.name}</h3><p className="mt-3 text-slate-500">{say(lang, `${row.studentCount} students`, `${row.studentCount} 名学生`)}</p><p className="mt-5 text-indigo-600 font-bold">{say(lang, 'Open class →', '进入班级 →')}</p></button>)}</div>
        </section>
        {!teacher && <details className={card}>
          <summary className="min-h-12 py-3 cursor-pointer font-bold text-indigo-700"><ShieldCheck className="inline mr-2" size={20} />{say(lang, 'Are you a teacher?', '你是老师吗？')}</summary>
          <form onSubmit={verify} className="mt-4 space-y-4">
            <p className="text-sm text-slate-500">{say(lang, 'Ask the website administrator for a private teacher verification code. This is different from a class invitation code.', '请向网站管理员索取教师验证码。教师验证码与班级邀请码不同。')}</p>
            <label className="block font-bold">{say(lang, 'Teacher verification code', '教师验证码')}<input className={field + ' mt-2'} required type="password" autoComplete="off" maxLength={128} value={teacherCode} onChange={e => setTeacherCode(e.target.value)} /></label>
            <button disabled={busy} type="submit" className={button}>{say(lang, 'Verify teacher', '验证教师身份')}</button>
          </form>
        </details>}
        {user.role === 'admin' && <section className={card + ' space-y-4'}>
          <button className={button} onClick={() => { setError(''); setMode('library'); }}>{say(lang, 'Manage lesson library', '管理课程资料库')}</button>
          <h2 className="text-xl font-extrabold">{say(lang, 'Invite a teacher', '邀请教师')}</h2>
          <p className="text-sm text-slate-500">{say(lang, 'Generate a private code for one teacher. It expires after seven days and can be used by one account.', '为一位教师生成私密验证码。七天后过期，仅限一个账号使用。')}</p>
          <button className={button} disabled={busy} onClick={() => run(async () => setIssued(await api('/teacher/invitations', {})))}>{say(lang, 'Generate teacher code', '生成教师验证码')}</button>
          {issued && <div className="space-y-3"><label className="block font-bold">{say(lang, 'Copy this code now', '请立即复制此验证码')}<input readOnly className={field + ' mt-2 font-mono'} value={issued.code} onFocus={e => e.target.select()} /></label><button className={secondary} onClick={() => copyCode(issued.code)}>{say(lang, 'Copy teacher code', '复制教师验证码')}</button></div>}
        </section>}
      </>}
      {mode === 'detail' && detail && <>
        <div className="flex flex-wrap gap-3"><button className={secondary} disabled={busy} onClick={goHome}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'All classes', '所有班级')}</button><button className={secondary} disabled={busy} onClick={() => run(() => openClass(detail.class.id))}><RefreshCw size={16} className="inline mr-2" />{say(lang, 'Refresh results', '刷新成绩')}</button></div>
        <section className={card + ' space-y-5'}>
          <h2 className="text-2xl font-extrabold break-words">{detail.class.name}</h2>
          {detail.isOwner && <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500">{say(lang, 'Share this class invitation code with students', '将此班级邀请码分享给学生')}<input readOnly className={field + ' mt-2 font-mono tracking-widest text-xl'} value={detail.class.invitationCode} onFocus={e => e.target.select()} /></label>
            <div className="flex flex-wrap gap-3"><button className={secondary} onClick={() => copyCode(detail.class.invitationCode)}><Copy className="inline mr-2" size={16} />{say(lang, 'Copy code', '复制邀请码')}</button><button className={secondary} disabled={busy} onClick={() => { if (window.confirm(say(lang, 'Replace this invitation code? The old code will stop working. Current students stay in the class.', '更换班级邀请码？旧码将失效，已加入的学生不受影响。'))) run(async () => { await api(`/classes/${detail.class.id}/invitation`, {}); await openClass(detail.class.id); }); }}>{say(lang, 'Replace code', '更换邀请码')}</button></div>
          </div>}
        </section>
        <ClassLessons key={`lessons-${detail.class.id}-${lessonRefresh}`} classId={detail.class.id} isOwner={detail.isOwner} lang={lang} api={lessonsApi} onOpen={(data, studentId) => { setLesson({ data, studentId }); setMode('lesson'); }} />
        {(detail.isOwner || detail.assignments.length > 0) && <section className="space-y-4">
          {!detail.isOwner && <p className="text-sm font-semibold text-slate-500">{say(lang, 'Assigned by your teacher.', '老师布置的练习。')}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-extrabold">{say(lang, 'Extra practice', '拓展练习')}</h3>{detail.isOwner && <button className={button} onClick={() => { setError(''); setMode('editor'); }}><Plus size={18} className="inline mr-2" />{say(lang, 'Assign extra practice', '布置拓展练习')}</button>}</div>
          {!detail.assignments.length && <p className="text-slate-500">{say(lang, 'Choose website content when your class needs extra practice. Students only see this section after you assign something.', '班级需要额外练习时，可选择网站已有内容。布置练习后，学生才会看到此区域。')}</p>}
          <div className="grid md:grid-cols-2 gap-4">{detail.assignments.map(a => <div key={a.id} className={card}>
            <p className="text-sm font-bold text-indigo-500">{subjectName(lang, a.subject)} · {say(lang, `Level ${a.level}`, `级别 ${a.level}`)}</p><h4 className="mt-2 text-xl font-extrabold break-words">{a.title}</h4>
            <p className="mt-3 text-sm text-slate-500">{say(lang, `${a.questionCount} questions · Up to ${a.maxAttempts} attempts`, `${a.questionCount} 道题 · 最多可作答 ${a.maxAttempts} 次`)}</p>
            {!detail.isOwner && <>
              <p className={`mt-4 font-bold ${a.progress.count ? 'text-emerald-700' : 'text-slate-500'}`}>{a.progress.count ? say(lang, `Latest: ${a.progress.latest.score} / ${a.progress.latest.total} · Best: ${a.progress.best.score} / ${a.progress.best.total}`, `最近：${a.progress.latest.score} / ${a.progress.latest.total} · 最佳：${a.progress.best.score} / ${a.progress.best.total}`) : say(lang, 'Not submitted', '尚未提交')}</p>
              <button className={button + ' mt-4 w-full'} disabled={busy} onClick={() => run(async () => { setAssignment(await api(`/assignments/${a.id}`)); setMode('player'); })}>{a.progress.count ? say(lang, 'Review / Try again', '查看 / 再次作答') : say(lang, 'Start extra practice', '开始拓展练习')}</button>
            </>}
          </div>)}</div>
        </section>}
        {detail.isOwner && report && <ClassReport key={detail.class.id} report={report} lang={lang} api={api} />}
      </>}
      {mode === 'editor' && detail?.isOwner && <AssignmentEditor lang={lang} classId={detail.class.id} api={api} onBack={() => run(() => openClass(detail.class.id))} onPublished={() => run(() => openClass(detail.class.id))} />}
      {mode === 'player' && assignment && <AssignmentPlayer key={assignment.assignment.id} data={assignment} lang={lang} api={api} onBack={() => run(() => openClass(detail.class.id))} />}
      {mode === 'lesson' && lesson && <LessonPlayer key={`${lesson.data.lesson.id}:${lesson.studentId || 'self'}`} data={lesson.data} studentId={lesson.studentId} classId={detail.class.id} lang={lang} api={lessonsApi} onBack={() => run(() => openClass(detail.class.id))} />}
      {mode === 'library' && user.role === 'admin' && <LessonLibrary lang={lang} api={lessonsApi} onBack={() => setMode('home')} />}
    </>}
  </div>;
};
