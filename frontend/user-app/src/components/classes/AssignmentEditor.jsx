import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { say, card, field, button, secondary, subjectName, errorText } from './shared';

const blankQuestion = () => ({ prompt: '', options: ['', '', ''], correctIndex: 0, explanation: '' });
export const AssignmentEditor = ({ lang, curriculumDb, classId, api, onBack, onPublished }) => {
  const [form, setForm] = useState({ title: '', subject: 'reading', level: 1, instructions: '', passage: '', maxAttempts: 3, questions: [blankQuestion()] });
  const [sourceId, setSourceId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sources = useMemo(() => curriculumDb?.[{ 1: '1-2', 2: '3-4', 3: '5-6' }[form.level]]?.[form.subject] || [], [curriculumDb, form.level, form.subject]);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const changeQuestion = (index, patch) => setForm(prev => ({ ...prev, questions: prev.questions.map((q, i) => i === index ? { ...q, ...patch } : q) }));
  const useLesson = () => {
    const lesson = sources.find((item, i) => String(i) === sourceId); if (!lesson) return;
    const questions = (form.subject === 'vocab' ? [{ q: `What does “${lesson.word}” mean?`, options: lesson.options, a: lesson.answer || lesson.def }] : lesson.questions || []).slice(0, 30).map(q => {
      const options = (q.options || []).map(String);
      const correctIndex = Number.isInteger(q.correct) ? q.correct : options.indexOf(q.a || q.answer);
      return { prompt: q.q || q.question || '', options, correctIndex, explanation: '' };
    }).filter(q => q.options.length >= 2 && q.options.length <= 4 && q.correctIndex >= 0 && q.correctIndex < q.options.length);
    if (!questions.length) { setError(say(lang, 'This lesson has no compatible questions. Please enter your own.', '这节课没有可用的选择题，请自行填写。')); return; }
    setForm(prev => ({ ...prev, title: lesson.title?.en || lesson.word || 'Class assignment', passage: form.subject === 'reading' ? lesson.text?.en || '' : '', questions }));
    setError('');
  };
  const publish = async event => {
    event.preventDefault();
    if (busy) return;
    if (form.questions.some(q => !q.prompt.trim() || q.options.some(o => !o.trim()) || new Set(q.options.map(o => o.trim().normalize('NFKC').toLowerCase())).size !== q.options.length || q.correctIndex < 0 || q.correctIndex >= q.options.length)) {
      setError(say(lang, 'Fill every question and choice. Each choice must be different, with one correct answer.', '请填写每道题及所有选项。选项不能重复，每题必须有一个正确答案。')); return;
    }
    setBusy(true); setError('');
    try { await api(`/classes/${classId}/assignments`, form); onPublished(); }
    catch (e) { setError(errorText(lang, e)); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6">
    <button className={secondary} onClick={onBack} disabled={busy}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'Back to class', '返回班级')}</button>
    <form onSubmit={publish} className="space-y-6">
      <section className={card}>
        <h2 className="text-2xl font-extrabold mb-2">{say(lang, 'Create an assignment', '创建作业')}</h2>
        <p className="text-slate-500 mb-6">{say(lang, 'Choose a lesson or write your own questions. Check every answer before publishing.', '选择已有课程，或自己编写题目。发布前请检查所有答案。')}</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="font-bold space-y-2"><span>{say(lang, 'Subject', '科目')}</span><select className={field} value={form.subject} onChange={e => { update('subject', e.target.value); setSourceId(''); }}>{['reading', 'vocab', 'grammar', 'other'].map(s => <option key={s} value={s}>{subjectName(lang, s)}</option>)}</select></label>
          <label className="font-bold space-y-2"><span>{say(lang, 'Level', '级别')}</span><select className={field} value={form.level} onChange={e => { update('level', Number(e.target.value)); setSourceId(''); }}>{[1, 2, 3].map(n => <option key={n} value={n}>{say(lang, `Level ${n}`, `级别 ${n}`)}</option>)}</select></label>
        </div>
        {sources.length > 0 && <div className="mt-5 p-4 rounded-2xl bg-indigo-50 space-y-3">
          <label className="block font-bold">{say(lang, 'Copy questions from a lesson (optional)', '复制已有课程的题目（可选）')}<select className={field + ' mt-2'} value={sourceId} onChange={e => setSourceId(e.target.value)}><option value="">{say(lang, 'Choose a lesson', '选择课程')}</option>{sources.map((s, i) => <option key={i} value={i}>{s.title?.en || s.word || `Lesson ${i + 1}`}</option>)}</select></label>
          <button type="button" className={secondary} disabled={sourceId === ''} onClick={useLesson}>{say(lang, 'Use this lesson', '使用这节课')}</button>
          <p className="text-sm text-slate-500">{say(lang, 'This replaces the title, lesson text and current questions below.', '这会替换下方的标题、课文和现有题目。')}</p>
        </div>}
        <div className="space-y-5 mt-6">
          <label className="block font-bold">{say(lang, 'Assignment title', '作业标题')}<input className={field + ' mt-2'} required maxLength={120} value={form.title} onChange={e => update('title', e.target.value)} /></label>
          <label className="block font-bold">{say(lang, 'Instructions (optional)', '说明（可选）')}<textarea className={field + ' mt-2'} rows={2} maxLength={2000} value={form.instructions} onChange={e => update('instructions', e.target.value)} /></label>
          <label className="block font-bold">{say(lang, 'Lesson text or reading passage (optional)', '学习内容或阅读文章（可选）')}<textarea className={field + ' mt-2'} rows={6} maxLength={12000} value={form.passage} onChange={e => update('passage', e.target.value)} /></label>
          <label className="block font-bold">{say(lang, 'Allowed attempts', '允许作答次数')}<select className={field + ' mt-2'} value={form.maxAttempts} onChange={e => update('maxAttempts', Number(e.target.value))}>{[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
          <p className="text-sm text-slate-500">{say(lang, 'Students see correct answers after submitting. First, latest and best scores are recorded separately.', '学生提交后可以查看正确答案。首次、最近和最佳成绩会分别记录。')}</p>
        </div>
      </section>
      {form.questions.map((q, index) => <fieldset className={card + ' space-y-4'} key={index}>
        <legend className="font-extrabold px-2">{say(lang, `Question ${index + 1}`, `第 ${index + 1} 题`)}</legend>
        <label className="block font-bold">{say(lang, 'Question', '题目')}<textarea required className={field + ' mt-2'} rows={2} maxLength={600} value={q.prompt} onChange={e => changeQuestion(index, { prompt: e.target.value })} /></label>
        <p className="text-sm font-medium text-slate-500">{say(lang, 'Select the circle beside the correct answer.', '选中正确答案旁的圆圈。')}</p>
        {q.options.map((option, i) => <div key={i} className="flex gap-2 items-center">
          <label className="min-w-12 min-h-12 flex items-center justify-center rounded-xl border border-slate-200 cursor-pointer"><input type="radio" name={`correct-${index}`} aria-label={say(lang, `Correct answer ${i + 1} for question ${index + 1}`, `第 ${index + 1} 题的正确答案为选项 ${i + 1}`)} checked={q.correctIndex === i} onChange={() => changeQuestion(index, { correctIndex: i })} className="w-5 h-5 accent-indigo-600" /></label>
          <input aria-label={say(lang, `Choice ${i + 1}`, `选项 ${i + 1}`)} required className={field + ' min-w-0'} maxLength={300} value={option} onChange={e => changeQuestion(index, { options: q.options.map((o, j) => j === i ? e.target.value : o) })} />
        </div>)}
        <div className="flex flex-wrap gap-2">
          {q.options.length < 4 && <button type="button" className={secondary} onClick={() => changeQuestion(index, { options: [...q.options, ''] })}>{say(lang, 'Add choice', '添加选项')}</button>}
          {q.options.length > 2 && <button type="button" className={secondary} onClick={() => changeQuestion(index, { options: q.options.slice(0, -1), correctIndex: Math.min(q.correctIndex, q.options.length - 2) })}>{say(lang, 'Remove last choice', '删除最后一个选项')}</button>}
        </div>
        <label className="block font-bold">{say(lang, 'Explanation (optional)', '答案说明（可选）')}<textarea className={field + ' mt-2'} rows={2} maxLength={1000} value={q.explanation} onChange={e => changeQuestion(index, { explanation: e.target.value })} /></label>
        {form.questions.length > 1 && <button type="button" className={secondary + ' text-rose-600'} onClick={() => update('questions', form.questions.filter((_, i) => i !== index))}><Trash2 size={16} className="inline mr-2" />{say(lang, 'Remove question', '删除题目')}</button>}
      </fieldset>)}
      {form.questions.length < 30 && <button className={secondary} type="button" onClick={() => update('questions', [...form.questions, blankQuestion()])}><Plus size={18} className="inline mr-2" />{say(lang, 'Add question', '添加题目')}</button>}
      <section className={card + ' space-y-4'}>
        {error && <p role="alert" className="text-rose-600 font-bold">{error}</p>}
        <p className="text-sm text-slate-500">{say(lang, 'Publishing makes this assignment available to the whole class. Published questions cannot be edited, so student scores remain comparable.', '发布后，全班学生都可以作答。已发布的题目不能修改，以保证成绩可比较。')}</p>
        <button className={button + ' w-full'} disabled={busy} type="submit">{busy ? say(lang, 'Publishing…', '正在发布…') : say(lang, 'Publish assignment', '发布作业')}</button>
      </section>
    </form>
  </div>;
};
