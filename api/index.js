import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import { Buffer } from 'node:buffer';

const app = new Hono().basePath('/api');

// CORS setup
app.use('/*', cors({
  origin: '*', // Adjust this to your Cloudflare Pages URL for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// DB Connection Cache
let client = null;
let cachedCols = null;

async function getDb() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI environment variable is not set!");
    
    client = new MongoClient(uri);
    await client.connect(); 
    const db = client.db('stepping_stones_v2');
    cachedCols = {
      users: db.collection("users"),
      curriculum: db.collection("curriculum"),
      progress: db.collection("progress")
    };
    console.log("✅ Successfully connected to MongoDB Atlas on Vercel!");
  }
  return cachedCols;
}

// Auth Middlewares
const requireAuth = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, process.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
};

const optionalAuth = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await verify(token, process.env.JWT_SECRET);
      c.set('user', decoded);
    } catch (err) {
      c.set('user', { isGuest: true });
    }
  } else {
    c.set('user', { isGuest: true });
  }
  await next();
};

const requireAdmin = async (c, next) => {
  const user = c.get('user');
  if (user && user.role === 'admin') {
    await next();
  } else {
    return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
  }
};

// AI Helper
// Models ordered from highest RPM/RPD to lowest based on user limits
const TEXT_MODELS = [
  'gemini-3.5-flash-lite', 
  'gemini-3.1-flash-lite', 
  'gemini-2.5-flash-lite', 
  'gemini-3.5-flash', 
  'gemini-3.6-flash', 
  'gemini-3-flash', 
  'gemini-2.5-flash', 
  'gemini-2.0-flash', 
  'gemini-3.1-pro'
];

const MULTIMODAL_MODELS = [
  'gemini-3.5-flash-lite', 
  'gemini-3.1-flash-lite', 
  'gemini-2.5-flash-lite', 
  'gemini-3.5-flash', 
  'gemini-3.6-flash', 
  'gemini-3-flash', 
  'gemini-2.5-flash', 
  'gemini-2.0-flash'
];

async function generateContentWithRetry(ai, requestConfig, isMultimodal = false, maxRetriesPerModel = 2) {
  const modelsList = isMultimodal ? MULTIMODAL_MODELS : TEXT_MODELS;
  for (const modelName of modelsList) {
    for (let i = 0; i < maxRetriesPerModel; i++) {
      try {
        const config = { ...requestConfig, model: modelName };
        const response = await ai.models.generateContent(config);
        return { response, modelUsed: modelName };
      } catch (error) {
        if (error?.status === 429 || error?.status === 404 || error?.status === 503) {
           if (error?.status === 404) break;
           if (i < maxRetriesPerModel - 1) {
             const waitTime = Math.pow(2, i) * 1500 + Math.random() * 1000;
             await new Promise(resolve => setTimeout(resolve, waitTime));
           }
        } else {
          throw error;
        }
      }
    }
  }
  throw new Error("All fallback models exhausted or failed.");
}


// Health Check
app.get('/', (c) => c.json({ status: 'ok', message: 'API is live on Vercel!' }));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 1. AUTH API
app.get('/debug', (c) => c.json({ url: c.req.url, path: c.req.path }));
app.post('/test', (c) => c.json({ status: 'ok', msg: 'POST test works' }));
app.post('/auth/login', async (c) => {
  try {
    const { users } = await getDb();
    const { username, pin, isSignup } = await c.req.json();

    if (!username || !pin || pin.length < 6) {
      return c.json({ success: false, error: "Password must be at least 6 characters long." }, 400);
    }

    let user = await users.findOne({ username });
    
    if (isSignup) {
      if (user) return c.json({ success: false, error: "Username already exists." }, 400);

      const hashedPin = await bcrypt.hash(pin, 10);
      const baseUserData = {
        username, pin: hashedPin, stars: 0,
        masteredVocab: [], completedGrammar: [], completedWriting: [], completedSpeaking: [], completedReading: [],
        stats: { vocab: 0, grammar: 0, writing: 0, speaking: 0, reading: 0 },
        starsTracker: {}, essays: {}
      };

      const teacherInventory = ['relic_hourglass', 'court_gavel', 'shield_bronze', 'shield_silver', 'shield_gold', 'char_knight', 'char_paladin', 'pet_dragon', 'pet_griffin', 'pet_golem'];
      const teacherChars = ['char_knight', 'char_paladin', 'char_wizard'];
      const teacherPets = ['pet_dragon', 'pet_griffin', 'pet_golem'];
      const isTeacherAccount = (username.toLowerCase() === 'admin' && pin === 'admin123') || username.toLowerCase() === 'teacher2026';

      if (isTeacherAccount) {
        const result = await users.insertOne({ ...baseUserData, role: 'admin', inventory: teacherInventory, unlockedChars: teacherChars, unlockedPets: teacherPets });
        user = await users.findOne({ _id: result.insertedId });
      } else {
        const result = await users.insertOne({ ...baseUserData, role: 'student' });
        user = await users.findOne({ _id: result.insertedId });
      }
    } else {
      if (!user) return c.json({ success: false, error: "Invalid credentials." }, 401);
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (!isMatch) return c.json({ success: false, error: "Invalid credentials." }, 401);
    }

    const token = await sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET);
    delete user.pin;
    return c.json({ success: true, user, token });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Server Error: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/auth/sync', requireAuth, async (c) => {
  try {
    const { users } = await getDb();
    const { updates } = await c.req.json();
    const userId = c.get('user').userId;
    
    if (updates.role || updates.pin) return c.json({ success: false, error: "Cannot sync protected fields" }, 403);
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updates });
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to sync user data: " + (error.message || "Unknown error") }, 500);
  }
});

