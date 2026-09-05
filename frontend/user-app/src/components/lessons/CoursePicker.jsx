import React from 'react';
import { collectionName, field, say } from './shared';
export function CoursePicker({ collections, value, onChange, lang, required = true }) {
  return (
    <label className="block font-bold">
      {say(lang, 'Term and learning level', '学期与学习级别')}
      <select
        aria-label={say(lang, 'Term and learning level', '学期与学习级别')}
        className={field + ' mt-2'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">{say(lang, 'Choose term / level', '请选择学期和级别')}</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {collectionName(c, lang)}
          </option>
        ))}
      </select>
      <span className="block text-sm font-normal text-slate-500 mt-2">
        {say(
          lang,
          'All published lessons in this course are available immediately.',
          '本课程所有已发布的课件和练习均可立即学习。',
        )}
      </span>
    </label>
  );
}
