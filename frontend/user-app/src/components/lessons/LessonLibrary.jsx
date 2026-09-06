import React, { useEffect, useState, useId } from 'react';
import { lessonApi, lessonError, requestId, collectionName, card, field, button, secondary, say } from './shared';
import { prepareSlides } from './prepareSlides';
import { SlideViewer } from './SlideViewer';
const emptyQuestion = () => ({ prompt: '', options: ['', '', ''], correctIndex: 0, explanation: '' });
const emptyLesson = () => ({
  title: '',
  titleZh: '',
  number: 1,
  vocabulary: Array.from({ length: 4 }, () => ({ ...emptyQuestion(), word: '' })),
  questions: Array.from({ length: 3 }, emptyQuestion),
  speaking: { sentence: '', hintZh: '请大声朗读这个句子。' },
  writing: { prompt: '', promptZh: '', starters: ['There is a ...', 'There are ...', 'I like ... because ...'] },
});
const editable = (row) => ({
  ...row,
  vocabulary: row.vocabulary.map(editQuestion),
  questions: row.questions.map(editQuestion),
});
const editQuestion = (q) => ({
  ...q,
  options: q.options.map((o) => o.text),
  correctIndex: q.options.findIndex((o) => o.id === q.correctOptionId),
});
function QuestionEditor({ items, onChange, lang, vocabulary = false }) {
  const groupId = useId();
  return (
    <div className="space-y-5">
      {items.map((q, index) => (
        <fieldset key={index} className="rounded-xl border p-4 space-y-3">
          <legend className="font-bold px-2">{say(lang, `Question ${index + 1}`, `第 ${index + 1} 题`)}</legend>
          {vocabulary ? <>
            <label className="block">{say(lang, 'English word', '英语单词')}
              <input required className={field} maxLength={60} value={q.word ?? /^What does [“"']?(.+?)[”"']? mean\?$/i.exec(q.prompt)?.[1] ?? ''}
                onChange={e => onChange(items.map((item, i) => i === index ? { ...item, word: e.target.value, prompt: `What does “${e.target.value.trim()}” mean?` } : item))} />
            </label>
            <p className="text-slate-600 text-sm">{q.prompt || say(lang, 'The quiz question is created from this word.', '系统会用这个单词生成词义题。')}</p>
            <p className="text-sm font-semibold text-emerald-800">{say(lang, 'Flashcard meaning: ', '卡片中文意思：')}{q.options[q.correctIndex] || say(lang, 'Enter Chinese choices and select the correct one below.', '请在下面填写中文选项并选择正确答案。')}</p>
          </> : <label className="block">
            {say(lang, 'Question in English', '英文问题')}
            <input
              required
              className={field}
              value={q.prompt}
              maxLength={600}
              onChange={(e) =>
                onChange(items.map((item, i) => (i === index ? { ...item, prompt: e.target.value } : item)))
              }
            />
          </label>}
          {q.options.map((o, j) => (
            <label className="flex gap-3 items-center" key={j}>
              <input
                type="radio"
                name={`${groupId}-${index}`}
                checked={q.correctIndex === j}
                onChange={() => onChange(items.map((item, i) => (i === index ? { ...item, correctIndex: j } : item)))}
                aria-label={say(lang, `Choice ${j + 1} is correct`, `选项 ${j + 1} 为正确答案`)}
              />
              <input
                required
                aria-label={say(lang, `Choice ${j + 1}`, `选项 ${j + 1}`)}
                className={field}
                maxLength={300}
                value={o}
                onChange={(e) =>
                  onChange(
                    items.map((item, i) =>
                      i === index
                        ? { ...item, options: item.options.map((v, n) => (n === j ? e.target.value : v)) }
                        : item,
                    ),
                  )
                }
              />
            </label>
          ))}
          <label className="block">
            {say(lang, 'Short explanation', '简短解释')}
            <input
              className={field}
              value={q.explanation}
              maxLength={1000}
              onChange={(e) =>
                onChange(items.map((item, i) => (i === index ? { ...item, explanation: e.target.value } : item)))
              }
            />
          </label>
        </fieldset>
      ))}
    </div>
  );
}
export function LessonLibrary({ lang, onBack, api = lessonApi }) {
  const [collections, setCollections] = useState([]),
    [collection, setCollection] = useState(''),
    [term, setTerm] = useState({ season: 'summer', year: new Date().getFullYear(), level: 2 }),
    [lessons, setLessons] = useState([]),
    [draft, setDraft] = useState(null),
    [form, setForm] = useState(emptyLesson),
    [prepared, setPrepared] = useState([]),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [editing, setEditing] = useState(false);
  useEffect(() => {
    let active = true;
    api('/collections')
      .then((d) => {
        if (active) setCollections(d.collections);
      })
      .catch((e) => {
        if (active) setError(lessonError(e, lang));
      });
    return () => {
      active = false;
    };
  }, [api, lang]);
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(lessonError(e, lang));
    } finally {
      setBusy(false);
      setProgress('');
    }
  };
  const load = async (id) => {
    setCollection(id);
    setLessons(id ? (await api(`/admin/collections/${id}`)).lessons : []);
    setDraft(null);
    setEditing(false);
    setPrepared([]);
  };
  const save = async () => {
    if (draft) {
      await api(`/admin/lessons/${draft._id}/content`, form);
      return draft._id;
    }
    const result = await api('/admin/lessons', { ...form, collectionId: collection });
    const row = (await api(`/admin/lessons/${result.lesson.id}`)).lesson;
    setDraft(row);
    return row._id;
  };
  const upload = async (id) => {
    for (let n = 0; n < prepared.length; n++) {
      setProgress(
        say(lang, `Uploading slide ${n + 1} / ${prepared.length}`, `正在上传第 ${n + 1} / ${prepared.length} 页`),
      );
      await api(`/admin/lessons/${id}/assets`, prepared[n]);
    }
    setPrepared([]);
    setDraft((await api(`/admin/lessons/${id}`)).lesson);
  };
  return (
    <div className="space-y-6">
      <button className={secondary} disabled={busy} onClick={onBack}>
        {say(lang, '← Back to classes', '← 返回班级')}
      </button>
      <h2 className="text-2xl font-extrabold">{say(lang, 'Lesson library · Administrator', '课程资料库 · 管理员')}</h2>
      <p className="text-slate-500 leading-relaxed">
        {say(
          lang,
          'Upload a PDF exported from PowerPoint, or slide images. The browser creates smaller previews before upload. Remove teacher-only notes first. Only you can publish lessons; teachers choose a course for their class.',
          '请上传从 PowerPoint 导出的 PDF 或幻灯片图片。浏览器会先压缩预览图再上传。请先删除教师专用提示。只有管理员可以发布课程，老师为班级选择课程。',
        )}
      </p>
      {error && (
        <p role="alert" className="text-rose-700 bg-rose-50 rounded-xl p-4">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-emerald-800 bg-emerald-50 rounded-xl p-4">
          {notice}
        </p>
      )}
      {busy && <p role="status">{progress || say(lang, 'Saving…', '正在保存…')}</p>}
      {!editing && (
        <>
          <form
            className={card + ' space-y-4'}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const result = await api('/admin/collections', term);
                setCollections((await api('/collections')).collections);
                await load(result.collection.id);
              });
            }}
          >
            <h3 className="font-bold text-xl">{say(lang, 'Create a course', '创建课程系列')}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <label>
                {say(lang, 'Season', '季节')}
                <select
                  className={field}
                  value={term.season}
                  onChange={(e) => setTerm({ ...term, season: e.target.value })}
                >
                  {['spring', 'summer', 'autumn', 'winter'].map((s, i) => (
                    <option key={s} value={s}>
                      {say(lang, ['Spring', 'Summer', 'Autumn', 'Winter'][i], ['春季', '暑期', '秋季', '寒假'][i])}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {say(lang, 'Year', '年份')}
                <input
                  className={field}
                  type="number"
                  min={2020}
                  max={2100}
                  required
                  value={term.year}
                  onChange={(e) => setTerm({ ...term, year: Number(e.target.value) })}
                />
              </label>
              <label>
                {say(lang, 'Learning level', '学习级别')}
                <select
                  className={field}
                  value={term.level}
                  onChange={(e) => setTerm({ ...term, level: Number(e.target.value) })}
                >
                  {[1, 2, 3].map((l) => (
                    <option key={l} value={l}>
                      {say(lang, `Level ${l} · Grades ${l * 2 - 1}–${l * 2}`, `级别 ${l} · ${l * 2 - 1}–${l * 2} 年级`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className={button} disabled={busy}>
              {say(lang, 'Create / Open course', '创建 / 打开课程系列')}
            </button>
          </form>
          <label className="block font-bold">
            {say(lang, 'Available courses', '已有课程系列')}
            <select
              aria-label={say(lang, 'Available courses', '已有课程系列')}
              className={field + ' mt-2'}
              value={collection}
              disabled={busy}
              onChange={(e) => run(() => load(e.target.value))}
            >
              <option value="">{say(lang, 'Choose a course', '请选择课程系列')}</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {collectionName(c, lang)}
                </option>
              ))}
            </select>
          </label>
          {collection && (
            <>
              <button
                className={button}
                disabled={busy}
                onClick={() => {
                  setForm({ ...emptyLesson(), number: Math.max(0, ...lessons.map((l) => l.number)) + 1 });
                  setDraft(null);
                  setEditing(true);
                }}
              >
                {say(lang, 'Add lesson', '添加课程')}
              </button>
              <div className="grid md:grid-cols-2 gap-4">
                {lessons.map((l) => (
                  <button
                    className={card + ' text-left'}
                    key={l.id}
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const row = (await api(`/admin/lessons/${l.id}`)).lesson;
                        setDraft(row);
                        setForm(editable(row));
                        setEditing(true);
                      })
                    }
                  >
                    <span className="block font-bold">
                      {l.number}. {say(lang, l.title, l.titleZh)}
                    </span>
                    <span className="block text-sm mt-2">
                      {l.published
                        ? say(lang, 'Published · Available immediately', '已发布 · 可立即学习')
                        : say(lang, 'Draft · Not visible to students', '草稿 · 学生暂不可见')}{' '}
                      · {l.slideCount} {say(lang, 'slides', '页')}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {editing && (
        <form
          className={card + ' space-y-6'}
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const id = await save();
              await upload(id);
              setNotice(
                say(
                  lang,
                  'Draft saved. Preview the slides and check every answer before publishing.',
                  '草稿已保存。发布前请预览课件并检查每道题的答案。',
                ),
              );
            });
          }}
        >
          <button
            type="button"
            className={secondary}
            disabled={busy}
            onClick={() => {
              if (
                !draft?.published &&
                !window.confirm(
                  say(lang, 'Return to the library? Unsaved edits will be lost.', '返回资料库？未保存的修改将丢失。'),
                )
              )
                return;
              run(() => load(collection));
            }}
          >
            {say(lang, 'Back to library', '返回资料库')}
          </button>
          <fieldset disabled={busy || draft?.published} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <label>
                {say(lang, 'English title', '英文标题')}
                <input
                  className={field}
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label>
                {say(lang, 'Chinese title', '中文标题')}
                <input
                  className={field}
                  required
                  maxLength={120}
                  value={form.titleZh}
                  onChange={(e) => setForm({ ...form, titleZh: e.target.value })}
                />
              </label>
            </div>
            <label className="block">
              {say(lang, 'Lesson number', '课次')}
              <input
                className={field}
                type="number"
                min={1}
                max={100}
                disabled={!!draft}
                value={form.number}
                onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              />
            </label>
            <h3 className="text-xl font-bold">{say(lang, 'Vocabulary review', '词汇复习')}</h3>
            <p className="text-sm text-slate-500">
              {say(
                lang,
                'Use words from these slides. Give short Chinese definitions, distinct choices and one correct answer.',
                '请使用课件中的词汇。中文释义应简短准确，选项不重复，每题只有一个正确答案。',
              )}
            </p>
            <QuestionEditor vocabulary items={form.vocabulary} onChange={(v) => setForm({ ...form, vocabulary: v })} lang={lang} />
            <h3 className="text-xl font-bold">{say(lang, 'Speaking', '口语')}</h3>
            <label className="block">
              {say(lang, 'Short sentence to read aloud', '朗读短句')}
              <input
                required
                className={field}
                maxLength={280}
                value={form.speaking.sentence}
                onChange={(e) => setForm({ ...form, speaking: { ...form.speaking, sentence: e.target.value } })}
              />
            </label>
            <h3 className="text-xl font-bold">{say(lang, 'Writing', '写作')}</h3>
            {['prompt', 'promptZh'].map((key, i) => (
              <label key={key} className="block">
                {say(lang, i ? 'Chinese prompt' : 'English prompt', i ? '中文提示' : '英文提示')}
                <textarea
                  required
                  className={field}
                  maxLength={600}
                  value={form.writing[key]}
                  onChange={(e) => setForm({ ...form, writing: { ...form.writing, [key]: e.target.value } })}
                />
              </label>
            ))}
            {form.writing.starters.map((s, i) => (
              <label className="block" key={i}>
                {say(lang, `Sentence starter ${i + 1}`, `句子开头 ${i + 1}`)}
                <input
                  required
                  className={field}
                  maxLength={120}
                  value={s}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      writing: {
                        ...form.writing,
                        starters: form.writing.starters.map((v, n) => (n === i ? e.target.value : v)),
                      },
                    })
                  }
                />
              </label>
            ))}
            <h3 className="text-xl font-bold">{say(lang, 'Quick check', '小测验')}</h3>
            <p className="text-sm text-slate-500">
              {say(
                lang,
                'Ask concrete Who, What, Where or When questions answered by these slides.',
                '请根据课件提出具体的 Who、What、Where 或 When 问题。',
              )}
            </p>
            <QuestionEditor items={form.questions} onChange={(q) => setForm({ ...form, questions: q })} lang={lang} />
          </fieldset>
          {!draft?.published && (
            <>
              <label className="block font-bold">
                {say(lang, 'Add PDF / slide images (up to 40 slides)', '添加 PDF / 幻灯片图片（最多 40 页）')}
                <input
                  className={field + ' mt-2 file:mr-3 file:whitespace-normal'}
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    run(async () => {
                      setProgress(say(lang, 'Preparing smaller previews…', '正在生成压缩预览图…'));
                      const images = await prepareSlides(files, (n, total) =>
                        setProgress(say(lang, `Preparing slide ${n} / ${total}`, `正在处理第 ${n} / ${total} 页`)),
                      );
                      if (images.length + (draft?.slides.length || 0) > 40)
                        throw Error('A lesson can contain at most 40 slides.');
                      setPrepared(images.map((s) => ({ ...s, requestId: requestId() })));
                    });
                  }}
                />
              </label>
              {!!prepared.length && (
                <div className="space-y-3">
                  <p className="font-bold">
                    {say(
                      lang,
                      `${prepared.length} new slides · ${(prepared.reduce((n, s) => n + s.bytes, 0) / 1000000).toFixed(2)} MB after compression`,
                      `${prepared.length} 页新课件 · 压缩后 ${(prepared.reduce((n, s) => n + s.bytes, 0) / 1000000).toFixed(2)} MB`,
                    )}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {prepared.map((s, i) => (
                      <div key={s.requestId}>
                        <img alt={s.alt} src={`data:${s.mime};base64,${s.data}`} className="w-full border rounded-lg" />
                        <p className="text-sm mt-1">
                          {i + 1}. {s.alt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-500">
                {say(
                  lang,
                  'Only compressed preview images are uploaded; the original PDF/PPT stays on your device. Review all slides for readability.',
                  '只上传压缩后的预览图，原始 PDF/PPT 留在你的设备上。请检查每页的文字是否清晰。',
                )}
              </p>
              <button className={button} type="submit" disabled={busy}>
                {say(lang, 'Save draft and upload previews', '保存草稿并上传预览图')}
              </button>
            </>
          )}
          {!!draft?.slides.length && (
            <SlideViewer slides={draft.slides} basePath={`/admin/lessons/${draft._id}`} lang={lang} />
          )}
          {draft && !draft.published && (
            <button
              className={button + ' w-full'}
              type="button"
              disabled={busy || !draft.slides.length || !!prepared.length}
              onClick={() => {
                if (
                  !window.confirm(
                    say(
                      lang,
                      'Publish now? Every class using this course will have immediate access. Published questions stay fixed to protect saved scores.',
                      '现在发布？使用本课程系列的所有班级都将立即看到新课。发布后题目将固定，以保护已保存的成绩。',
                    ),
                  )
                )
                  return;
                run(async () => {
                  await api(`/admin/lessons/${draft._id}/content`, form);
                  await api(`/admin/lessons/${draft._id}/publish`, {});
                  setDraft((await api(`/admin/lessons/${draft._id}`)).lesson);
                  setNotice(
                    say(
                      lang,
                      'Published. Matching classes can start this lesson now.',
                      '已发布。对应班级现在即可开始学习。',
                    ),
                  );
                });
              }}
            >
              {say(lang, 'Publish — available immediately', '发布 — 立即开放')}
            </button>
          )}
          {draft?.published && (
            <p className="text-emerald-800 font-bold">
              {say(
                lang,
                'Published. Content is fixed so past scores remain accurate. Add a new lesson for revised content.',
                '已发布。内容已固定，以保证历史成绩准确。需要修改内容时，请添加新课程。',
              )}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
