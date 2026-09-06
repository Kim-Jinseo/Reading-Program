import React, { useEffect, useRef, useState } from 'react';
import { mediaUrl, secondary, say } from './shared';
export function SlideViewer(props) {
  // Never reuse private media or viewing progress across lesson/account contexts.
  const key = JSON.stringify([props.basePath, props.query || '', props.slides.map(s => s.id), localStorage.getItem('token')]);
  return <SlideSession key={key} {...props} />;
}
function SlideSession({ slides, basePath, query = '', lang, onViewedAll }) {
  const [index, setIndex] = useState(0),
    [display, setDisplay] = useState(null),
    [error, setError] = useState(false),
    [zoom, setZoom] = useState(false),
    [loaded, setLoaded] = useState([]),
    [retry, setRetry] = useState(0);
  const cache = useRef(null);
  useEffect(() => {
    const session = { entries: new Map(), active: true };
    cache.current = session;
    return () => {
      session.active = false;
      for (const entry of session.entries.values()) {
        entry.controller.abort();
        if (entry.url) URL.revokeObjectURL(entry.url);
      }
      session.entries.clear();
    };
  }, []);
  useEffect(() => {
    let active = true;
    const session = cache.current;
    const load = (position) => {
      const path = `${basePath}/slides/${encodeURIComponent(slides[position].id)}${query}`;
      if (session.entries.has(path)) return session.entries.get(path).promise;
      const entry = { controller: new AbortController(), url: '' };
      entry.promise = mediaUrl(path, entry.controller.signal).then(result => {
        if (!session.active) {
          URL.revokeObjectURL(result);
          return '';
        }
        entry.url = result;
        return result;
      }).catch(e => {
        session.entries.delete(path);
        throw e;
      });
      session.entries.set(path, entry);
      return entry.promise;
    };
    setError(false);
    if (!slides[index]) return undefined;
    load(index)
      .then((result) => {
        if (!active || !session.active) return;
        setDisplay({ index, url: result });
        // Only one slide ahead; do not compete with the first visible download.
        if (index + 1 < slides.length) load(index + 1).catch(() => {});
      })
      .catch((e) => {
        if (active && e.name !== 'AbortError') setError(true);
      });
    return () => {
      active = false;
    };
  }, [index, slides, basePath, query, retry]);
  const url = display?.index === index ? display.url : '';
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-slate-200 bg-slate-50 overflow-auto max-h-[65vh] min-h-40"
        tabIndex={0}
        aria-label={say(lang, 'Slide preview; scroll when zoomed', '课件预览，放大后可滚动')}
      >
        {url ? (
          <img
            key={url}
            src={url}
            alt={slides[index].alt}
            className="block mx-auto"
            style={{ width: zoom ? '1200px' : '100%', maxWidth: zoom ? 'none' : '100%' }}
            onLoad={() => {
              const seen = [...new Set([...loaded, index])];
              setLoaded(seen);
              if (seen.length === slides.length) onViewedAll?.();
            }}
          />
        ) : (
          <p className="p-8 text-center" role="status">
            {error
              ? say(lang, 'Unable to load the slide.', '无法加载课件。')
              : say(lang, 'Loading slide…', '正在加载课件…')}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <button className={secondary} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          {say(lang, 'Previous', '上一页')}
        </button>
        <span className="font-bold" aria-live="polite">
          {index + 1} / {slides.length}
        </span>
        <button className={secondary} disabled={index === slides.length - 1} onClick={() => setIndex((i) => i + 1)}>
          {say(lang, 'Next slide', '下一页')}
        </button>
      </div>
      <button className={secondary} onClick={() => setZoom((z) => !z)}>
        {zoom ? say(lang, 'Fit to screen', '适应屏幕') : say(lang, 'Zoom in to read', '放大阅读')}
      </button>
      {error && (
        <button className={secondary + ' ml-2'} onClick={() => setRetry((r) => r + 1)}>
          {say(lang, 'Retry', '重试')}
        </button>
      )}
    </div>
  );
}
