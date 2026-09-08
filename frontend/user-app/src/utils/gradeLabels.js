// Presentation only: keep curriculum IDs, API levels and saved progress unchanged.
export const gradeBandLabel = (level, lang = 'en') => {
  const bands = { 1: '1–2', 2: '3–4', 3: '5–6' };
  const band = bands[level];
  return band ? (lang === 'zh' ? `${band} 年级` : `Grades ${band}`) : '';
};
