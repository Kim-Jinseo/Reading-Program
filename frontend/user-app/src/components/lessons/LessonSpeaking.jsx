import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, Loader2 } from 'lucide-react';
import { authHeaders, blobBase64, secondary, say } from './shared';

export function LessonSpeaking({ sentence, hintZh, lang, disabled, onRecording, onStatus }) {
  const [state, setState] = useState('idle'), [url, setUrl] = useState(''), [error, setError] = useState('');
  const resource = useRef(null);
  useEffect(() => {
    const entry = { active: true, state: 'idle' };
    resource.current = entry;
    return () => {
      entry.active = false;
      clearTimeout(entry.timer);
      clearTimeout(entry.audioTimer);
      entry.controller?.abort();
      if (entry.recorder?.state === 'recording') entry.recorder.stop();
      entry.stream?.getTracks().forEach(t => t.stop());
      entry.audio?.pause();
      if (entry.recordingUrl) URL.revokeObjectURL(entry.recordingUrl);
      if (entry.listenUrl) URL.revokeObjectURL(entry.listenUrl);
    };
  }, []);
  const status = (entry, value) => {
    if (!entry.active) return;
    entry.state = value;
    setState(value);
    onStatus?.(['preparing', 'recording', 'processing', 'listening'].includes(value));
  };
  const stop = entry => {
    clearTimeout(entry.timer);
    if (entry.recorder?.state === 'recording') entry.recorder.stop();
    entry.stream?.getTracks().forEach(t => t.stop());
  };
  const record = async () => {
    const entry = resource.current;
    if (!entry?.active || disabled) return;
    if (entry.state === 'recording') {
      status(entry, 'processing');
      stop(entry);
      return;
    }
    if (!['idle', 'recorded'].includes(entry.state)) return;
    setError('');
    status(entry, 'preparing');
    onRecording(null);
    setUrl('');
    if (entry.recordingUrl) URL.revokeObjectURL(entry.recordingUrl);
    entry.recordingUrl = '';
    let failed = false;
    const fail = () => {
      failed = true;
      stop(entry);
      if (entry.active) {
        setError(say(lang, 'Recording failed. Allow microphone access, then try again. Nothing has been submitted.', '录音失败。请允许使用麦克风后重试，录音尚未提交。'));
        status(entry, 'idle');
      }
    };
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw Error();
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!entry.active) { media.getTracks().forEach(t => t.stop()); return; }
      entry.stream = media;
      const mime = ['audio/webm', 'audio/mp4', 'audio/ogg'].find(m => MediaRecorder.isTypeSupported(m));
      const recorder = new MediaRecorder(media, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 });
      entry.recorder = recorder;
      const chunks = [];
      recorder.ondataavailable = event => { if (event.data.size && !failed) chunks.push(event.data); };
      recorder.onerror = fail;
      recorder.onstart = () => {
        if (!entry.active || failed) return;
        clearTimeout(entry.timer);
        status(entry, 'recording');
        entry.timer = setTimeout(() => { status(entry, 'processing'); stop(entry); }, 30000);
      };
      recorder.onstop = async () => {
        clearTimeout(entry.timer);
        media.getTracks().forEach(t => t.stop());
        if (!entry.active || failed) return;
        status(entry, 'processing');
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || mime });
          if (!blob.size || blob.size > 1500000) throw Error();
          const audioBase64 = await blobBase64(blob);
          if (!entry.active) return;
          entry.recordingUrl = URL.createObjectURL(blob);
          setUrl(entry.recordingUrl);
          onRecording({ audioBase64, audioMime: blob.type.split(';')[0] });
          status(entry, 'recorded');
        } catch { fail(); }
      };
      entry.timer = setTimeout(fail, 10000);
      recorder.start();
    } catch { fail(); }
  };
  const listen = async () => {
    const entry = resource.current;
    if (!entry?.active || disabled || !['idle', 'recorded'].includes(entry.state)) return;
    setError('');
    status(entry, 'listening');
    const controller = new AbortController();
    entry.controller = controller;
    const current = () => entry.active && entry.controller === controller;
    const finish = () => {
      if (!current()) return;
      clearTimeout(entry.audioTimer);
      status(entry, entry.recordingUrl ? 'recorded' : 'idle');
    };
    const fail = () => {
      if (!current() || entry.state !== 'listening') return;
      finish();
      entry.controller?.abort();
      if (entry.audio) {
        entry.audio.onpause = null;
        entry.audio.pause();
        entry.audio = null;
      }
      if (entry.listenUrl) URL.revokeObjectURL(entry.listenUrl);
      entry.listenUrl = '';
      setError(say(lang, 'Audio could not play. Tap the speaker to try again. You can still record your answer.', '示范音频播放失败。请点击喇叭重试，你仍可以录制作答。'));
    };
    try {
      entry.audioTimer = setTimeout(fail, 20000);
      if (!entry.audio) {
        const response = await fetch(`/api/audio/tts?text=${encodeURIComponent(sentence)}`, { headers: authHeaders(), signal: controller.signal });
        if (!response.ok) throw Error();
        const blob = await response.blob();
        if (!current() || controller.signal.aborted) return;
        entry.listenUrl = URL.createObjectURL(blob);
        entry.audio = new Audio(entry.listenUrl);
      }
      entry.audio.onended = finish;
      entry.audio.onpause = finish;
      entry.audio.onerror = fail;
      entry.audio.onstalled = fail;
      entry.audio.onabort = fail;
      entry.audio.currentTime = 0;
      await entry.audio.play();
      if (current() && entry.state === 'listening') {
        clearTimeout(entry.audioTimer);
        entry.audioTimer = setTimeout(fail, 60000);
      }
    } catch { fail(); }
  };
  const busy = ['preparing', 'processing', 'listening'].includes(state);
  return <div className="max-w-3xl mx-auto space-y-7 sm:space-y-9 py-2 sm:py-4">
    <div className="rounded-3xl border-2 border-rose-100 bg-white px-5 py-7 sm:p-10 text-center shadow-sm space-y-5">
      <button type="button" className={secondary + ' inline-flex items-center justify-center gap-2 text-rose-600 border-rose-200'}
        disabled={disabled || busy || state === 'recording'} onClick={listen}>
        <Volume2 size={26} aria-hidden="true" />{say(lang, 'Hear the sentence', '听示范朗读')}
      </button>
      <p lang="en" className="text-2xl sm:text-3xl font-extrabold leading-snug break-words">{sentence}</p>
      {hintZh && <p lang="zh-CN" className="text-base sm:text-lg text-slate-500 leading-relaxed">{hintZh}</p>}
    </div>
    <div className="flex flex-col items-center gap-5 text-center">
      <p role="status" className={`font-semibold leading-relaxed ${state === 'recording' ? 'text-emerald-700' : 'text-slate-500'}`}>
        {state === 'preparing' ? say(lang, 'Getting the microphone ready…', '正在准备麦克风…')
          : state === 'recording' ? say(lang, 'Microphone ready — speak now! Recording (up to 30 seconds).', '麦克风已准备好，请开始说话！正在录音（最多 30 秒）。')
          : state === 'processing' ? say(lang, 'Preparing your recording…', '正在处理录音…')
          : state === 'listening' ? say(lang, 'Playing the example…', '正在播放示范…')
          : state === 'recorded' ? say(lang, 'Recording ready. Listen below, then submit when you are happy with it.', '录音已准备好。先回听，满意后再提交。')
          : say(lang, 'Tap the microphone, then wait for “Speak now”.', '点击麦克风，等提示“请开始说话”后再读。')}
      </p>
      <button type="button" aria-label={state === 'recording' ? say(lang, 'Stop recording', '停止录音') : say(lang, 'Record (up to 30 seconds)', '录音（最多 30 秒）')}
        className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center gap-2 font-bold text-white border-b-8 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-600 disabled:opacity-50 disabled:cursor-not-allowed ${state === 'recording' ? 'bg-rose-600 border-rose-800' : 'bg-rose-500 border-rose-700'}`}
        disabled={disabled || busy} onClick={record}>
        {busy ? <Loader2 size={32} aria-hidden="true" /> : state === 'recording' ? <Square size={32} aria-hidden="true" /> : <Mic size={36} aria-hidden="true" />}
        <span className="text-sm">{state === 'recording' ? say(lang, 'Stop', '停止') : say(lang, 'Record', '录音')}</span>
      </button>
      {url && <audio aria-label={say(lang, 'Your recording', '你的录音')} controls src={url} className="w-full max-w-md" />}
      {error && <p role="alert" className="text-rose-700 rounded-xl bg-rose-50 p-4 leading-relaxed">{error}</p>}
    </div>
  </div>;
}
