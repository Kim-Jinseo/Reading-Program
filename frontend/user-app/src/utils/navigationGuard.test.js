import { guardedViewChange, registerNavigationGuard } from './navigationGuard';

test('an active navigation guard can cancel a view change and cleans up without breaking functional updates', () => {
  const guard = jest.fn(() => false);
  const release = registerNavigationGuard(guard);
  expect(guardedViewChange('classes', 'dashboard')).toBe('classes');
  expect(guard).toHaveBeenCalledTimes(1);
  release();
  expect(guardedViewChange('classes', current => current === 'classes' ? 'practice' : current)).toBe('practice');
});
