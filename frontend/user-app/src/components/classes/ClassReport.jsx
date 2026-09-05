import React, { useRef, useState } from 'react';
import { say, card, field, secondary, dateText, errorText } from './shared';

export const ClassReport = ({ report, lang, api }) => {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState([]);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selection = useRef(0);
  const detailPanel = useRef(null);
  const loadStudent = async id => {
    const version = ++selection.current;
    setStudentId(id); setResults([]); setAnswers({}); setError(''); setBusy(true);
    try {
      const response = await api(`/classes/${report.class.id}/students/${id}/results`);
      if (selection.current === version) {
        setResults(response.results);
        detailPanel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) { if (selection.current === version) setError(errorText(lang, e)); }
    finally { if (selection.current === version) setBusy(false); }
  };
  const loadAnswers = async assignmentId => {
    const version = selection.current;
    setBusy(true); setError('');
    try {
      const data = await api(`/assignments/${assignmentId}/students/${studentId}`);
      if (selection.current === version) setAnswers(previous => ({ ...previous, [assignmentId]: data }));
    } catch (e) { if (selection.current === version) setError(errorText(lang, e)); }
    finally { if (selection.current === version) setBusy(false); }
  };
  const selected = report.students.find(s => s.id === studentId);
  const totalCompleted = report.students.reduce((sum, s) => sum + s.completed, 0);
  return <section className="space-y-5">
    <div className={card}>
      <h3 className="font-extrabold text-2xl">{say(lang, 'Student progress', '学生学习情况')}</h3>
      <p className="mt-2 text-slate-500">{say(lang, `Students: ${report.students.length} · Assignments: ${report.assignments.length} · Completed submissions: ${totalCompleted}`, `${report.students.length} 名学生 · ${report.assignments.length} 份作业 · 已完成 ${totalCompleted} 人次`)}</p>
      {!report.students.length && <p className="mt-6 text-slate-500">{say(lang, 'Share your class invitation code so students can join.', '分享班级邀请码，让学生加入。')}</p>}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {report.students.map(student => <div className="rounded-2xl border border-slate-200 p-4 min-w-0" key={student.id}>
          <h4 className="font-extrabold text-lg break-words">{student.name}</h4>
          <dl className="grid grid-cols-2 gap-3 mt-4">
            <div><dt className="text-xs text-slate-500">{say(lang, 'Assignments completed', '已完成作业')}</dt><dd className="font-bold text-xl">{student.completed} / {student.assigned}</dd></div>
            <div><dt className="text-xs text-slate-500">{say(lang, 'Average latest score', '最近成绩平均分')}</dt><dd className="font-bold text-xl">{student.averagePercent === null ? '—' : `${student.averagePercent}%`}</dd></div>
          </dl>
          <button className={secondary + ' mt-4 w-full'} onClick={() => loadStudent(student.id)}>{say(lang, 'View answers and attempts', '查看答案及作答记录')}</button>
        </div>)}
      </div>
    </div>
    {selected && <div ref={detailPanel} className={card + ' space-y-6 scroll-mt-24'}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-extrabold break-words">{selected.name}</h3><button className={secondary} onClick={() => { selection.current++; setStudentId(''); }}>{say(lang, 'Close details', '关闭详情')}</button></div>
      <label className="block font-bold">{say(lang, 'Student', '学生')}<select className={field + ' mt-2'} value={studentId} onChange={e => loadStudent(e.target.value)}>{report.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      {busy && <p role="status" className="text-slate-500">{say(lang, 'Loading results…', '正在加载成绩…')}</p>}
      {error && <div role="alert"><p className="text-rose-600">{error}</p><button className={secondary + ' mt-3'} disabled={busy} onClick={() => loadStudent(studentId)}>{say(lang, 'Reload student results', '重新加载学生成绩')}</button></div>}
      {results.map(result => {
        const assignment = report.assignments.find(a => a.id === result.assignmentId);
        if (!assignment) return null;
        const detail = answers[result.assignmentId];
        return <div key={result.assignmentId} className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <h4 className="text-lg font-extrabold break-words">{assignment.title}</h4>
          {!result.count ? <p className="text-slate-500">{say(lang, 'Not submitted', '尚未提交')}</p> : <>
            <div className="grid grid-cols-3 gap-2 text-sm">{[['first', 'First', '首次'], ['latest', 'Latest', '最近'], ['best', 'Best', '最佳']].map(([key, en, zh]) => <div className="bg-slate-50 rounded-xl p-3" key={key}><p className="text-slate-500">{say(lang, en, zh)}</p><p className="font-bold mt-1">{result[key].score} / {result[key].total}</p></div>)}</div>
            {!detail && <button className={secondary} disabled={busy} onClick={() => loadAnswers(result.assignmentId)}>{say(lang, 'Load answers', '加载答案')}</button>}
            {detail?.attempts.map((attempt, index) => <details className="border-t border-slate-100 pt-3" key={attempt.requestId}>
              <summary className="min-h-12 cursor-pointer font-bold break-words py-3">{say(lang, `Attempt ${index + 1}`, `第 ${index + 1} 次`)} · {attempt.score} / {attempt.total} · <span className="font-normal text-slate-500">{dateText(lang, attempt.submittedAt)}</span></summary>
              <div className="space-y-3 mt-3">{attempt.responses.map(response => {
                const question = detail.assignment.questions.find(q => q.id === response.questionId);
                if (!question) return null;
                return <div key={question.id} className={`rounded-xl p-4 break-words ${response.correct ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <p className="font-bold">{question.prompt}</p>
                  <p className="mt-2">{say(lang, 'Student answer: ', '学生答案：')}{question.options.find(o => o.id === response.optionId)?.text}</p>
                  <p className="mt-1 font-semibold">{say(lang, 'Correct answer: ', '正确答案：')}{question.options.find(o => o.id === response.correctOptionId)?.text}</p>
                  {question.explanation && <p className="mt-2 text-sm">{question.explanation}</p>}
                </div>;
              })}</div>
            </details>)}
          </>}
        </div>;
      })}
      <div className="rounded-2xl bg-slate-50 p-4">
        <h4 className="font-bold">{say(lang, 'Practice completed across the website', '网站练习完成情况')}</h4>
        <p className="text-xs text-slate-500 mt-2">{say(lang, 'These are practice completion counts, separate from assignment scores.', '以下为练习完成数量，与作业成绩分开记录。')}</p>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">{[['masteredVocab', 'Vocabulary', '词汇'], ['completedGrammar', 'Grammar', '语法'], ['completedReading', 'Reading', '阅读'], ['completedWriting', 'Writing', '写作'], ['completedSpeaking', 'Speaking', '口语']].map(([key, en, zh]) => <div key={key}><dt className="text-sm text-slate-500">{say(lang, en, zh)}</dt><dd className="font-bold">{selected.practice[key]}</dd></div>)}</dl>
      </div>
    </div>}
  </section>;
};
