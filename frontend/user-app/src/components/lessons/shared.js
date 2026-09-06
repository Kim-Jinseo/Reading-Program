import { say } from '../classes/shared';
import { classRequest } from '../../utils/classReads';
export { say, card, field, button, secondary, dateText } from '../classes/shared';
export const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });
export async function lessonApi(path, body, { fresh = false } = {}) {
  const token = localStorage.getItem('token');
  return classRequest({ token, key: '/lessons' + path, write: body !== undefined, fresh }, async () => {
  const res = await fetch('/api/lessons' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...authHeaders(), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success)
    throw Object.assign(new Error(data.error || 'Unable to load lessons. Please try again.'), {
      code: data.code,
      status: res.status,
    });
  return data;
  });
}
export const requestId = () =>
  window.crypto?.randomUUID?.() || `lesson-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const collectionName = (c, lang) =>
  c
    ? `${c.year} ${say(lang, { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' }[c.season], { spring: '春季', summer: '暑期', autumn: '秋季', winter: '寒假' }[c.season])} · ${say(lang, `Level ${c.level} (Grades ${c.level * 2 - 1}–${c.level * 2})`, `级别 ${c.level}（${c.level * 2 - 1}–${c.level * 2} 年级）`)}`
    : '';
export const partName = (part, lang) =>
  ({
    slides: say(lang, 'Slides', '课件'),
    vocabulary: say(lang, 'Vocabulary', '词汇'),
    speaking: say(lang, 'Speaking', '口语'),
    writing: say(lang, 'Writing', '写作'),
    questions: say(lang, 'Quick check', '小测验'),
  })[part];
export const blobBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
export async function mediaUrl(path, signal) {
  const response = await fetch('/api/lessons' + path, { headers: authHeaders(), signal });
  if (!response.ok) throw Error('Unable to load this file.');
  return URL.createObjectURL(await response.blob());
}
export const lessonError = (e, lang) =>
  lang !== 'zh'
    ? e.message
    : {
        lessons_changed: '班级课程已更新。请返回班级并重新打开课程。',
        attempt_limit: '本项练习的作答次数已用完。',
        admin_required: '只有管理员可以上传和发布课件。',
        speech_unavailable: '暂时无法检查录音，答案尚未保存。请重试。',
        lesson_number_used: '该课次已存在，请打开草稿或选择其他课次。',
        published_immutable: '已发布课程不能改写。请新建课程，以保留原来的成绩。',
        invalid_input: '请检查内容、选项和文件大小。',
        session_expired: '请重新登录。',
        not_found: '无法查看此课程，请返回班级刷新。',
      }[e.code] || '暂时无法完成操作，请检查网络后重试。';