app.get('/leaderboard', async (c) => {
  try {
    const { users } = await getDb();
    const usersData = await users.find(
      { role: { $ne: 'admin' } },
      { projection: { username: 1, stars: 1, trophies: 1, grade: 1, equippedChar: 1, equippedPet: 1 } }
    ).toArray();

    const leaderboard = usersData.map(u => ({
      id: u._id.toString(),
      name: u.username || 'Student',
      trophies: u.trophies !== undefined ? u.trophies : (u.stars || 0),
      stars: u.stars || 0,
      grade: u.grade || '3-4',
      equippedChar: u.equippedChar || null,
      equippedPet: u.equippedPet || null
    })).sort((a, b) => b.trophies - a.trophies);

    return c.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to fetch leaderboard: " + (error.message || "Unknown error") }, 500);
  }
});

app.get('/curriculum', async (c) => {
  try {
    const { curriculum } = await getDb();
    const allData = await curriculum.find({}).toArray();
    const formattedData = {};
    allData.forEach(doc => { formattedData[doc.grade] = doc.content; });
    return c.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to load curriculum: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/curriculum/update', requireAuth, requireAdmin, async (c) => {
  try {
    const { curriculum } = await getDb();
    const { grade, content } = await c.req.json();
    await curriculum.updateOne({ grade }, { $set: { content } }, { upsert: true });
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to update curriculum: " + (error.message || "Unknown error") }, 500);
  }
});

// AI endpoints
app.post('/practice/generate', requireAuth, async (c) => {
  const { grade } = await c.req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const { response } = await generateContentWithRetry(ai, {
      contents: `Generate 3 completely new English vocabulary words suitable for ${grade} grade. Return ONLY a valid JSON array of objects.`,
      config: { responseMimeType: "application/json" }
    });
    const cleanJsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return c.json({ success: true, data: JSON.parse(cleanJsonStr) });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to generate practice: " + (error.message || "Unknown error") }, 500);
  }
});

// Firewall layer 1
const firewallLayer1 = async (c, next) => {
  let input = "";
  try {
    const clonedReq = c.req.raw.clone();
    const contentType = clonedReq.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await clonedReq.json();
      input = body.studentAnswer || body.prompt || "";
    }
  } catch(e) {}
  
  if (typeof input === 'string') {
    if (input.length > 2000) return c.json({ success: false, error: "Input exceeds maximum allowed length." }, 400);
    const lowerInput = input.toLowerCase();
    const blockedPatterns = ["ignore previous instructions", "system prompt", "you are now", "forget all", "bypass", "dan "];
    for (const pattern of blockedPatterns) {
      if (lowerInput.includes(pattern)) return c.json({ success: false, error: "Input violates safety guidelines." }, 403);
    }
  }
  await next();
};

