import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import { Buffer } from 'node:buffer';

const rootApp = new Hono();
rootApp.get('/', (c) => c.json({ status: 'ok', message: 'API is live on Vercel!' }));

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

// ── Security: In-memory rate limiter for auth endpoints ──────────────────────
const authRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max 10 auth attempts per window

const authRateLimit = async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
             c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  
  if (authRateLimitMap.has(ip)) {
    const entry = authRateLimitMap.get(ip);
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      // Reset window
      authRateLimitMap.set(ip, { windowStart: now, count: 1 });
    } else if (entry.count >= RATE_LIMIT_MAX) {
      return c.json({ success: false, error: 'Too many login attempts. Please try again later.' }, 429);
    } else {
      entry.count++;
    }
  } else {
    authRateLimitMap.set(ip, { windowStart: now, count: 1 });
  }
  
  // Cleanup old entries every 100 requests
  if (authRateLimitMap.size > 100) {
    for (const [key, val] of authRateLimitMap) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) authRateLimitMap.delete(key);
    }
  }
  
  await next();
};

// ── Security Headers Middleware ──────────────────────────────────────────────
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

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
app.post('/auth/login', authRateLimit, async (c) => {
  try {
    const { users } = await getDb();
    const { username, pin, isSignup } = await c.req.json();

    if (!username || !pin || pin.length < 6) {
      return c.json({ success: false, error: "Password must be at least 6 characters long." }, 400);
    }

    let user = await users.findOne({ username: String(username) });
    
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

// Auto-login: verify token and return user data
app.get('/auth/me', requireAuth, async (c) => {
  try {
    const { users } = await getDb();
    const userId = c.get('user').userId;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    delete user.pin;
    return c.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: 'Failed to restore session' }, 500);
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
    const systemPrompt = `You are an encouraging but thorough English teacher evaluating a student's writing.
      Score out of 4 stars based on Grade ${grade || '1-2'} expectations.
      CRITICAL GRADING RULES:
      1. If there is more than 1 grammar/spelling mistake, deduct stars (maximum score should be 3 or less).
      2. The answer MUST relate perfectly to the prompt and answer all parts of the prompt. If it doesn't, deduct stars.
      3. Feedback MUST be detailed and informative, between 2 to 5 sentences per field.
      4. Vocabulary in the feedback should be simple enough for a Grade ${grade || '1-2'} student to read, but highly specific to the actual text they wrote.
      5. ALL Chinese translations (grammar_feedback_zh, content_feedback_zh, general_feedback_zh) MUST be in Simplified Chinese. DO NOT use Traditional Chinese.
      6. The student MUST write in English. If they write in Chinese, Korean, Spanish, or ANY language other than English, you MUST give 0 stars and gently explain that they need to practice writing in English.
      
      If the student writes gibberish, random letters, or very short incomplete thoughts (like "mn"), you MUST give 0 stars and gently explain in very simple words that you could not understand their writing. NEVER leave the feedback fields empty.
      Return JSON: {"reasoning":"", "stars": 4, "grammar_feedback":"", "grammar_feedback_zh":"", "content_feedback":"", "content_feedback_zh":"", "general_feedback":"", "general_feedback_zh":""}`;
    const userPrompt = `Writing Prompt: ${prompt}\n\nStudent Answer: ${studentAnswer}`;

    const { response, modelUsed } = await generateContentWithRetry(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
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

    const rawStars = Number(evaluation.stars);
    const stars = isNaN(rawStars) ? 1 : Math.max(0, Math.min(4, Math.round(rawStars)));
    return c.json({ 
      success: true, 
      stars, 
      grammar: evaluation.grammar_feedback || (stars <= 1 ? "Please write complete English sentences." : "Clear and accurate!"),
      grammarZh: evaluation.grammar_feedback_zh || (stars <= 1 ? "请写出完整的英文句子。" : "表达清晰准确！"),
      content: evaluation.content_feedback || (stars <= 1 ? "Make sure your answer matches the prompt." : "Great job answering the prompt!"),
      contentZh: evaluation.content_feedback_zh || (stars <= 1 ? "请确保你的回答与题目相关。" : "你很好地回答了问题！"),
      general: evaluation.general_feedback || (stars <= 1 ? "Keep trying! I couldn't understand your writing." : "Wonderful writing effort!"),
      generalZh: evaluation.general_feedback_zh || (stars <= 1 ? "继续努力！我不太懂你写的内容。" : "写得非常棒！"),
      modelUsed
    });
  } catch (error) {
    console.error('[Gemini Grading Error]:', error);
    return c.json({
      success: true,
      stars: 1,
      grammar: "Please write complete sentences.",
      grammarZh: "请写出完整的句子。",
      content: "Nice effort answering the writing prompt!",
      contentZh: "感谢你努力回答问题！",
      general: `Keep practicing! (Error: ${error.message})`,
      generalZh: "继续练习！",
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
    if (alternative && typeof alternative.transcript === 'string') {
      return {
        transcript: alternative.transcript.trim(),
        confidence: alternative.confidence || 0
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

function getSoundex(s) {
  if (!s) return '';
  let a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
  if (!a.length) return '';
  let f = a.shift();
  let codes = {
      a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
      b: 1, f: 1, p: 1, v: 1,
      c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
      d: 3, t: 3,
      l: 4,
      m: 5, n: 5,
      r: 6
  };
  let r = f + a.map((v, i, arr) => codes[v] === codes[arr[i - 1]] ? '' : codes[v])
      .filter(v => v !== undefined && v !== '')
      .join('')
      .substring(0, 3);
  return r.padEnd(4, '0');
}

function calculateLevenshteinSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - matrix[b.length][a.length] / maxLen;
}

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
      
      const heardWords = h.split(/\s+/).filter(w => w.length > 0);
      const targetWords = t.split(/\s+/).filter(w => w.length > 0);
      const isVoiceBattle = extras.isVoiceBattle === true;

      const sim = calculateLevenshteinSimilarity(h, t);

      if (isVoiceBattle) {
         // Voice Battle Logic: Handle single words transcribed as multiple (e.g. "st re am")
         const hMerged = h.replace(/\s+/g, '');
         const simMerged = calculateLevenshteinSimilarity(hMerged, t);
         
         let soundexMatch = false;
         if (targetWords.length === 1 && heardWords.length > 0) {
            const targetSoundex = getSoundex(t).substring(0, 2);
            for (const hw of heardWords) {
               if (getSoundex(hw).substring(0, 2) === targetSoundex && hw.length > 1) {
                  soundexMatch = true;
                  break;
               }
            }
            if (!soundexMatch && hMerged.length > 1) {
               if (getSoundex(hMerged).substring(0, 2) === targetSoundex) {
                  soundexMatch = true;
               }
            }
         }

         if (simMerged >= 0.75 || soundexMatch) {
            finalScore = 3;
            finalFeedback = `Hit! (${deepgramTranscript})`;
         } else if (simMerged >= 0.40 || hMerged.includes(t)) {
            finalScore = 2;
            finalFeedback = `Good! (${deepgramTranscript})`;
         } else if (hMerged.length > 0) {
            finalScore = 1; // Extremely easy 1-star (just need to speak something)
            finalFeedback = `Close! (${deepgramTranscript})`;
         }
      } else {
         // Original Keep Practicing (SpeakingModule) Logic
         let soundexMatch = false;
         if (targetWords.length === 1 && heardWords.length > 0) {
           const targetSoundex = getSoundex(t).substring(0, 2);
           for (const hw of heardWords) {
              if (getSoundex(hw).substring(0, 2) === targetSoundex && hw.length > 1) {
                 soundexMatch = true;
                 break;
              }
           }
         }

         if (soundexMatch) {
           finalScore = 3;
           finalFeedback = `Hit! (${deepgramTranscript})`;
         } else if (sim >= 0.75 || h.includes(t)) {
           finalScore = 3;
           finalFeedback = `Hit! (${deepgramTranscript})`;
         } else if (sim >= 0.55) {
           finalScore = 2;
           finalFeedback = `Good! (${deepgramTranscript})`;
         } else if (sim >= 0.20) {
           finalScore = 1;
           finalFeedback = `Close! (${deepgramTranscript})`;
         } else if (h.length > 0) {
           let bestMatchScore = 0;
           targetWords.forEach(tw => {
             let wordScore = 0;
             heardWords.forEach(hw => {
                const s = calculateLevenshteinSimilarity(hw, tw);
                if (s >= 0.75) wordScore = Math.max(wordScore, 3);
                else if (s >= 0.55) wordScore = Math.max(wordScore, 2);
                else if (s >= 0.20) wordScore = Math.max(wordScore, 1);
             });
             bestMatchScore += wordScore;
           });
           
           const avgScore = targetWords.length > 0 ? bestMatchScore / targetWords.length : 0;
           
           if (avgScore >= 2.5) {
              finalScore = 3;
              finalFeedback = `Hit! (${deepgramTranscript})`;
           } else if (avgScore >= 1.5) {
              finalScore = 2;
              finalFeedback = `Good! (${deepgramTranscript})`;
           } else if (avgScore > 0) {
              finalScore = 1;
              finalFeedback = `Close! (${deepgramTranscript})`;
           }
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

    const isVoiceBattleGemini = extras.isVoiceBattle === true;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { response } = await generateContentWithRetry(ai, {
      contents: [{
        role: "user",
        parts: [
          { text: `Analyze the audio pronunciation for: "${targetSentence}". Return ONLY JSON using this schema: {"speech_detected": boolean, "stars": number (0-3), "feedback": string}. If you do NOT hear any clear speech, you MUST return {"speech_detected": false, "stars": 0, "feedback": "No speech detected"}. ${isVoiceBattleGemini ? "This is a Voice Battle game, so make 1 star extremely easy to get (even if it's very badly pronounced), 2 stars for moderate, and 3 stars for highly accurate." : "Be very lenient and generous if you do hear speech, grade out of a maximum of 3 stars."}` },
          { inlineData: { data: base64Audio, mimeType } }
        ]
      }],
      config: { responseMimeType: 'application/json' },
    }, true);

    const evaluation = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
    const speechDetected = evaluation.speech_detected === true || evaluation.speech_detected === 'true';
    let finalScore = speechDetected ? Math.max(0, Math.min(3, Math.round(evaluation.stars))) : 0;
    
    // Force 1 star if speech was detected in Voice Battle to make it very easy to get 1 star
    if (isVoiceBattleGemini && speechDetected && finalScore === 0) {
       finalScore = 1;
    }
    
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
app.get('/test/tts', async (c) => {
  const ttsKey = process.env.TEXT_TO_SPEECH?.trim();
  const text = 'hello world';
  const res = await fetch('https://api.deepgram.com/v1/speak?model=aura-stella-en&encoding=mp3', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${ttsKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  return c.json({ status: res.status, ok: res.ok, statusText: res.statusText });
});

app.get('/audio/tts', async (c) => {
  const text = c.req.query('text');
  
  if (!text) return c.json({ success: false, error: 'Missing text' }, 400);

  const ttsKey = process.env.TEXT_TO_SPEECH?.trim();
  if (!ttsKey) return c.json({ success: false, error: 'TEXT_TO_SPEECH key missing' }, 500);

  let audioBuffer = null;
  let mimeType = 'audio/mp3';

  // Use Deepgram TTS
  try {
    const deepgramRes = await fetch('https://api.deepgram.com/v1/speak?model=aura-stella-en&encoding=mp3', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${ttsKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (deepgramRes.ok) {
      audioBuffer = await deepgramRes.arrayBuffer();
      mimeType = deepgramRes.headers.get('content-type') || 'audio/mp3';
    } else {
      console.error(`Deepgram TTS failed: ${deepgramRes.status} ${deepgramRes.statusText}`);
      const errText = await deepgramRes.text();
      console.error(`Deepgram Error details:`, errText);
      return c.json({ success: false, error: 'Deepgram API returned an error' }, 500);
    }
  } catch (error) {
    console.error('[TTS]', error);
    return c.json({ success: false, error: 'TTS network failed' }, 500);
  }

  c.header('Content-Type', mimeType);
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  return c.body(audioBuffer);
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

rootApp.route('/', app);

export const GET = handle(rootApp);
export const POST = handle(rootApp);
export const PUT = handle(rootApp);
export const DELETE = handle(rootApp);
export const OPTIONS = handle(rootApp);
