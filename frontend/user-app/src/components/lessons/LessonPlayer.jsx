import React, { useState } from 'react';
import {
  lessonApi,
  lessonError,
  partName,
  requestId,
  card,
  button,
  secondary,
  field,
  say,
} from './shared';
import { SlideViewer } from './SlideViewer';
import { LessonSpeaking } from './LessonSpeaking';
import { LessonResult } from './LessonResult';
import { LessonVocabulary } from './LessonVocabulary';
import { LessonQuiz } from './LessonQuiz';
const parts = ['slides', 'vocabulary', 'speaking', 'writing', 'questions'];
export function LessonPlayer({ data: initial, classId, lang, onBack, api = lessonApi, studentId, onRewards, backLabel }) {
  const [data, setData] = useState(initial),
    [part, setPart] = useState('slides'),
    [answers, setAnswers] = useState({}),
    [writing, setWriting] = useState(''),
    [recording, setRecording] = useState(null),
    [micBusy, setMicBusy] = useState(false),
    [viewed, setViewed] = useState(false),
    [busy, setBusy] = useState(false),
    [retrying, setRetrying] = useState(false),
    [vocabularyPractice, setVocabularyPractice] = useState(false),
    [error, setError] = useState('');
  const pending = React.useRef(null),
    lock = React.useRef(false);
  const lesson = data.lesson;
  const base = `/classes/${classId}/lessons/${lesson.id}`,
    query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
  const attempts = data.parts.find((p) => p.part === part)?.attempts || [],
    max = ['slides', 'vocabulary', 'questions'].includes(part) ? 1 : 3,
    locked = data.readOnly || attempts.length >= max;
  const showForm = !attempts.length || retrying;
  const questions = ['vocabulary', 'questions'].includes(part) ? lesson[part] : [];
  const words = lesson.vocabularyWords || [];
  const learning = part === 'vocabulary' && words.length > 0 && !vocabularyPractice;
  const canSubmit =
    part === 'slides'
      ? viewed
      : part === 'writing'
        ? writing.trim().length > 0
        : part === 'speaking'
          ? !!recording
          : questions.every((q) => answers[q.id]);
  const submit = async () => {
    if (lock.current || (!pending.current && (locked || !canSubmit))) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const input =
      part === 'writing'
        ? { text: writing }
        : part === 'speaking'
          ? recording
          : part === 'slides'
            ? {}
            : { answers: questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })) };
    // Keep the same payload and request ID after uncertain network failure.
    pending.current ||= { part, body: { ...input, requestId: requestId(), revision: data.revision } };
    try {
      const result = await api(`${base}/parts/${pending.current.part}`, pending.current.body);
      onRewards?.(result.lessonRewardStars);
      const savedPart = pending.current.part;
      pending.current = null;
      setData((d) => ({
        ...d,
        parts: [
          ...d.parts.filter((p) => p.part !== savedPart),
          {
            part: savedPart,
            attempts: [...(d.parts.find((p) => p.part === savedPart)?.attempts || []), result.attempt],
          },
        ],
      }));
      setAnswers({});
      setRecording(null);
      setWriting('');
      setRetrying(false);
    } catch (e) {
      if (e.status >= 400 && e.status < 500) pending.current = null;
      setError(lessonError(e, lang));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const completedCount = parts.filter(p => data.parts.some(row => row.part === p && row.attempts.length)).length;
  const completed = completedCount === parts.length;
  return (
    <div className="space-y-6" data-testid="lesson-player">
      <button
        className={secondary}
        disabled={busy || micBusy}
        onClick={() => {
          if (
            (writing.trim() || Object.keys(answers).length || recording || pending.current) &&
            !window.confirm(
              say(
                lang,
                'Leave this activity? Unsubmitted changes will not be saved.',
                '离开本项练习？尚未提交的内容不会保存。',
              ),
            )
          )
            return;
          onBack();
        }}
      >
        {backLabel || say(lang, '← Back to class', '← 返回班级')}
      </button>
      <header>
        <p className="text-indigo-600 font-bold">{say(lang, `Lesson ${lesson.number}`, `第 ${lesson.number} 课`)}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">{say(lang, lesson.title, lesson.titleZh)}</h2>
        <p className="text-slate-500 mt-3">
          {completed
            ? say(
                lang,
                'All activities submitted. You can review your work below.',
                '所有学习任务已提交，可以在下方复习。',
              )
            : say(lang, 'Review the slides and try each short activity.', '先复习课件，再完成各项小练习。')}
        </p>
        <div className="mt-5 space-y-2">
          <p className="font-semibold text-sm text-emerald-800" role="status">{say(lang, `${completedCount} of 5 activities completed`, `已完成 ${completedCount} / 5 项学习任务`)}</p>
          <div role="progressbar" aria-label={say(lang, 'Lesson progress', '课程进度')} aria-valuemin={0} aria-valuemax={5} aria-valuenow={completedCount} className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completedCount * 20}%` }} />
          </div>
        </div>
        {data.readOnly && (
          <p className="mt-3 font-bold text-amber-800">
            {data.isOwner
              ? say(lang, 'Teacher preview / submitted work', '教师预览 / 已提交作业')
              : say(lang, 'Earlier course — saved work is read-only.', '往期课程，已保存的作业仅供查看。')}
          </p>
        )}
      </header>
      <nav aria-label={say(lang, 'Lesson activities', '学习任务')} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
        {parts.map((p) => {
          const done = data.parts.some(r => r.part === p && r.attempts.length);
          return (
          <button
            key={p}
            aria-pressed={part === p}
            disabled={busy || micBusy || !!pending.current}
            className={`min-w-0 min-h-[76px] border-2 rounded-xl px-3 sm:px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 ${done
              ? part === p ? 'border-emerald-600 bg-emerald-100 text-emerald-950' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : part === p ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-600'}`}
            onClick={() => {
              if (
                (writing.trim() || Object.keys(answers).length || recording) &&
                !window.confirm(
                  say(
                    lang,
                    'Switch activities? Unsubmitted changes will not be saved.',
                    '切换练习？尚未提交的内容不会保存。',
                  ),
                )
              )
                return;
              setPart(p);
              setAnswers({});
              setWriting('');
              setRecording(null);
              setError('');
              setRetrying(false);
              setVocabularyPractice(false);
            }}
          >
            <span className="block font-bold text-sm sm:text-base">{partName(p, lang)}</span>
            <span className="block mt-1 text-xs sm:text-sm">{done ? say(lang, 'Completed', '已完成') : say(lang, 'Not started', '未完成')}</span>
          </button>
        ); })}
      </nav>
      <section className={card + ' space-y-6'}>
        <h3 className="text-xl font-extrabold">{partName(part, lang)}</h3>
        {error && (
          <p role="alert" className="text-rose-700">
            {error}
          </p>
        )}
        {part === 'slides' && (
          <>
            <SlideViewer
              slides={lesson.slides}
              basePath={base}
              query={query}
              lang={lang}
              onViewedAll={() => setViewed(true)}
            />
            <p className="text-sm text-slate-500">
              {say(
                lang,
                'View every slide, then confirm your review. This does not count as a quiz score.',
                '看完每页课件后，确认已复习。查看课件不计入答题成绩。',
              )}
            </p>
          </>
        )}
        {retrying && <div className="rounded-xl bg-indigo-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-indigo-900 font-semibold">{say(lang, 'New attempt — your earlier work is saved.', '再次尝试：以前的作答已保存。')}</p>
          <button className={secondary} disabled={busy || micBusy || !!pending.current} onClick={() => {
            if ((writing.trim() || recording) && !window.confirm(say(lang, 'Discard this unsubmitted attempt?', '放弃这次尚未提交的作答？'))) return;
            setRetrying(false); setWriting(''); setRecording(null); setError('');
          }}>{say(lang, 'Back to saved result', '返回已保存的结果')}</button>
        </div>}
        {showForm && learning && <LessonVocabulary words={words} lang={lang} onStart={() => setVocabularyPractice(true)} />}
        {showForm && !!questions.length && !learning && <LessonQuiz key={part} questions={questions} answers={answers} onChange={setAnswers}
          lang={lang} disabled={locked} busy={busy} pending={!!pending.current} readOnly={data.readOnly} onSubmit={submit}
          onLearn={part === 'vocabulary' && words.length ? () => setVocabularyPractice(false) : undefined} />}
        {showForm && part === 'writing' && (
          <>
            <p className="text-lg leading-relaxed">{say(lang, lesson.writing.prompt, lesson.writing.promptZh)}</p>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              {lesson.writing.starters.map((s) => (
                <p key={s}>{s}</p>
              ))}
            </div>
            {!data.readOnly && <label className="block font-bold">
              {say(lang, 'Your writing', '你的作文')}
              <textarea
                className={field + ' mt-2 min-h-44'}
                maxLength={2000}
                disabled={locked || busy || !!pending.current}
                value={writing}
                onChange={(e) => setWriting(e.target.value)}
              />
            </label>}
            <p className="text-sm text-slate-500">
              {say(
                lang,
                'Submit for an AI score out of 5, feedback and a suggestion. Your teacher can also read your writing. Completion earns 3 stars once, separate from your score.',
                '提交后可获得 5 分制 AI 评分、反馈和建议，老师也可以查看作文。完成任务可获得一次 3 颗星星奖励，与评分分开计算。',
              )}
            </p>
          </>
        )}
        {showForm && part === 'speaking' && (
          <LessonSpeaking
            key={`${lesson.id}-${attempts.length}`}
            sentence={lesson.speaking.sentence}
            hintZh={lesson.speaking.hintZh}
            lang={lang}
            disabled={locked || busy || !!pending.current}
            onRecording={setRecording}
            onStatus={setMicBusy}
          />
        )}
        {!data.readOnly && showForm && !questions.length && (
          <button
            className={button + ' w-full sm:w-auto'}
            disabled={locked || busy || micBusy || (!canSubmit && !pending.current)}
            onClick={submit}
          >
            {busy
              ? (part === 'writing' ? say(lang, 'Getting AI feedback and saving…', '正在获取 AI 反馈并保存…') : say(lang, 'Saving…', '正在保存…'))
              : pending.current
                ? say(lang, 'Retry saving this answer', '重试保存这份答案')
                : part === 'slides'
                  ? say(lang, 'I have reviewed all slides', '我已复习所有课件')
                  : say(lang, 'Submit this activity', '提交本项练习')}
          </button>
        )}
        {showForm && !data.readOnly && ['speaking', 'writing'].includes(part) && (
          <p className="text-sm text-slate-500">
            {say(
              lang,
              max === 1 ? 'One submission only. Check your answers before submitting.' : `${Math.max(0, max - attempts.length)} attempts remaining. Your answer is saved only when you submit.`,
              max === 1 ? '只能提交一次，请检查答案后再提交。' : `还可以尝试 ${Math.max(0, max - attempts.length)} 次。点击提交后才会保存答案。`,
            )}
          </p>
        )}
        {!!attempts.length && !retrying && <LessonResult attempts={attempts} part={part} lesson={lesson} base={base} query={query} lang={lang}
          remaining={Math.max(0, max - attempts.length)} readOnly={data.readOnly} onRetry={() => { setRetrying(true); setError(''); }} />}
        {part === 'vocabulary' && !!attempts.length && !!words.length && <details className="rounded-xl border border-slate-200 p-4 sm:p-5">
          <summary className="font-bold cursor-pointer py-3">{say(lang, 'Review word cards', '复习单词卡片')}</summary>
          <div className="mt-5"><LessonVocabulary words={words} lang={lang} /></div>
        </details>}
      </section>
    </div>
  );
}
