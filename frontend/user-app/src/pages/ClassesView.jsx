import React, { useEffect, useRef, useState } from 'react';
import { Users, ShieldCheck, Plus, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AssignmentEditor } from '../components/classes/AssignmentEditor';
import { AssignmentPlayer } from '../components/classes/AssignmentPlayer';
import { TeacherClassView } from '../components/classes/TeacherClassView';
import { classroomApi, say, card, field, button, secondary, subjectName, assignmentSummary, errorText } from '../components/classes/shared';
import { lessonApi, lessonError } from '../components/lessons/shared';
import { CoursePicker } from '../components/lessons/CoursePicker';
import { ClassLessons } from '../components/lessons/ClassLessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { LessonLibrary } from '../components/lessons/LessonLibrary';
import { applyLessonRewardSnapshot } from '../utils/lessonRewards';

export const ClassesView = props => {
  const { user } = useAppContext();
  return <ClassesScreen key={`${user.username}:${user.role}:${user.isGuest}:${localStorage.getItem('token') || ''}`} {...props} />;
};
const ClassesScreen = ({ api = classroomApi, lessonsApi = lessonApi }) => {
  const { user, setUser, lang } = useAppContext();
  const [classes, setClasses] = useState([]);
  const [mode, setMode] = useState('home');
  const [detail, setDetail] = useState(null);
  const [openingName, setOpeningName] = useState('');
  const [lessonPreload, setLessonPreload] = useState(null);
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
  const language = useRef(lang);
  language.current = lang;
  const navigation = useRef(0);
  useEffect(() => () => { navigation.current++; }, []);
  useEffect(() => {
    if (user.isGuest || !teacher) return;
    let active = true;
    lessonsApi('/collections').then(data => { if (active) setCollections(data.collections); }).catch(e => { if (active) setError(lessonError(e, language.current)); });
    return () => { active = false; };
  }, [lessonsApi, user.isGuest, teacher]);
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
  const openClass = async (id, fresh = false) => {
    const request = ++navigation.current;
    const showOpening = mode === 'home' || detail?.class.id !== id;
    if (showOpening) {
      setOpeningName(classes.find(row => row.id === id)?.name || say(lang, 'Your class', '你的班级'));
      setMode('opening');
    }
    const read = lessonsApi(`/classes/${id}`, undefined, { fresh });
    // The lesson component handles this error when mounted; prevent an unhandled
    // rejection if the user leaves before class details arrive.
    read.catch(() => {});
    try {
      const data = await api(`/classes/${id}`, undefined, { fresh });
      if (request !== navigation.current) return;
      setLessonPreload({ classId: id, read });
      setDetail(data); setLessonRefresh(v => fresh ? v + 1 : 0); setMode('detail');
    } catch (error) {
      if (request !== navigation.current) return;
      if (showOpening) setMode('home');
      throw error;
    }
  };
  const goHome = () => {
    const request = ++navigation.current;
    setDetail(null); setMode('home'); setError(''); setBusy(false);
    api('/classes', undefined, { fresh: true }).then(data => { if (request === navigation.current) setClasses(data.classes); })
      .catch(e => { if (request === navigation.current) setError(errorText(language.current, e)); });
  };
  const backToClass = () => {
    const request = ++navigation.current, id = detail.class.id;
    setMode('detail'); setLesson(null); setAssignment(null); setError('');
    setLessonRefresh(v => v + 1);
    api(`/classes/${id}`, undefined, { fresh: true }).then(data => {
      if (request === navigation.current) setDetail(data);
    }).catch(e => { if (request === navigation.current) setError(errorText(language.current, e)); });
  };
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
    {!['lesson', 'library'].includes(mode) && <header className="flex items-center gap-4 pt-2"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 p-3 shrink-0"><Users size={24} /></div><div className="min-w-0 flex-1"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{say(lang, 'Classes', '班级')}</h1><p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">{teacher ? say(lang, 'Help your students grow, one lesson at a time.', '陪伴学生学习，见证每一课的进步。') : say(lang, 'Learn together. Try something new in every lesson.', '一起学习，每一课都有新收获。')}</p></div></header>}
    {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 break-words">{error}</div>}
    {notice && <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
    {loading ? <p role="status" className="p-6 text-slate-500">{say(lang, 'Loading classes…', '正在加载班级…')}</p> : <>
      {mode === 'home' && <>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">{say(lang, 'My classes', '我的班级')}</h2>
          {!classes.length && <p className={card + ' text-slate-500'}>{say(lang, 'No classes yet. Use the form below to get started.', '目前还没有班级。请使用下方的表单开始。')}</p>}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{classes.map(row => <button key={row.id} className={card + ' class-list-card learning-link text-left transition-colors hover:border-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'} disabled={busy} onClick={() => run(() => openClass(row.id))}>
            <span className="flex items-center justify-between gap-3 mb-5"><span className="rounded-xl bg-indigo-50 p-2.5"><Users className="text-indigo-600" size={22} /></span><span className="text-xs font-medium text-slate-500">{say(lang, `${row.studentCount} students`, `${row.studentCount} 名学生`)}</span></span>
            <h3 className="text-xl font-semibold tracking-tight break-words">{row.name}</h3><p className="mt-5 border-t border-slate-100 pt-4 text-sm text-indigo-600 font-semibold">{say(lang, 'Open class →', '进入班级 →')}</p>
          </button>)}</div>
        </section>
        <section className={card}>
          {teacher ? <form onSubmit={e => { e.preventDefault(); run(async () => { const data = await api('/classes', { name: className, ...(collectionId ? { collectionId } : {}) }); setClassName(''); await openClass(data.class.id); }); }} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">{say(lang, 'Create a class', '创建班级')}</h2>
            <label className="block font-bold">{say(lang, 'Class name', '班级名称')}<input className={field + ' mt-2'} maxLength={80} required value={className} onChange={e => setClassName(e.target.value)} placeholder={say(lang, 'For example: Monday English', '例如：星期一英语班')} /></label>
            <CoursePicker collections={collections} value={collectionId} onChange={setCollectionId} lang={lang} required={collections.length > 0} />
            <button disabled={busy} className={button} type="submit"><Plus size={18} className="inline mr-2" />{say(lang, 'Create class', '创建班级')}</button>
          </form> : <form onSubmit={e => { e.preventDefault(); run(async () => { const data = await api('/classes/join', { code, displayName: studentName }); setCode(''); await openClass(data.class.id); }); }} className="space-y-5">
            <h2 className="text-xl font-semibold tracking-tight">{say(lang, 'Join a class', '加入班级')}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block font-bold">{say(lang, 'Class invitation code', '班级邀请码')}<input className={field + ' mt-2 uppercase tracking-wider'} required value={code} onChange={e => setCode(e.target.value)} maxLength={30} autoCapitalize="characters" autoCorrect="off" spellCheck={false} /></label>
              <label className="block font-bold">{say(lang, 'Your name for the teacher', '老师认识的姓名')}<input className={field + ' mt-2'} required maxLength={40} value={studentName} onChange={e => setStudentName(e.target.value)} /></label>
            </div>
            <p className="text-sm text-slate-500">{say(lang, 'When you join, this teacher can see your name, submitted answers, writing, speaking recordings and scores, practice completion counts, and days you submit lesson activities.', '加入后，本班老师可以查看你的姓名、已提交的答案、作文、口语录音和成绩，以及练习完成数量和提交课程练习的学习天数。')}</p>
            <button className={button} disabled={busy} type="submit">{say(lang, 'Join class', '加入班级')}</button>
          </form>}
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
      {mode === 'opening' && <section className={card + ' space-y-5'} aria-busy="true">
        <button className={secondary} onClick={goHome}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'All classes', '所有班级')}</button>
        <h2 className="text-2xl font-extrabold break-words">{openingName}</h2>
        <p role="status" className="text-slate-500">{say(lang, 'Loading class…', '正在加载班级…')}</p>
        <div aria-hidden="true" className="h-24 rounded-2xl bg-slate-100 motion-safe:animate-pulse" />
      </section>}
      {detail && <div hidden={mode !== 'detail'} className="space-y-6 sm:space-y-8">
        {!detail.isOwner && <div><button className={secondary} disabled={busy} onClick={goHome}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'All classes', '所有班级')}</button></div>}
        {detail.isOwner ? <TeacherClassView key={detail.class.id} detail={detail} lang={lang} api={api} lessonsApi={lessonsApi} initialLessons={lessonPreload} refreshKey={lessonRefresh} busy={busy} visible={mode === 'detail'}
          onBackToClasses={goHome}
          onOpen={(data, studentId, reviewStudent) => { navigation.current++; setLesson({ data, studentId, reviewStudent }); setMode('lesson'); }}
          onAssign={() => { setError(''); setMode('editor'); }} onCopy={copyCode}
          onReplace={() => { if (window.confirm(say(lang, 'Replace this invitation code? The old code will stop working. Current students stay in the class.', '更换班级邀请码？旧码将失效，已加入的学生不受影响。'))) run(async () => { await api(`/classes/${detail.class.id}/invitation`, {}); await openClass(detail.class.id); }); }} /> : <>
        <section className={card + ' class-cover space-y-5'}>
          <h2 className="text-2xl font-extrabold break-words">{detail.class.name}</h2>
        </section>
        <ClassLessons key={`lessons-${detail.class.id}`} initialLessons={lessonPreload} refreshKey={lessonRefresh} classId={detail.class.id} isOwner={detail.isOwner} lang={lang} api={lessonsApi} onOpen={(data, studentId) => { navigation.current++; setLesson({ data, studentId }); setMode('lesson'); }} />
        {detail.assignments.length > 0 && <section className="space-y-4">
          <p className="text-sm font-semibold text-slate-500">{say(lang, 'Assigned by your teacher.', '老师布置的练习。')}</p>
          <h3 className="text-xl font-extrabold">{say(lang, 'Extra practice', '拓展练习')}</h3>
          <div className="grid md:grid-cols-2 gap-4">{detail.assignments.map(a => <div key={a.id} className={card}>
            <p className="text-sm font-bold text-indigo-500">{subjectName(lang, a.subject)} · {say(lang, `Level ${a.level}`, `级别 ${a.level}`)}</p><h4 className="mt-2 text-xl font-extrabold break-words">{a.title}</h4>
            <p className="mt-3 text-sm text-slate-500">{assignmentSummary(lang, a)}</p>
            {!detail.isOwner && <>
              <p className={`mt-4 font-bold ${a.progress.count ? 'text-emerald-700' : 'text-slate-500'}`}>{a.progress.count ? say(lang, `Latest: ${a.progress.latest.score} / ${a.progress.latest.total} · Best: ${a.progress.best.score} / ${a.progress.best.total}`, `最近：${a.progress.latest.score} / ${a.progress.latest.total} · 最佳：${a.progress.best.score} / ${a.progress.best.total}`) : say(lang, 'Not submitted', '尚未提交')}</p>
              <button className={button + ' mt-4 w-full'} disabled={busy} onClick={() => run(async () => { setAssignment(await api(`/assignments/${a.id}`)); setMode('player'); })}>{a.progress.count ? say(lang, 'Review / Try again', '查看 / 再次作答') : say(lang, 'Start extra practice', '开始拓展练习')}</button>
            </>}
          </div>)}</div>
        </section>}
        </>}
      </div>}
      {mode === 'editor' && detail?.isOwner && <AssignmentEditor lang={lang} classId={detail.class.id} api={api} onBack={backToClass} onPublished={backToClass} />}
      {mode === 'player' && assignment && <AssignmentPlayer key={assignment.assignment.id} data={assignment} lang={lang} api={api} onBack={backToClass} />}
      {mode === 'lesson' && lesson && <LessonPlayer key={`${lesson.data.lesson.id}:${lesson.studentId || 'self'}`} data={lesson.data} studentId={lesson.studentId} classId={detail.class.id} lang={lang} api={lessonsApi}
        reviewStudent={lesson.reviewStudent}
        backLabel={lesson.studentId ? lesson.reviewStudent?.name ? say(lang, `← Back to ${lesson.reviewStudent.name}’s profile`, `← 返回${lesson.reviewStudent.name}的档案`) : say(lang, '← Back to student profile', '← 返回学生档案') : undefined}
        onRewards={total => setUser(previous => applyLessonRewardSnapshot(previous, total))}
        onBack={backToClass} />}
      {mode === 'library' && user.role === 'admin' && <LessonLibrary lang={lang} api={lessonsApi} onBack={() => { setMode('home'); lessonsApi('/collections', undefined, { fresh: true }).then(data => setCollections(data.collections)).catch(e => setError(lessonError(e, language.current))); }} />}
    </>}
  </div>;
};
