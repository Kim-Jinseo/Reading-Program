// Retain practice modules and stored work for future reuse.
export const EXTRA_PRACTICE_ENABLED = false;
const practiceViews = new Set(['practice', 'extra_practice', 'vocab', 'grammar', 'writing', 'speaking', 'reading']);
export const visibleAppView = view => !EXTRA_PRACTICE_ENABLED && practiceViews.has(view) ? 'dashboard' : view;