app.post('/writing/grade', optionalAuth, firewallLayer1, async (c) => {
  const { prompt, studentAnswer, grade } = await c.req.json();
  if (!prompt || !studentAnswer) return c.json({ success: false, error: "Missing data" }, 400);
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemPrompt = `You are an encouraging English teacher evaluating a student's writing.
      Score out of 4 stars based on Grade ${grade || '1-2'}. 
      CRITICAL INSTRUCTION: Write long, highly detailed, and thoroughly encouraging feedback. Ensure that your grammar_feedback, content_feedback, and general_feedback are comprehensive, explaining exactly what the student did well and providing specific ways to improve, using 2-3 detailed sentences for each feedback field.
      Return JSON: {"reasoning":"", "stars": 4, "grammar_feedback":"", "content_feedback":"", "general_feedback":""}`;
    const userPrompt = `Student Answer: ${studentAnswer}`;

    const { response, modelUsed } = await generateContentWithRetry(ai, {
      systemInstruction: systemPrompt,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text();
    if (text && text.toLowerCase().includes("system prompt")) throw new Error("Safety Check Failed");

    // Strip markdown code blocks before parsing
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const evaluation = JSON.parse(cleanText);
    return c.json({ 
      success: true, 
      stars: Math.max(0, Math.min(4, Math.round(evaluation.stars))), 
      grammar: evaluation.grammar_feedback || "Clear and accurate!",
      content: evaluation.content_feedback || "Great job answering the prompt!",
      general: evaluation.general_feedback || "Wonderful writing effort!",
      modelUsed
    });
  } catch (error) {
    console.error('[Gemini Grading Error]:', error);
    return c.json({
      success: true,
      stars: 1,
      grammar: "Please write complete sentences.",
      content: "Nice effort answering the writing prompt!",
      general: `Keep practicing! (Error: ${error.message})`,
      modelUsed: "heuristic-fallback"
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts base64 audio data from either JSON or multipart request bodies.
 * Supports both `application/json` (base64 payload) and `multipart/form-data` (file upload).
 *
 * @param {object} c - Hono context
 * @returns {{ base64Audio: string, mimeType: string, extras: object }}
 */
async function parseAudioRequest(c) {
  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json();
    return {
      base64Audio: body.audioBase64 || null,
      mimeType: body.mimeType || 'audio/webm',
      extras: body,
    };
  }

  // Multipart form-data (legacy browser uploads)
  const formData = await c.req.parseBody();
  const file = formData['voiceRecord'];
  if (!file) return { base64Audio: null, mimeType: null, extras: formData };

  const arrayBuffer = await file.arrayBuffer();
  return {
    base64Audio: Buffer.from(arrayBuffer).toString('base64'),
    mimeType: file.type || 'audio/webm',
    extras: formData,
  };
}

/**
 * Transcribes audio using the Deepgram Nova-3 STT API.
 * Deepgram's REST endpoint accepts raw audio bytes and returns a JSON transcript.
 *
 * @param {Buffer} audioBuffer - Raw audio bytes
 * @param {string} mimeType    - MIME type (e.g. 'audio/webm', 'audio/mp4')
 * @returns {string|null}       - Transcribed text, or null on failure
 */
async function transcribeWithDeepgram(audioBuffer, mimeType) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    console.warn('[STT] DEEPGRAM_API_KEY not set, skipping Deepgram tier.');
    return null;
  }

  try {
    // Strip trailing codec info (e.g., 'audio/webm;codecs=opus' -> 'audio/webm') 
    // because Deepgram can sometimes reject strict codec strings in headers.
    const cleanMimeType = mimeType ? mimeType.split(';')[0] : 'audio/webm';
    
    // Ensure body is a standard Uint8Array which is supported universally by Web Fetch API (Vercel Edge/Node)
    const bodyData = new Uint8Array(audioBuffer);

    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': cleanMimeType,
        },
        body: bodyData,
      }
    );

    if (!response.ok) {
      console.error(`[STT] Deepgram returned ${response.status}: ${await response.text()}`);
      return null;
    }

    const result = await response.json();
    const alternative = result?.results?.channels?.[0]?.alternatives?.[0];
    if (alternative && alternative.transcript && alternative.transcript.trim().length > 0) {
      return {
        transcript: alternative.transcript.trim(),
        confidence: alternative.confidence || 1.0
      };
    }
    return null;
  } catch (error) {
    console.error('[STT] Deepgram request failed:', error.message);
    return null;
  }
}

/**
 * Transcribes audio using Google Gemini's multimodal capabilities.
 * Used as a fallback when Deepgram is unavailable or returns no results.
 *
 * @param {string} base64Audio - Base64-encoded audio data
 * @param {string} mimeType    - MIME type
 * @returns {string|null}       - Transcribed text, or null on failure
 */
