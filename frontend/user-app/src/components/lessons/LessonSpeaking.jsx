import React, { useEffect, useRef, useState } from 'react';
import { authHeaders, blobBase64, button, secondary, say } from './shared';
export function LessonSpeaking({ sentence, lang, disabled, onRecording, onStatus }) {
  const [state, setState] = useState('idle'),
    [url, setUrl] = useState(''),
    [error, setError] = useState('');
  const stream = useRef(),
    recorder = useRef(),
    timer = useRef(),
    alive = useRef(true),
    urlRef = useRef(),
    audio = useRef(),
    listenUrl = useRef();
  const cleanup = () => {
    clearTimeout(timer.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cleanup();
      audio.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      if (listenUrl.current) URL.revokeObjectURL(listenUrl.current);
    };
  }, []);
  const status = (value) => {
    if (alive.current) {
      setState(value);
      onStatus?.(value === 'preparing' || value === 'recording' || value === 'listening');
    }
  };
  const record = async () => {
    if (state === 'recording') {
      cleanup();
      return;
    }
    setError('');
    status('preparing');
    onRecording(null);
    audio.current?.pause();
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw Error();
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!alive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const mime = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(media, mime ? { mimeType: mime } : undefined);
      recorder.current = r;
      const chunks = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onerror = () => {
        cleanup();
        if (alive.current) {
          setError(say(lang, 'Recording failed. Please try again.', '录音失败，请重试。'));
          status('idle');
        }
      };
      r.onstop = async () => {
        media.getTracks().forEach((t) => t.stop());
        clearTimeout(timer.current);
        if (!alive.current) return;
        const blob = new Blob(chunks, { type: r.mimeType || mime });
        if (!blob.size || blob.size > 1500000) {
          setError(say(lang, 'Please record a short answer again.', '请重新录制一段简短的回答。'));
          status('idle');
          return;
        }
        try {
          const audioBase64 = await blobBase64(blob);
          if (!alive.current) return;
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          urlRef.current = URL.createObjectURL(blob);
          setUrl(urlRef.current);
          onRecording({ audioBase64, audioMime: blob.type.split(';')[0] });
          status('recorded');
        } catch {
          status('idle');
        }
      };
      r.start();
      status('recording');
      timer.current = setTimeout(cleanup, 30000);
    } catch {
      cleanup();
      if (alive.current) {
        setError(
          say(
            lang,
            'Allow microphone access, then try again. Nothing has been submitted.',
            '请允许使用麦克风后重试。目前尚未提交录音。',
          ),
        );
        status('idle');
      }
    }
  };
  const listen = async () => {
    setError('');
    status('listening');
    try {
      const response = await fetch(`/api/audio/tts?text=${encodeURIComponent(sentence)}`, { headers: authHeaders() });
      if (!response.ok) throw Error();
      const blob = await response.blob();
      if (!alive.current) return;
      if (listenUrl.current) URL.revokeObjectURL(listenUrl.current);
      listenUrl.current = URL.createObjectURL(blob);
      audio.current = new Audio(listenUrl.current);
      audio.current.onended = () => status(urlRef.current ? 'recorded' : 'idle');
      await audio.current.play();
    } catch {
      if (alive.current) {
        setError(
          say(
            lang,
            'Audio is unavailable. You can still read the sentence.',
            '暂时无法播放示范音频，你仍可以朗读句子。',
          ),
        );
        status(urlRef.current ? 'recorded' : 'idle');
      }
    }
  };
  return (
    <div className="space-y-5">
      <p className="text-xl sm:text-2xl font-bold leading-relaxed">{sentence}</p>
      <button
        className={secondary}
        disabled={disabled || ['recording', 'preparing', 'listening'].includes(state)}
        onClick={listen}
      >
        {say(lang, 'Hear the sentence', '听示范朗读')}
      </button>
      <p role="status" className={state === 'recording' ? 'font-bold text-emerald-700' : 'text-slate-500'}>
        {state === 'preparing'
          ? say(lang, 'Getting the microphone ready…', '正在准备麦克风…')
          : state === 'recording'
            ? say(lang, 'Microphone ready — speak now!', '麦克风已准备好，请开始说话！')
            : say(
                lang,
                'Read aloud. You can listen to your recording before submitting.',
                '请大声朗读。提交前可以回听自己的录音。',
              )}
      </p>
      <button className={button} disabled={disabled || state === 'preparing' || state === 'listening'} onClick={record}>
        {state === 'recording'
          ? say(lang, 'Stop recording', '停止录音')
          : say(lang, 'Record (up to 30 seconds)', '录音（最多 30 秒）')}
      </button>
      {url && <audio controls src={url} className="w-full max-w-md" />}
      {error && (
        <p role="alert" className="text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
