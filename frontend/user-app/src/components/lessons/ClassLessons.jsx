import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lessonApi, lessonError, collectionName, card, button, secondary, say } from './shared';
import { CoursePicker } from './CoursePicker';
export function ClassLessons({ classId, isOwner, lang, onOpen, api = lessonApi, refreshKey = 0, showProgress = true, settingsRequest = 0, settingsContainer, onData, visible = true }) {
  const [data, setData] = useState(null),
    [collections, setCollections] = useState([]),
    [choice, setChoice] = useState(''),
    [report, setReport] = useState(null),
    [student, setStudent] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [settings, setSettings] = useState(false);
  const language = useRef(lang);
  const generation = useRef(0);
  const notify = useRef(onData);
  notify.current = onData;
  language.current = lang;
  useEffect(() => { if (settingsRequest) setSettings(true); }, [settingsRequest]);
  useEffect(() => { if (data) notify.current?.(data); }, [data]);
  const refresh = async () => {
    const result = await api(`/classes/${classId}`, undefined, { fresh: true });
    setData(result);
    setChoice(result.collection?._id || '');
    if (isOwner && showProgress) {
      setReport(await api(`/classes/${classId}/report`, undefined, { fresh: true }));
    }
  };
  useEffect(() => {
    if (!visible) { generation.current++; return; }
    let active = true;
    const epoch = ++generation.current;
    setStudent(null);
    api(`/classes/${classId}`, undefined, { fresh: refreshKey > 0 })
      .then((result) => {
        if (active) {
          setData(result);
          setChoice(result.collection?._id || '');
        }
      })
      .catch((e) => {
        if (active) setError(lessonError(e, language.current));
      });
    if (isOwner && showProgress)
      api(`/classes/${classId}/report`, undefined, { fresh: refreshKey > 0 })
        .then(r => {
          if (active) {
            setReport(r);
          }
        })
        .catch((e) => {
          if (active) setError(lessonError(e, language.current));
        });
    return () => {
      active = false;
      generation.current = epoch + 1;
    };
  }, [api, classId, isOwner, refreshKey, showProgress, visible]);
  useEffect(() => {
    if (!isOwner || !settings) return;
    let active = true;
    api('/collections').then(result => { if (active) setCollections(result.collections); })
      .catch(e => { if (active) setError(lessonError(e, language.current)); });
    return () => { active = false; };
  }, [api, isOwner, settings]);
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(lessonError(e, lang));
    } finally {
      setBusy(false);
    }
  };
  const open = (id, studentId) => run(async () => {
    const request = generation.current;
    const result = await api(`/classes/${classId}/lessons/${id}${studentId ? `?studentId=${studentId}` : ''}`);
    if (request === generation.current) onOpen(result, studentId);
  });
  const openStudent = s => run(async () => {
    const request = generation.current;
    const result = await api(`/classes/${classId}/students/${s.id}`);
    if (request === generation.current) setStudent({ id: s.id, name: s.name, ...result });
  });
  // Keep course saving in one place while letting the teacher page position its panel.
  const placeSettings = form => settingsContainer === undefined ? form : settingsContainer ? createPortal(form, settingsContainer) : null;
  const list = (rows, archived = false) => (
    <div className="grid md:grid-cols-2 gap-4">
      {rows.map((l) => (
        <article key={l.id} className={card + ' space-y-4'}>
          <p className="text-sm font-bold text-indigo-600">{say(lang, `Lesson ${l.number}`, `第 ${l.number} 课`)}</p>
          <h4 className="text-xl font-bold">{say(lang, l.title, l.titleZh)}</h4>
          {!isOwner && (
            <p className="text-slate-500">
              {say(
                lang,
                `${l.progress.done.length} / ${l.progress.total} activities submitted`,
                `${l.progress.done.length} / ${l.progress.total} 项学习任务已提交`,
              )}
            </p>
          )}
          <button className={button + ' w-full'} disabled={busy} onClick={() => open(l.id)}>
            {archived
              ? say(lang, 'Review saved work', '查看往期作业')
              : isOwner
                ? say(lang, 'Preview lesson', '预览课程')
                : say(lang, 'Open lesson', '开始学习')}
          </button>
        </article>
      ))}
    </div>
  );
  return (
    <section className="space-y-5" data-testid="class-lessons">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-2xl font-extrabold">{say(lang, 'Class lessons', '班级课程')}</h3>
        {isOwner && showProgress && (
          <button className={secondary} onClick={() => setSettings((s) => !s)}>
            {say(lang, 'Change course', '修改课程')}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-rose-700 rounded-xl bg-rose-50 p-4">
          {error}
        </p>
      )}
      {!data ? (
        <button className={secondary} onClick={() => run(refresh)}>
          {say(lang, 'Load lessons', '加载课程')}
        </button>
      ) : (
        <>
          {showProgress && <p className="text-slate-500">
            {data.collection
              ? collectionName(data.collection, lang)
              : say(lang, 'No course selected yet.', '尚未选择课程。')}
          </p>}
          {isOwner && settings && visible && placeSettings(
            <form
              className={card + ' space-y-5'}
              onSubmit={(e) => {
                e.preventDefault();
                const selected = collections.find((c) => c.id === choice);
                if (
                  !window.confirm(
                    say(
                      lang,
                      `Change to ${collectionName(selected, lang)}? Current lessons will change. Earlier submissions will remain in history; their scores will not be copied to different lessons.`,
                      `更改为 ${collectionName(selected, lang)}？当前课程会更新。原来的作业保留在历史记录中，成绩不会转移到其他课程。`,
                    ),
                  )
                )
                  return;
                run(async () => {
                  await api(`/classes/${classId}/settings`, { collectionId: choice, revision: data.revision });
                  await refresh();
                  setStudent(null);
                  setSettings(false);
                });
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-bold text-lg">{say(lang, 'Class settings', '班级设置')}</h4><button type="button" className={secondary} disabled={busy} onClick={() => setSettings(false)}>{say(lang, 'Close settings', '关闭设置')}</button></div>
              <CoursePicker collections={collections} value={choice} onChange={setChoice} lang={lang} />
              <button type="submit" disabled={busy || choice === data.collection?._id} className={button}>
                {say(lang, 'Update class lessons', '更新班级课程')}
              </button>
            </form>
          )}
          <p className="text-sm text-emerald-700">
            {say(
              lang,
              'All published lessons are available now. Work through them in lesson order.',
              '所有已发布课程均可立即学习。建议按课次顺序学习。',
            )}
          </p>
          {data.lessons.length ? (
            list(data.lessons)
          ) : (
            <p className={card}>{say(lang, 'No published lessons for this course yet.', '该课程尚未发布课件。')}</p>
          )}
          {!!data.history.length && (
            <details className="space-y-4">
              <summary className="font-bold cursor-pointer min-h-12 py-3">
                {say(lang, 'Earlier course work', '往期课程作业')}
              </summary>
              {list(data.history, true)}
            </details>
          )}
        </>
      )}
      {isOwner && showProgress && report && (
        <section className={card + ' space-y-5'}>
          <h3 className="text-xl font-extrabold">
            {say(lang, 'Lesson progress and consistency', '课程进度与学习规律')}
          </h3>
          <p className="text-sm text-slate-500">
            {say(
              lang,
              'Study days count submitted activities in the last 28 calendar days (China time), not logins or opening slides. Completion means all five activities were submitted, not that every answer was correct.',
              '学习天数统计最近 28 个自然日（中国时间）内提交过练习的天数，不计算登录或浏览课件。完成表示五项任务均已提交，不代表全答对。',
            )}
          </p>
          <div className="grid lg:grid-cols-2 gap-3">
            {report.students.map((s) => (
              <button
                key={s.id}
                disabled={busy}
                className="text-left p-4 border rounded-xl min-w-0 space-y-2"
                onClick={() => openStudent(s)}
              >
                <span className="font-bold block break-words">{s.name}</span>
                <span className="text-sm block">
                  {say(
                    lang,
                    `${s.completed} / ${s.assigned} lessons complete · ${s.studyDays28} study days`,
                    `${s.completed} / ${s.assigned} 课已完成 · 学习 ${s.studyDays28} 天`,
                  )}
                </span>
                <span className="text-indigo-600 text-sm block">
                  {say(lang, 'View activities and submitted work →', '查看练习和已提交作业 →')}
                </span>
              </button>
            ))}
          </div>
          {!report.students.length && (
            <p>{say(lang, 'Student progress will appear after students join.', '学生加入后，这里将显示学习进度。')}</p>
          )}
          {student && (
            <div className="border-t pt-5 space-y-3">
              <h4 className="font-bold">{student.name}</h4>
              {student.lessons.map((l) => (
                <button
                  className={secondary + ' block text-left w-full'}
                  disabled={busy}
                  key={l.id}
                  onClick={() => open(l.id, student.id)}
                >
                  {say(lang, l.title, l.titleZh)} · {l.progress.done.length}/5{' '}
                  {l.archived ? say(lang, '(Earlier course)', '（往期课程）') : ''}
                  <span className="block text-sm font-normal mt-2">
                    {say(
                      lang,
                      'View vocabulary, speaking, writing and quiz results',
                      '查看词汇、口语、写作和小测验结果',
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