async function transcribeWithGemini(base64Audio, mimeType) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { response } = await generateContentWithRetry(ai, {
      contents: [
        { text: 'Transcribe the English words spoken in this audio accurately. If no English speech is detected, return an empty string. Return ONLY the transcribed text, with no extra commentary.' },
        { inlineData: { data: base64Audio, mimeType } },
      ],
    }, true);

    const text = response.text?.trim();
    return text && text.length > 0 ? text : null;
  } catch (error) {
    console.error('[STT] Gemini transcription failed:', error.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/audio/stt
 *
 * Three-tier speech-to-text endpoint:
 *   Tier 1: Deepgram Nova-3 (fast, reliable, works without VPN in China)
 *   Tier 2: Gemini multimodal transcription (fallback)
 *
 * Accepts: { audioBase64, mimeType }
 * Returns: { success, transcript, provider }
 */
app.post('/audio/stt', async (c) => {
  try {
    const { base64Audio, mimeType } = await parseAudioRequest(c);
    if (!base64Audio) {
      return c.json({ success: false, error: 'No audio detected.' }, 400);
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Tier 1: Deepgram
    const deepgramResult = await transcribeWithDeepgram(audioBuffer, mimeType);
    if (deepgramResult) {
      return c.json({ success: true, transcript: deepgramResult.transcript, provider: 'deepgram' });
    }

    // Tier 2: Gemini transcription
    const geminiResult = await transcribeWithGemini(base64Audio, mimeType);
    if (geminiResult) {
      return c.json({ success: true, transcript: geminiResult, provider: 'gemini' });
    }

    return c.json({ success: false, error: 'No speech detected in audio.' }, 200);
  } catch (error) {
    console.error('[STT] Endpoint error:', error);
    return c.json({ success: false, error: 'STT failed: ' + (error.message || 'Unknown error') }, 500);
  }
});

/**
 * POST /api/audio/evaluate
 *
 * Evaluates pronunciation quality using Gemini multimodal.
 * Used as the final fallback when both native STT and Deepgram are unavailable.
 *
 * Accepts: { audioBase64, mimeType, targetSentence }
 * Returns: { success, score (0-4), feedback, targetSentence }
 */
app.post('/audio/evaluate', async (c) => {
  try {
    const { base64Audio, mimeType, extras } = await parseAudioRequest(c);
    const targetSentence = extras.targetSentence || '';

    if (!base64Audio) {
      return c.json({ success: false, error: 'No audio detected.' }, 400);
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Tier 1: Deepgram STT
    const deepgramResult = await transcribeWithDeepgram(audioBuffer, mimeType);
    
    if (deepgramResult !== null) {
      const { transcript: deepgramTranscript, confidence } = deepgramResult;

      // Evaluate Deepgram transcript
      const h = deepgramTranscript.toLowerCase().replace(/[.,!?]/g, "").trim();
      const t = targetSentence.toLowerCase().replace(/[.,!?]/g, "").trim();
      
      let finalScore = 0;
      let finalFeedback = `Heard: "${deepgramTranscript}"`;
      
      // Basic includes matching for scoring
      if (h.includes(t) && t.length > 0) {
        if (confidence >= 0.70) finalScore = 3;
        else if (confidence >= 0.40) finalScore = 2;
        else finalScore = 1; // It matched, but Deepgram wasn't very sure
        
        finalFeedback = `Hit! (${deepgramTranscript})`;
      } else if (h.length > 0) {
        // Simple word overlap for partial credit (business standard simple matching)
        const heardWords = h.split(/\s+/);
        const targetWords = t.split(/\s+/);
        let matchCount = 0;
        
        targetWords.forEach(word => {
          if (heardWords.includes(word)) matchCount++;
        });
        
        const matchRatio = targetWords.length > 0 ? matchCount / targetWords.length : 0;
        
        if (matchRatio >= 0.6) {
           finalScore = confidence >= 0.60 ? 2 : 1;
        } else if (matchRatio > 0) {
           finalScore = 1;
        }
      }
      
      return c.json({ 
        success: true, 
        score: finalScore, 
        feedback: finalFeedback, 
        targetSentence,
        provider: 'deepgram',
        transcript: deepgramTranscript
      });
    }

    // Tier 2: Gemini Audio Evaluation Fallback
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { response } = await generateContentWithRetry(ai, {
      contents: [{
        role: "user",
        parts: [
          { text: `Analyze the audio pronunciation for: "${targetSentence}". Return ONLY JSON {"speech_detected": true, "stars": 3, "feedback": "Good effort"}. Be very lenient and generous, grade out of a maximum of 3 stars.` },
          { inlineData: { data: base64Audio, mimeType } }
        ]
      }],
      config: { responseMimeType: 'application/json' },
    }, true);

    const evaluation = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
    const speechDetected = evaluation.speech_detected === true || evaluation.speech_detected === 'true';
    const finalScore = speechDetected ? Math.max(0, Math.min(3, Math.round(evaluation.stars))) : 0;
    const finalFeedback = speechDetected ? (evaluation.feedback || 'Good effort!') : "I couldn't hear your voice!";

    return c.json({ 
      success: true, 
      score: finalScore, 
      feedback: finalFeedback, 
      targetSentence,
      provider: 'gemini' 
    });
  } catch (error) {
    console.error('[Audio Evaluate]', error);
    return c.json({ success: false, error: 'Audio analysis failed: ' + (error.message || 'Unknown error') }, 500);
  }
});

/**
 * POST /api/audio/roleplay
 *
 * AI-powered voice conversation: transcribes student audio, generates a reply,
 * and optionally returns TTS audio of the reply.
 *
 * Accepts: { audioBase64, mimeType }
 * Returns: { success, text, audioBase64, mimeType }
 */
app.post('/audio/roleplay', requireAuth, async (c) => {
  try {
    const { base64Audio, mimeType } = await parseAudioRequest(c);
    if (!base64Audio) {
      return c.json({ success: false, error: 'No audio detected.' }, 400);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const textResponse = await generateContentWithRetry(ai, {
      contents: [
        { text: 'You are a friendly alien pen-pal. Reply to the student in 1-2 very short English sentences.' },
        { inlineData: { data: base64Audio, mimeType } },
      ],
    }, true);

    const replyText = textResponse.response.text.trim();

    // Generate TTS audio for the reply (non-blocking — failure is acceptable)
    let audioBase64 = null;
    let audioMimeType = null;
    try {
      const ttsRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts',
        contents: `Please read the following aloud in a very cute, friendly, enthusiastic voice:\n\n${replyText}`,
        config: { responseModalities: ['AUDIO'] },
      });
      const audioPart = ttsRes?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (audioPart) {
        audioBase64 = audioPart.inlineData.data;
        audioMimeType = audioPart.inlineData.mimeType;
      }
    } catch (e) {
      console.error('[Roleplay TTS]', e.message);
    }

    return c.json({ success: true, text: replyText, audioBase64, mimeType: audioMimeType });
  } catch (error) {
    console.error('[Roleplay]', error);
    return c.json({ success: false, error: 'Roleplay failed: ' + (error.message || 'Unknown error') }, 500);
  }
});

/**
 * POST /api/audio/tts
 *
 * Text-to-speech endpoint using Gemini Flash TTS.
 *
 * Accepts: { text }
 * Returns: { success, audioBase64, mimeType }
 */
app.get('/audio/tts', async (c) => {
  const text = c.req.query('text');
  const token = c.req.query('token');

  if (!text) return c.json({ success: false, error: 'Missing text' }, 400);
  if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401);

  try {
    const decoded = await verify(token, process.env.JWT_SECRET);
    c.set('user', decoded);
  } catch (err) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  const ttsKey = process.env.TEXT_TO_SPEECH;
  if (!ttsKey) return c.json({ success: false, error: 'TEXT_TO_SPEECH key missing' }, 500);

  try {
    const deepgramRes = await fetch('https://api.deepgram.com/v1/speak?model=aura-stella-en', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${ttsKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!deepgramRes.ok) {
      throw new Error(`Deepgram TTS failed: ${deepgramRes.status}`);
    }

    const audioBuffer = await deepgramRes.arrayBuffer();
    const mimeType = deepgramRes.headers.get('content-type') || 'audio/mp3';

    c.header('Content-Type', mimeType);
    return c.body(audioBuffer);
  } catch (error) {
    console.error('[TTS]', error);
    return c.json({ success: false, error: 'TTS failed: ' + (error.message || 'Unknown error') }, 500);
  }
});

/**
 * POST /api/audio/transcribe
 *
 * Legacy transcription endpoint (multipart only). Kept for backward compatibility.
 * New code should use /api/audio/stt instead.
 */
app.post('/audio/transcribe', async (c) => {
  try {
    const { base64Audio, mimeType } = await parseAudioRequest(c);
    if (!base64Audio) {
      return c.json({ success: false, error: 'No audio detected.' }, 400);
    }

    // Try Deepgram first, then Gemini
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const transcript = await transcribeWithDeepgram(audioBuffer, mimeType)
      || await transcribeWithGemini(base64Audio, mimeType);

    if (transcript) {
      return c.json({ success: true, text: transcript });
    }
    return c.json({ success: false, error: 'No speech detected.' }, 200);
  } catch (error) {
    console.error('[Transcribe]', error);
    return c.json({ success: false, error: 'Transcription failed: ' + (error.message || 'Unknown error') }, 500);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVER EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
