/**
 * Robust Cross-Platform TTS System
 * Bypasses broken native Web Speech API on Chinese ecosystems (HarmonyOS, WeChat, etc.)
 */

// Detect known problematic ecosystems where Google TTS is missing or broken
const isChineseEcosystem = /MicroMessenger|HarmonyOS|OpenHarmony|HuaweiBrowser|HeyTapBrowser|VivoBrowser/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isIOSWebView = isIOS && /CriOS|FxiOS|MicroMessenger|WeChat|Line/i.test(navigator.userAgent);

// Should we bypass native TTS entirely?
export const shouldBypassNativeTTS = isChineseEcosystem || isIOSWebView;

let cloudAudioElement = null;

export const playCloudTTS = async (text, onStart, onEnd, onError) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/audio/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    if (!data.success || !data.audioBase64) {
      throw new Error(data.error || "Cloud TTS failed");
    }

    if (cloudAudioElement) {
      cloudAudioElement.pause();
    }
    
    const audioSrc = `data:${data.mimeType || 'audio/mp3'};base64,${data.audioBase64}`;
    cloudAudioElement = new Audio(audioSrc);
    
    cloudAudioElement.onplay = () => onStart && onStart();
    cloudAudioElement.onended = () => {
      onEnd && onEnd();
      cloudAudioElement = null;
    };
    cloudAudioElement.onerror = (e) => {
      onError && onError(e);
      cloudAudioElement = null;
    };
    
    await cloudAudioElement.play();
  } catch (error) {
    console.error("Cloud TTS Playback Error:", error);
    onError && onError(error);
  }
};

export const stopCloudTTS = () => {
  if (cloudAudioElement) {
    cloudAudioElement.pause();
    cloudAudioElement.currentTime = 0;
    cloudAudioElement = null;
  }
};

export const playRobustTTS = (text, onStart, onEnd, onError) => {
  // If explicitly broken ecosystem, or native not supported, go straight to cloud
  if (shouldBypassNativeTTS || !('speechSynthesis' in window)) {
    return playCloudTTS(text, onStart, onEnd, onError);
  }

  // Check if voices are loaded
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // If no voices, maybe they are loading. Try to wait briefly.
    let timeout;
    const onVoicesChanged = () => {
      clearTimeout(timeout);
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      if (window.speechSynthesis.getVoices().length > 0) {
         playNativeTTS(text, onStart, onEnd, onError);
      } else {
         playCloudTTS(text, onStart, onEnd, onError);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    
    // If voices don't load within 500ms, fallback to cloud immediately
    timeout = setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      playCloudTTS(text, onStart, onEnd, onError);
    }, 500);
    return;
  }

  // Voices are present, use native
  playNativeTTS(text, onStart, onEnd, onError);
};

export const stopRobustTTS = () => {
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e){}
  }
  stopCloudTTS();
};

const playNativeTTS = (text, onStart, onEnd, onError) => {
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch(e) {}
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  
  utterance.onstart = () => onStart && onStart();
  utterance.onend = () => onEnd && onEnd();
  utterance.onerror = (e) => {
    // If native engine errors mid-speech, attempt cloud fallback
    console.warn("Native TTS Error, falling back to Cloud", e);
    playCloudTTS(text, onStart, onEnd, onError);
  };
  
  window.speechSynthesis.speak(utterance);
};
