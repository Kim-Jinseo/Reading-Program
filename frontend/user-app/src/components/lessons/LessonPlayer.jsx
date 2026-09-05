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
  mediaUrl,
  dateText,
} from './shared';
import { SlideViewer } from './SlideViewer';
import { LessonSpeaking } from './LessonSpeaking';
const parts = ['slides', 'vocabulary', 'speaking', 'writing', 'questions'];
function SavedAudio({ path, lang }) {
  const [url, setUrl] = React.useState(''),
    [error, setError] = React.useState(false);
  React.useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url ? (
    <audio controls className="w-full max-w-md" src={url} />
  ) : (
    <button
      className={secondary}
      onClick={() =>
        mediaUrl(path)
          .then(setUrl)
          .catch(() => setError(true))
      }
    >
      {error ? say(lang, 'Retry audio', '重试音频') : say(lang, 'Listen to saved recording', '听已提交的录音')}
    </button>
  );
}
export function LessonPlayer({ data: initial, classId, lang, onBack, api = lessonApi, studentId }) {
  const [data, setData] = useState(initial),
    [part, setPart] = useState('slides'),
    [answers, setAnswers] = useState({}),
    [writing, setWriting] = useState(''),
    [recording, setRecording] = useState(null),
    [micBusy, setMicBusy] = useState(false),
    [viewed, setViewed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const pending = React.useRef(null),
    lock = React.useRef(false);
  const lesson = data.lesson;
  const base = `/classes/${classId}/lessons/${lesson.id}`,
    query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
  const attempts = data.parts.find((p) => p.part === part)?.attempts || [],
    max = part === 'slides' ? 1 : 3,
    locked = data.readOnly || attempts.length >= max;
  const questions = ['vocabulary', 'questions'].includes(part) ? lesson[part] : [];
  const canSubmit =
    part === 'slides'
      ? viewed
      : part === 'writing'
        ? writing.trim().length > 0
        : part === 'speaking'
          ? !!recording
          : questions.every((q) => answers[q.id]);
  const submit = async () => {
    if (lock.current) return;
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
    } catch (e) {
      if (e.status >= 400 && e.status < 500) pending.current = null;
      setError(lessonError(e, lang));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const completed = parts.every((p) => data.parts.some((row) => row.part === p && row.attempts.length));
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
        {say(lang, '← Back to class', '← 返回班级')}
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
        {data.readOnly && (
          <p className="mt-3 font-bold text-amber-800">
            {data.isOwner
              ? say(lang, 'Teacher preview / submitted work', '教师预览 / 已提交作业')
              : say(lang, 'Earlier course — saved work is read-only.', '往期课程，已保存的作业仅供查看。')}
          </p>
        )}
      </header>
      <nav aria-label={say(lang, 'Lesson activities', '学习任务')} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {parts.map((p) => (
          <button
            key={p}
            aria-pressed={part === p}
            disabled={busy || micBusy || !!pending.current}
            className={(part === p ? button : secondary) + ' text-sm px-3'}
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
            }}
          >
            {data.parts.some((r) => r.part === p && r.attempts.length) ? '✓ ' : ''}
            {partName(p, lang)}
          </button>
        ))}
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
        {questions.map((q, index) => (
          <fieldset key={q.id} disabled={locked || busy || !!pending.current} className="space-y-3">
            <legend className="font-bold mb-3">
              {index + 1}. {q.prompt}
            </legend>
            {q.options.map((o, i) => (
              <label
                key={o.id}
                className={`flex items-start gap-3 border-2 rounded-xl p-4 min-h-14 cursor-pointer ${answers[q.id] === o.id ? 'bg-indigo-50 border-indigo-500' : 'border-slate-200 bg-white'}`}
              >
                <input
                  className="mt-1 shrink-0"
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === o.id}
                  value={o.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                />
                <span className="break-words">
                  {String.fromCharCode(65 + i)}. {o.text}
                </span>
              </label>
            ))}
          </fieldset>
        ))}
        {part === 'writing' && (
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
                'Your teacher can read your submitted writing. It is not given an automatic score.',
                '老师可以阅读你提交的作文。作文不自动评分。',
              )}
            </p>
          </>
        )}
        {part === 'speaking' && (
          <LessonSpeaking
            key={`${lesson.id}-${attempts.length}`}
            sentence={lesson.speaking.sentence}
            lang={lang}
            disabled={locked || busy || !!pending.current}
            onRecording={setRecording}
            onStatus={setMicBusy}
          />
        )}
        {!data.readOnly && (
          <button
            className={button + ' w-full sm:w-auto'}
            disabled={locked || busy || micBusy || (!canSubmit && !pending.current)}
            onClick={submit}
          >
            {busy
              ? say(lang, 'Saving…', '正在保存…')
              : pending.current
                ? say(lang, 'Retry saving this answer', '重试保存这份答案')
                : part === 'slides'
                  ? say(lang, 'I have reviewed all slides', '我已复习所有课件')
                  : say(lang, 'Submit this activity', '提交本项练习')}
          </button>
        )}
        {part !== 'slides' && (
          <p className="text-sm text-slate-500">
            {say(
              lang,
              `${attempts.length} of ${max} attempts saved. Answers are saved only when you submit.`,
              `${attempts.length} / ${max} 次已保存。点击提交后才会保存答案。`,
            )}
          </p>
        )}
        {!!attempts.length && (
          <div className="border-t pt-5 space-y-4">
            <h4 className="font-bold">{say(lang, 'Saved work', '已保存的作业')}</h4>
            {attempts.map((a, i) => (
              <div key={a.requestId} className="rounded-xl bg-slate-50 p-4 space-y-3 break-words">
                <p className="text-sm text-slate-500">
                  {i + 1}. {dateText(lang, a.submittedAt)}
                </p>
                {a.score !== undefined && (
                  <p className="font-bold text-emerald-800">
                    {a.score} / {a.total}
                    {a.automaticallyAssessed ? say(lang, ' · Automatic speaking feedback', ' · 口语自动反馈') : ''}
                  </p>
                )}
                {a.text && <p className="whitespace-pre-wrap">{a.text}</p>}
                {a.feedback && <p>{a.feedback}</p>}
                {a.transcript && (
                  <p>
                    {say(lang, 'Heard: ', '识别内容：')}
                    {a.transcript}
                  </p>
                )}
                {a.hasAudio && <SavedAudio lang={lang} path={`${base}/audio/${a.requestId}${query}`} />}
                {a.responses?.map((r) => {
                  const q = lesson[part].find((q) => q.id === r.questionId);
                  return (
                    <div key={r.questionId} className="text-sm">
                      <p className="font-bold">{q?.prompt}</p>
                      <p>
                        {say(lang, 'Your answer: ', '你的答案：')}
                        {q?.options.find((o) => o.id === r.optionId)?.text} {r.correct ? '✓' : '✗'}
                      </p>
                      {!r.correct && (
                        <p>
                          {say(lang, 'Correct answer: ', '正确答案：')}
                          {q?.options.find((o) => o.id === r.correctOptionId)?.text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
