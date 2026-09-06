import { classRequest } from '../../utils/classReads';
export const say = (lang, en, zh) => lang === 'zh' ? zh : en;
export const card = 'rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm min-w-0';
export const field = 'w-full min-h-12 rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-base text-slate-800 focus:border-indigo-500 focus:outline-none';
export const button = 'min-h-12 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed';
export const secondary = 'min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed';
export const subjectName = (lang, subject) => ({ reading: say(lang, 'Reading', '阅读'), vocab: say(lang, 'Vocabulary', '词汇'), grammar: say(lang, 'Grammar', '语法'), other: say(lang, 'Class lesson', '课堂学习') }[subject] || subject);
export const dateText = (lang, date) => date ? new Date(date).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
export function errorText(lang, error) {
  if (error.code === 'invalid_practice_source') return say(lang, 'Choose existing website content for extra practice.', '请为拓展练习选择网站已有内容。');
  if (error.code === 'practice_source_changed') return say(lang, 'This content has changed. Select and preview it again before assigning.', '内容已更新，请重新选择并预览后再布置。');
  if (lang !== 'zh') return error.message || 'Unable to load. Please try again.';
  return ({ invalid_teacher_code: '教师验证码无效、已过期或已被使用。', teacher_required: '请先验证教师身份。', student_required: '请使用学生账号。', admin_required: '只有管理员可以生成教师验证码。', session_expired: '请重新登录。', rate_limited: '操作过于频繁，请稍后再试。', not_found: '找不到班级或作业，或你没有访问权限。', attempt_limit: '你已用完这份作业的作答次数。', invalid_input: '请检查填写内容。每题需要不同的选项和一个正确答案。', class_changed: '班级已满或邀请码已更新。' })[error.code] || '暂时无法完成操作。请检查网络后重试。';
}
export async function classroomApi(path, body, { fresh = false } = {}) {
  const token = localStorage.getItem('token');
  return classRequest({ token, key: '/classroom' + path, write: body !== undefined, fresh }, async () => {
  const response = await fetch('/api/classroom' + path, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${token || ''}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) throw Object.assign(new Error(result.error || 'Unable to complete this request. Please try again.'), { code: response.status === 401 ? 'session_expired' : result.code, status: response.status });
  return result;
  });
}
