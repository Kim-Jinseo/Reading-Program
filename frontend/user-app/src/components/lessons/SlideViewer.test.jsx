import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SlideViewer } from './SlideViewer';

const slides = [{ id: 'one', alt: 'First slide' }, { id: 'two', alt: 'Second slide' }];
const props = { slides, basePath: '/classes/c/lessons/l', lang: 'en' };
const response = () => ({ ok: true, blob: async () => new Blob(['image']) });
beforeEach(() => {
  global.fetch = jest.fn(async () => response());
  let sequence = 0;
  URL.createObjectURL = jest.fn(() => `blob:slide-${++sequence}`);
  URL.revokeObjectURL = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

test('preloads the next slide and reuses both downloads when navigating back', async () => {
  const viewed = jest.fn();
  render(<SlideViewer {...props} onViewedAll={viewed} />);
  fireEvent.load(await screen.findByAltText('First slide'));
  expect(screen.queryByRole('button', { name: /Zoom in to read|Fit to screen/ })).not.toBeInTheDocument();
  expect(screen.getByAltText('First slide')).toHaveStyle({ width: '100%', maxWidth: '100%' });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(viewed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Next slide'));
  fireEvent.load(await screen.findByAltText('Second slide'));
  expect(viewed).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('Previous'));
  expect(await screen.findByAltText('First slide')).toHaveAttribute('src', 'blob:slide-1');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(URL.revokeObjectURL).not.toHaveBeenCalled();
});

test('reuses an in-flight preload and ignores late responses for the wrong page', async () => {
  let finish;
  fetch.mockImplementationOnce(async () => response()).mockImplementationOnce(() => new Promise(r => { finish = r; }));
  render(<SlideViewer {...props} />);
  await screen.findByAltText('First slide');
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByText('Next slide'));
  fireEvent.click(screen.getByText('Previous'));
  await act(async () => finish(response()));
  expect(screen.getByAltText('First slide')).toHaveAttribute('src', 'blob:slide-1');
  expect(screen.queryByAltText('Second slide')).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('a failed download can be retried', async () => {
  fetch.mockRejectedValueOnce(new Error('Offline'));
  render(<SlideViewer {...props} />);
  fireEvent.click(await screen.findByText('Retry'));
  expect(await screen.findByAltText('First slide')).toBeInTheDocument();
});

test('preloads only one page ahead and recovers a failed preload on navigation', async () => {
  fetch.mockResolvedValueOnce(response()).mockRejectedValueOnce(new Error('Offline'));
  render(<SlideViewer {...props} slides={[...slides, { id: 'three', alt: 'Third slide' }]} />);
  await screen.findByAltText('First slide');
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(screen.queryByText('Unable to load the slide.')).not.toBeInTheDocument();
  expect(fetch.mock.calls.some(([url]) => url.endsWith('/three'))).toBe(false);
  fireEvent.click(screen.getByText('Next slide'));
  expect(await screen.findByAltText('Second slide')).toBeInTheDocument();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
});

test('StrictMode cleanup does not leave the active viewer with revoked images', async () => {
  render(<React.StrictMode><SlideViewer {...props} /></React.StrictMode>);
  const first = await screen.findByAltText('First slide');
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(first.getAttribute('src'));
  fireEvent.click(screen.getByText('Next slide'));
  const second = await screen.findByAltText('Second slide');
  expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(second.getAttribute('src'));
});

test('leaving releases cached images and aborts pending preloads, including late responses', async () => {
  let finish;
  fetch.mockImplementationOnce(async () => response()).mockImplementationOnce(() => new Promise(r => { finish = r; }));
  const { unmount } = render(<SlideViewer {...props} />);
  await screen.findByAltText('First slide');
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  const signal = fetch.mock.calls[1][1].signal;
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => finish(response()));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:slide-1');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:slide-2');
});

test('changing class or student context discards the old cache and viewing progress', async () => {
  const viewed = jest.fn();
  const { rerender } = render(<SlideViewer {...props} onViewedAll={viewed} />);
  fireEvent.load(await screen.findByAltText('First slide'));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  rerender(<SlideViewer {...props} query="?studentId=other" onViewedAll={viewed} />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:slide-1');
  fireEvent.click(screen.getByText('Next slide'));
  fireEvent.load(await screen.findByAltText('Second slide'));
  expect(viewed).not.toHaveBeenCalled();
});
