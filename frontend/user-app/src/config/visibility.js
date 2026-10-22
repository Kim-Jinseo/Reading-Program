// Retain hidden modules and stored data for future reuse.
export const EXTRA_PRACTICE_ENABLED = false;
export const SHOP_ENABLED = false;
const practiceViews = new Set(['practice', 'extra_practice', 'vocab', 'grammar', 'writing', 'speaking', 'reading']);
export const visibleAppView = view => (!EXTRA_PRACTICE_ENABLED && practiceViews.has(view)) || (!SHOP_ENABLED && view === 'shop') ? 'dashboard' : view;
