import { EXTRA_PRACTICE_ENABLED } from '../../config/visibility';
import { gradeBandLabel } from '../../utils/gradeLabels';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Plus, Users, Settings, Trash2 } from 'lucide-react';
import { ClassLessons } from '../lessons/ClassLessons';
import { collectionName } from '../lessons/shared';
import { StudentProfile } from './StudentProfile';
import { say, card, field, button, secondary, subjectName, assignmentSummary, dateText, errorText } from './shared';

export function TeacherClassView({ detail, lang, api, lessonsApi, initialLessons, refreshKey = 0, busy = false, visible = true, onOpen, onAssign, onCopy, onReplace, onBackToClasses, onDelete, onDetail }) {
  const [tab, setTab] = useState('lessons'), [invite, setInvite] = useState(false), [settingsRequest, setSettingsRequest] = useState(0);
  const [settingsContainer, setSettingsContainer] = useState(null);
  const [course, setCourse] = useState(null), [visited, setVisited] = useState(false), [reports, setReports] = useState(null), [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [requests, setRequests] = useState(detail.joinRequests || []), [deciding, setDeciding] = useState(null), [decisionError, setDecisionError] = useState('');
  const decisionLock = useRef(false), decisionEpoch = useRef(0);
  const language = useRef(lang), rosterButton = useRef(null), lastOpened = useRef(null);
  language.current = lang;
  const classId = detail.class.id;
  useEffect(() => { setRequests(detail.joinRequests || []); }, [detail.joinRequests]);
  useEffect(() => { const epoch = decisionEpoch; return () => { epoch.current++; }; }, [classId, visible]);
  useEffect(() => {
    if (!visited || !visible) return;
    let active = true;
    setLoading(true); setError('');
    const options = { fresh: refreshKey > 0 || reload > 0 };
    Promise.all([EXTRA_PRACTICE_ENABLED ? api(`/classes/${classId}/report`, undefined, options) : null, lessonsApi(`/classes/${classId}/report`, undefined, options), api(`/classes/${classId}`, undefined, options)])
      .then(([practice, lessons, current]) => {
        if (!active) return;
        setReports({ practice, lessons });
        setRequests(current.joinRequests || []);
        setSelected(id => lessons.students.some(s => s.id === id) ? id : null);
      })
      .catch(e => { if (active) { setReports(null); setSelected(null); setError(errorText(language.current, e)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, lessonsApi, classId, visited, refreshKey, course?.revision, reload, visible]);
  const students = reports?.lessons.students || [];
  const selectedStudent = students.find(s => s.id === selected);
  const switchTab = value => { setTab(value); setInvite(false); if (value === 'students') setVisited(true); };
  const decide = async (requestId, decision) => {
    if (decisionLock.current) return;
    decisionLock.current = true;
    const epoch = decisionEpoch.current;
    setDeciding(requestId); setDecisionError('');
    try {
      await api(`/classes/${classId}/join-requests/${requestId}/decision`, { decision });
      if (epoch !== decisionEpoch.current) return;
      const current = await api(`/classes/${classId}`, undefined, { fresh: true });
      if (epoch !== decisionEpoch.current) return;
      setRequests(current.joinRequests || []);
      onDetail?.(current);
      setReload(n => n + 1);
    } catch (e) {
      if (epoch === decisionEpoch.current) {
        setDecisionError(errorText(language.current, e));
        if (e.status === 409) setReload(n => n + 1);
      }
    } finally {
      decisionLock.current = false;
      // Lock bookkeeping must finish even if the view hid while awaiting data.
      setDeciding(null);
    }
  };
  return <div className="space-y-6" data-testid="teacher-class">
    {!selectedStudent && <>
      {onBackToClasses && <div><button className={secondary} disabled={busy} onClick={onBackToClasses}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'All classes', '所有班级')}</button></div>}
      <header className={card + ' class-cover flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5'}>
        <div className="min-w-0"><h2 className="text-2xl font-semibold tracking-tight break-words">{detail.class.name}</h2><p className="text-sm text-slate-500 mt-2 leading-relaxed">{course?.collection ? collectionName(course.collection, lang) : say(lang, 'Choose a course in Class settings.', '请在班级设置中选择课程。')}</p></div>
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button className={secondary} aria-expanded={invite} onClick={() => setInvite(v => !v)}><Users size={17} className="inline mr-2" aria-hidden="true" />{say(lang, 'Invite students', '邀请学生')}</button>
          <button className={secondary} onClick={() => { switchTab('lessons'); setSettingsRequest(n => n + 1); }}><Settings size={17} className="inline mr-2" aria-hidden="true" />{say(lang, 'Class settings', '班级设置')}</button>
        </div>
      </header>
      {invite && <section className={card + ' space-y-4'} aria-label={say(lang, 'Class invitation', '班级邀请')}>
        <label className="block text-sm font-semibold text-slate-600">{say(lang, 'Share this class invitation code with students', '将此班级邀请码分享给学生')}<input readOnly className={field + ' mt-2 font-mono tracking-wider'} value={detail.class.invitationCode || ''} onFocus={e => e.target.select()} /></label>
        <div className="flex flex-wrap gap-3"><button className={secondary} onClick={() => onCopy(detail.class.invitationCode)}><Copy size={16} className="inline mr-2" aria-hidden="true" />{say(lang, 'Copy code', '复制邀请码')}</button><button className={secondary} disabled={busy} onClick={onReplace}>{say(lang, 'Replace code', '更换邀请码')}</button></div>
      </section>}
      <div ref={setSettingsContainer} className="empty:hidden" />
      <nav aria-label={say(lang, 'Class sections', '班级栏目')} className="class-section-nav class-section-nav--class" style={{ gridTemplateColumns: `repeat(${EXTRA_PRACTICE_ENABLED ? 3 : 2}, minmax(0, 1fr))` }}>
        {(EXTRA_PRACTICE_ENABLED ? ['lessons', 'students', 'practice'] : ['lessons', 'students']).map((key, i) => <button key={key} className="class-section-tab" aria-pressed={tab === key} onClick={() => switchTab(key)}>{say(lang, ['Lessons', 'Students', 'Extra practice'][i], ['课程', '学生', '拓展练习'][i])}</button>)}
      </nav>
    </>}
    <div hidden={!!selectedStudent || tab !== 'lessons'}>
      <ClassLessons classId={classId} isOwner lang={lang} api={lessonsApi} initialLessons={initialLessons} refreshKey={refreshKey} showProgress={false} settingsRequest={settingsRequest} settingsContainer={settingsContainer} onData={setCourse} onOpen={onOpen} visible={visible && !selectedStudent && tab === 'lessons'} />
    </div>
    {selectedStudent && <StudentProfile key={selectedStudent.id} student={selectedStudent} report={reports.practice} lessonReport={reports.lessons} classId={classId} className={detail.class.name} lang={lang} api={api} lessonsApi={lessonsApi} refreshKey={refreshKey + reload} visible={visible} onOpen={onOpen} onBack={() => { setSelected(null); requestAnimationFrame(() => rosterButton.current?.focus()); }} />}
    {!selectedStudent && tab === 'students' && <section className="space-y-4">
      <section className={card + ' space-y-4'} aria-label={say(lang, 'Pending join requests', '待批准的入班申请')}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{say(lang, 'Pending join requests', '待批准的入班申请')} ({requests.length})</h3><button className={secondary} disabled={loading || !!deciding} onClick={() => setReload(n => n + 1)}>{say(lang, 'Check requests', '查看新申请')}</button></div>
        <p className="text-sm text-slate-500">{say(lang, 'Check the submitted name and account username before approving. This is manual teacher verification.', '批准前请核对学生填写的姓名和账号用户名。此步骤由老师人工确认。')}</p>
        {decisionError && <p role="alert" className="text-rose-700">{decisionError}</p>}
        {!requests.length && <p className="text-slate-500">{say(lang, 'No pending requests.', '暂无待批准的申请。')}</p>}
        {requests.map(request => <article key={request.id} className="border-t border-slate-100 pt-4 space-y-3"><div><h4 className="font-bold break-words">{request.name}</h4><p className="text-sm text-slate-600 break-words"><span>{say(lang, 'Account: ', '账号：')}</span><span>{request.username}</span></p><p className="text-sm text-slate-500 mt-1">{dateText(lang, request.requestedAt)}</p></div><div className="flex flex-wrap gap-3"><button className={button} disabled={busy || !!deciding} aria-label={say(lang, `Approve ${request.name}`, `批准 ${request.name}`)} onClick={() => decide(request.id, 'approve')}>{say(lang, 'Approve', '批准')}</button><button className={secondary} disabled={busy || !!deciding} aria-label={say(lang, `Decline ${request.name}`, `拒绝 ${request.name}`)} onClick={() => decide(request.id, 'decline')}>{say(lang, 'Decline', '拒绝')}</button></div></article>)}
      </section>
      <h3 className="text-xl font-extrabold">{say(lang, 'Students', '学生')}{reports ? ` (${students.length})` : ''}</h3>
      {loading && <p role="status" className="text-slate-500">{say(lang, 'Loading student report…', '正在加载学生报告…')}</p>}
      {error && <div role="alert" className={card}><p className="text-rose-700">{error}</p><button className={secondary + ' mt-3'} onClick={() => setReload(n => n + 1)}>{say(lang, 'Try loading again', '重新加载')}</button></div>}
      {reports && !students.length && <p className={card}>{say(lang, 'Invite students to see their progress here.', '邀请学生加入后，可在这里查看进度。')}</p>}
      {students.map(student => {
        const lesson = reports.lessons.students.find(s => s.id === student.id);
        const last = lesson?.lastSubmittedAt;
        return <article key={student.id} className={card + ' flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'}>
          <div className="min-w-0"><h4 className="font-bold text-lg break-words">{student.name}</h4><p className="text-sm text-slate-600 mt-2">{say(lang, 'Lessons completed: ', '已完成课程：')}{lesson ? `${lesson.completed} / ${lesson.assigned}` : '—'}</p><p className="text-sm text-slate-500 mt-1">{say(lang, 'Last submission: ', '最近提交：')}{last ? dateText(lang, last) : say(lang, 'No submissions yet', '尚未提交')}</p></div>
          <button ref={node => { if (lastOpened.current === student.id) rosterButton.current = node; }} className={secondary + ' sm:shrink-0'} aria-label={say(lang, `View profile: ${student.name}`, `查看档案：${student.name}`)} onClick={() => { lastOpened.current = student.id; setSelected(student.id); }}>{say(lang, 'View profile', '查看档案')} →</button>
        </article>;
      })}
    </section>}
    {EXTRA_PRACTICE_ENABLED && !selectedStudent && tab === 'practice' && <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{say(lang, 'Assigned extra practice', '已布置的拓展练习')}</h3><button className={button} onClick={onAssign}><Plus size={18} className="inline mr-2" aria-hidden="true" />{say(lang, 'Assign extra practice', '布置拓展练习')}</button></div>
      {!detail.assignments.length && <p className={card}>{say(lang, 'No extra practice assigned yet. Choose existing website content when your class needs more practice.', '尚未布置拓展练习。需要时可选择网站已有内容。')}</p>}
      <div className="grid md:grid-cols-2 gap-4">{detail.assignments.map(a => <article key={a.id} className={card + ' space-y-3'}><p className="text-sm font-semibold text-indigo-600">{subjectName(lang, a.subject)} · {gradeBandLabel(a.level, lang)}</p><h4 className="text-xl font-bold break-words">{a.title}</h4><p className="text-sm text-slate-500">{assignmentSummary(lang, a)}</p>
        {onDelete && <div className="pt-3 border-t border-slate-100"><button className={secondary + ' text-rose-700'} disabled={busy} aria-label={say(lang, `Delete extra practice: ${a.title}`, `删除拓展练习：${a.title}`)} onClick={() => onDelete(a)}><Trash2 size={16} className="inline mr-2" aria-hidden="true" />{say(lang, 'Delete extra practice', '删除拓展练习')}</button></div>}
      </article>)}</div>
    </section>}
  </div>;
}
