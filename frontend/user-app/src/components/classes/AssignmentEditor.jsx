import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { say, card, field, button, secondary, subjectName, errorText } from './shared';
import { requestId } from '../lessons/shared';
import { LessonVocabulary } from '../lessons/LessonVocabulary';

export const AssignmentEditor = ({ lang, classId, api, onBack, onPublished }) => {
  const [level, setLevel] = useState(1);
  const [subject, setSubject] = useState('reading');
  const [sourceId, setSourceId] = useState('');
  const [search, setSearch] = useState('');
  const [sources, setSources] = useState([]);
  const [preview, setPreview] = useState(null);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const pending = useRef(null);
  const sending = useRef(false);
  const base = `/classes/${classId}/practice-catalog`;

  useEffect(() => {
    let active = true;
    setLoading(true); setSources([]); setError(null);
    api(`${base}?level=${level}&subject=${subject}`)
      .then(data => { if (active) setSources(data.sources); })
      .catch(e => { if (active) setError(e); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, base, level, subject, reload]);

  useEffect(() => {
    let active = true;
    setPreview(null);
    if (!sourceId) { setPreviewLoading(false); return; }
    setPreviewLoading(true); setError(null);
    api(`${base}/${encodeURIComponent(sourceId)}`)
      .then(data => { if (active) setPreview(data.source); })
      .catch(e => { if (active) setError(e); })
      .finally(() => { if (active) setPreviewLoading(false); });
    return () => { active = false; };
  }, [api, base, sourceId, reload]);

  const filtered = useMemo(() => sources.filter(s => `${s.title} ${s.titleZh || ''}`.toLowerCase().includes(search.trim().toLowerCase())), [sources, search]);
  const clearSelection = () => { setSourceId(''); setPreview(null); setSearch(''); setError(null); };
  const locked = busy || Boolean(pending.current);
  const canAssign = Boolean(pending.current) || (preview?.id === sourceId && !loading && !previewLoading);
  const publish = async event => {
    event.preventDefault();
    if (sending.current || !canAssign) return;
    sending.current = true; setBusy(true); setError(null);
    try {
      pending.current ||= { sourceId: preview.id, sourceVersion: preview.version, maxAttempts, requestId: requestId() };
      await api(`/classes/${classId}/assignments`, pending.current);
      pending.current = null;
      setAssigned(true);
      await onPublished();
    } catch (e) {
      if (['practice_source_changed', 'invalid_practice_source', 'invalid_input', 'publication_changed'].includes(e.code)) { pending.current = null; setSourceId(''); setPreview(null); }
      setError(e);
    } finally { sending.current = false; setBusy(false); }
  };

  if (assigned) return <section className={card + ' border-emerald-200 bg-emerald-50 space-y-4'} role="status">
    <CheckCircle2 className="text-emerald-700" size={32} />
    <h2 className="text-2xl font-extrabold text-emerald-900">{say(lang, 'Extra practice assigned', '拓展练习已布置')}</h2>
    <p>{say(lang, 'Your work has been saved for the class.', '练习已保存并布置给全班。')}</p>
    <button className={secondary} onClick={onBack}>{say(lang, 'Back to class', '返回班级')}</button>
  </section>;

  return <div className="space-y-6">
    <button className={secondary} onClick={onBack} disabled={busy}><ArrowLeft size={18} className="inline mr-2" />{say(lang, 'Back to class', '返回班级')}</button>
    <form onSubmit={publish} className="space-y-6">
      <section className={card + ' space-y-5'}>
        <div>
          <h2 className="text-2xl font-extrabold">{say(lang, 'Assign extra practice', '布置拓展练习')}</h2>
          <p className="text-slate-500 mt-3 leading-relaxed">{say(lang, 'Choose existing website content, preview it, then assign it to your class. Questions and answers cannot be edited.', '选择网站已有内容，预览后布置给全班。题目和答案不能修改。')}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block font-bold min-w-0">{say(lang, 'Level', '级别')}<select className={field + ' mt-2'} value={level} disabled={locked} onChange={e => { setLevel(Number(e.target.value)); clearSelection(); }}>{[1, 2, 3].map(n => <option key={n} value={n}>{say(lang, `Level ${n} (Grades ${n * 2 - 1}–${n * 2})`, `级别 ${n}（${n * 2 - 1}–${n * 2} 年级）`)}</option>)}</select></label>
          <label className="block font-bold min-w-0">{say(lang, 'Subject', '科目')}<select className={field + ' mt-2'} value={subject} disabled={locked} onChange={e => { const next = e.target.value; setSubject(next); if (['writing', 'speaking'].includes(next)) setMaxAttempts(3); clearSelection(); }}>{['reading', 'vocab', 'grammar', 'writing', 'speaking'].map(s => <option key={s} value={s}>{subjectName(lang, s)}</option>)}</select></label>
        </div>
        {loading ? <p role="status" className="text-slate-500">{say(lang, 'Loading website content…', '正在加载网站内容…')}</p> : sources.length ? <div className="space-y-4">
          <label className="block font-bold">{say(lang, 'Search content', '搜索内容')}<input className={field + ' mt-2'} type="search" value={search} disabled={locked} onChange={e => { setSearch(e.target.value); setSourceId(''); setPreview(null); }} placeholder={say(lang, 'Search by title or word', '搜索标题或单词')} /></label>
          <label className="block font-bold min-w-0">{say(lang, 'Choose content', '选择内容')}<select className={field + ' mt-2 truncate'} value={sourceId} disabled={locked} onChange={e => { setSourceId(e.target.value); setPreview(null); }}><option value="">{say(lang, 'Select content to preview', '选择要预览的内容')}</option>{filtered.map(s => <option key={s.id} value={s.id}>{say(lang, s.title, s.titleZh || s.title)} · {['writing', 'speaking'].includes(s.format) ? say(lang, '1 activity', '1 项练习') : say(lang, `${s.questionCount} ${s.questionCount === 1 ? 'question' : 'questions'}`, `${s.questionCount} 道题`)}</option>)}</select></label>
          {!filtered.length && <p className="text-sm text-slate-500">{say(lang, 'No matching content. Try another search.', '没有匹配的内容，请换个关键词。')}</p>}
        </div> : !error && <p className="text-slate-500">{say(lang, 'No content is available for this level and subject.', '这个级别和科目暂时没有可用内容。')}</p>}
      </section>

      {previewLoading && <p role="status" className={card}>{say(lang, 'Loading preview…', '正在加载预览…')}</p>}
      {preview && <section aria-label={say(lang, 'Content preview', '内容预览')} className={card + ' space-y-5'}>
        <div className="flex items-start gap-3"><BookOpen className="shrink-0 text-indigo-600" size={24} /><div className="min-w-0"><p className="text-sm text-slate-500">{say(lang, 'Preview — read only', '预览（只读）')}</p><h3 className="mt-1 text-xl font-extrabold break-words">{say(lang, preview.title, preview.titleZh || preview.title)}</h3></div></div>
        {preview.passage && <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 sm:p-5 leading-loose whitespace-pre-wrap break-words">{preview.passage}</p>}
        {preview.learning?.words && <LessonVocabulary words={preview.learning.words} lang={lang} />}
        {preview.learning?.description && <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-bold">{say(lang, 'Explanation', '讲解')}</p><p className="whitespace-pre-wrap">{say(lang, preview.learning.description.en, preview.learning.description.zh)}</p><p className="font-bold">{say(lang, 'Rule and examples', '规则和例句')}</p><p className="whitespace-pre-wrap">{say(lang, preview.learning.rule.en, preview.learning.rule.zh)}</p></div>}
        {preview.writing && <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2"><p className="text-sm font-semibold text-indigo-800">{say(lang, 'Writing prompt', '写作题目')}</p><p className="font-bold whitespace-pre-wrap">{preview.writing.prompt}</p>{preview.writing.promptZh && <p className="text-slate-600">{preview.writing.promptZh}</p>}</div>}
        {preview.speaking && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2"><p className="text-sm font-semibold text-slate-600">{say(lang, 'Speaking sentence', '口语句子')}</p><p className="font-bold text-xl">{preview.speaking.sentence}</p>{preview.speaking.hintZh && <p className="text-slate-600">{preview.speaking.hintZh}</p>}</div>}
        {!['writing', 'speaking'].includes(preview.format) && <p className="text-sm text-slate-500">{say(lang, 'The correct answers below are for your preview. Students answer before seeing their results.', '以下正确答案仅用于教师预览，学生作答后才能查看结果。')}</p>}
        <ol className="space-y-5">{preview.questions.map((q, index) => <li key={index} className="border-t border-slate-100 pt-5 space-y-3 min-w-0 break-words">
          <div className="flex items-start gap-2"><span className="font-bold">{index + 1}.</span><p className="font-bold">{q.prompt}</p></div>
          <ul className="grid sm:grid-cols-2 gap-2">{q.options.map((o, i) => <li key={i} className={`rounded-xl border p-3 ${i === q.correctIndex ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'}`}>{String.fromCharCode(65 + i)}. {o}</li>)}</ul>
          <p className="text-sm font-semibold text-emerald-800"><CheckCircle2 size={16} aria-hidden="true" className="inline mr-1" />{say(lang, 'Correct answer: ', '正确答案：')}{q.options[q.correctIndex]}</p>
        </li>)}</ol>
      </section>}

      <section className={card + ' space-y-5'}>
        {error && <div className="space-y-3"><p role="alert" className="text-rose-700 break-words">{errorText(lang, error)}</p><button type="button" className={secondary} disabled={locked} onClick={() => setReload(n => n + 1)}>{say(lang, 'Retry loading', '重新加载')}</button></div>}
        <label className="block font-bold sm:max-w-xs">{say(lang, 'Allowed attempts', '允许作答次数')}<select className={field + ' mt-2'} value={maxAttempts} disabled={locked || ['writing', 'speaking'].includes(subject)} onChange={e => setMaxAttempts(Number(e.target.value))}>{[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        {['writing', 'speaking'].includes(subject) && <p className="text-sm text-slate-500">{say(lang, 'Writing and speaking always allow three submitted attempts.', '写作和口语固定允许提交三次。')}</p>}
        <p className="text-sm text-slate-500 leading-relaxed">{say(lang, 'This will appear under Extra practice for the whole class. Uploaded class lessons stay separate. Previously assigned work and results are kept.', '布置后，全班可在“拓展练习”中看到这些内容。上传的班级课程仍单独显示，已布置的练习和成绩都会保留。')}</p>
        <button className={button + ' w-full sm:w-auto'} disabled={busy || !canAssign} type="submit">{busy ? say(lang, 'Assigning…', '正在布置…') : pending.current ? say(lang, 'Retry assigning', '重试布置') : say(lang, 'Assign to class', '布置给全班')}</button>
      </section>
    </form>
  </div>;
};
