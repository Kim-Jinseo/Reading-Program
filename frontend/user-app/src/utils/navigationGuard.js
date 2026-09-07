let activeGuard = null;

export function registerNavigationGuard(guard) {
  activeGuard = guard;
  return () => { if (activeGuard === guard) activeGuard = null; };
}

export function guardedViewChange(current, next) {
  const value = typeof next === 'function' ? next(current) : next;
  if (Object.is(value, current) || !activeGuard) return value;
  return activeGuard() ? value : current;
}
