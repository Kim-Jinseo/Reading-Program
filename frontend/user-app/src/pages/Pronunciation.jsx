import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Star } from 'lucide-react';

export default function Pronunciation({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetText, setTargetText] = useState("Loading...");
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState(null);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then(res => res.json())
      .then(json => { if (json.success) setTargetText(json.data.pronunciationTarget); });
  }, [id]);

  // Unmount safety cleanup: stop recording & release audio tracks completely
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        try {
          mediaRecorder.current.stop();
          mediaRecorder.current.stream?.getTracks().forEach(track => track.stop());
        } catch(e){}
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      alert("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
    mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
  };

  const handleEvaluate = async () => {
    if (!audioBlob) return;
    setIsScoring(true);

    const formData = new FormData();
    formData.append('voiceRecord', audioBlob, 'recording.webm');
    formData.append('targetSentence', targetText);

    try {
      const res = await fetch(`/api/audio/evaluate`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to reach AI server.");
    }
    setIsScoring(false);
  };

  const handleFinish = async () => {
    // Save progress to DB
    await fetch(`/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: user.id, storyId: id, starsEarned: result.score })
    });
    navigate('/map');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pt-20 text-center flex flex-col items-center">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Read Aloud</h2>
      <p className="text-slate-500 mb-10">Press the microphone and say the sentence clearly.</p>

      <div className="bg-white w-full p-10 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <p className="text-3xl font-bold text-sky-600 leading-relaxed">"{targetText}"</p>
      </div>

      <div className="flex gap-4 items-center justify-center">
        {!isRecording ? (
          <button onClick={startRecording} className="w-24 h-24 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all outline-none">
            <Mic size={40} />
          </button>
        ) : (
          <button onClick={stopRecording} className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse outline-none">
            <Square size={32} fill="currentColor" />
          </button>
        )}
      </div>

      {audioBlob && !result && !isScoring && (
        <button onClick={handleEvaluate} className="mt-8 bg-sky-500 text-white font-extrabold text-xl py-4 px-10 rounded-2xl shadow-md active:scale-95 transition-all">
          Check Pronunciation
        </button>
      )}

      {isScoring && <p className="mt-8 font-bold text-sky-500 animate-pulse">AI is listening...</p>}

      {result && (
        <div className="mt-10 bg-white p-8 rounded-3xl border-2 border-amber-200 shadow-lg w-full animate-in slide-in-from-bottom-4">
          <div className="flex justify-center gap-2 mb-4 text-amber-400">
            {[...Array(result.score)].map((_, i) => <Star key={i} size={48} fill="currentColor" className="animate-in zoom-in" style={{animationDelay: `${i*150}ms`}}/>)}
          </div>
          <p className="text-xl font-bold text-slate-800 mb-6">{result.feedback}</p>
          <button onClick={handleFinish} className="w-full bg-amber-400 hover:bg-amber-500 text-white font-extrabold text-xl py-4 rounded-2xl shadow-md transition-all">
            Collect Stars & Finish!
          </button>
        </div>
      )}
    </div>
  );
}