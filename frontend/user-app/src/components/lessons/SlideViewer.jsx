import React, { useEffect, useState } from 'react';
import { mediaUrl, secondary, say } from './shared';
export function SlideViewer({ slides, basePath, query = '', lang, onViewedAll }) {
  const [index, setIndex] = useState(0),
    [url, setUrl] = useState(''),
    [error, setError] = useState(false),
    [zoom, setZoom] = useState(false),
    [loaded, setLoaded] = useState([]),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true,
      objectUrl;
    const controller = new AbortController();
    setUrl('');
    setError(false);
    mediaUrl(`${basePath}/slides/${encodeURIComponent(slides[index].id)}${query}`, controller.signal)
      .then((result) => {
        objectUrl = result;
        if (active) setUrl(result);
        else URL.revokeObjectURL(result);
      })
      .catch((e) => {
        if (active && e.name !== 'AbortError') setError(true);
      });
    return () => {
      active = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [index, slides, basePath, query, retry]);
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border border-slate-200 bg-slate-50 overflow-auto max-h-[65vh] min-h-40"
        tabIndex={0}
        aria-label={say(lang, 'Slide preview; scroll when zoomed', '课件预览，放大后可滚动')}
      >
        {url ? (
          <img
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
