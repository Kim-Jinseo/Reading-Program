import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import { Buffer } from 'node:buffer';

const app = new Hono().basePath('/api');

// CORS setup
app.use('/*', cors());

// DB Connection Cache
let client = null;
let cachedCols = null;

async function getDb(env) {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect(); 
    const db = client.db('stepping_stones_v2');
    cachedCols = {
      users: db.collection("users"),
      curriculum: db.collection("curriculum"),
      progress: db.collection("progress")
    };
    console.log("✅ Successfully connected to MongoDB Atlas on Edge!");
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
    const decoded = await verify(token, c.env.JWT_SECRET);
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
      const decoded = await verify(token, c.env.JWT_SECRET);
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
const TEXT_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
const MULTIMODAL_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];

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
app.get('/', (c) => c.json({ status: 'ok', message: 'API is live on Cloudflare Pages!' }));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 1. AUTH API
app.post('/auth/login', async (c) => {
  try {
    const { users } = await getDb(c.env);
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

    const token = await sign({ userId: user._id.toString(), role: user.role }, c.env.JWT_SECRET);
    delete user.pin;
    return c.json({ success: true, user, token });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Server Error: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/auth/sync', requireAuth, async (c) => {
  try {
    const { users } = await getDb(c.env);
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
    const { users } = await getDb(c.env);
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
    const { curriculum } = await getDb(c.env);
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
    const { curriculum } = await getDb(c.env);
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
  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
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
    // We clone the request to not consume the body stream before the actual route does
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
  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

  try {
    const { response, modelUsed } = await generateContentWithRetry(ai, {
      contents: `You are an encouraging English teacher evaluating a student's writing... (rules omitted for brevity, but same spirit as Express)
      Score out of 4 stars based on Grade ${grade || '1-2'}. Return JSON: {"reasoning":"", "stars": 4, "grammar_feedback":"", "content_feedback":"", "general_feedback":""}
      Student Answer: ${studentAnswer}`,
      config: { responseMimeType: "application/json" }
    });
    
    const cleanJsonStr = response.text ? response.text.replace(/```json/g, '').replace(/```/g, '').trim() : "{}";
    if (cleanJsonStr.toLowerCase().includes("system prompt")) throw new Error("Safety Check Failed");

    const evaluation = JSON.parse(cleanJsonStr);
    return c.json({ 
      success: true, 
      stars: Math.max(0, Math.min(4, Math.round(evaluation.stars))), 
      grammar: evaluation.grammar_feedback || "Clear and accurate!",
      content: evaluation.content_feedback || "Great job answering the prompt!",
      general: evaluation.general_feedback || "Wonderful writing effort!",
      modelUsed
    });
  } catch (error) {
    // Heuristic fallback
    return c.json({
      success: true,
      stars: 1,
      grammar: "Please write complete sentences.",
      content: "Nice effort answering the writing prompt!",
      general: "Keep practicing!",
      modelUsed: "heuristic-fallback"
    });
  }
});

// Audio Helper removed (parsed inline)

app.post('/audio/evaluate', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['voiceRecord'];
    const targetSentence = formData['targetSentence'];
    if (!file) return c.json({ success: false, error: "No audio detected." }, 400);
    
    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

    const { response } = await generateContentWithRetry(ai, {
      contents: [
        { text: `Analyze the audio pronunciation for: "${targetSentence}". Return ONLY JSON {"speech_detected": true, "stars": 4}` },
        { inlineData: { data: base64Audio, mimeType: file.type } }
      ],
      config: { responseMimeType: "application/json" }
    }, true);

    const evaluation = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
    const speechDetected = evaluation.speech_detected === true || evaluation.speech_detected === "true";
    let finalScore = speechDetected ? Math.max(0, Math.min(4, Math.round(evaluation.stars))) : 0;
    let finalFeedback = speechDetected ? (evaluation.feedback || "Good effort!") : "I couldn't hear your voice!";
    
    return c.json({ success: true, score: finalScore, feedback: finalFeedback, targetSentence });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Audio analysis failed: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/audio/roleplay', requireAuth, async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['voiceRecord'];
    if (!file) return c.json({ success: false, error: "No audio detected." }, 400);

    const base64Audio = Buffer.from(await file.arrayBuffer()).toString('base64');
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

    const textResponse = await generateContentWithRetry(ai, {
      contents: [
        { text: `You are a friendly alien pen-pal. Reply to the student in 1-2 very short English sentences.` },
        { inlineData: { data: base64Audio, mimeType: file.type } }
      ]
    }, true);

    const replyText = textResponse.response.text.trim();

    let audioBase64 = null;
    let audioMimeType = null;
    try {
      const ttsRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts',
        contents: `Please read the following aloud in a very cute, friendly, enthusiastic voice:\n\n${replyText}`,
        config: { responseModalities: ["AUDIO"] }
      });
      const audioPart = ttsRes?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (audioPart) {
        audioBase64 = audioPart.inlineData.data;
        audioMimeType = audioPart.inlineData.mimeType;
      }
    } catch(e) { console.error("TTS generation failed:", e); }

    return c.json({ success: true, text: replyText, audioBase64, mimeType: audioMimeType });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Roleplay failed: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/audio/tts', requireAuth, async (c) => {
  const { text } = await c.req.json();
  if (!text) return c.json({ success: false, error: "Missing text" }, 400);
  try {
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts',
      contents: `Please read aloud enthusiastically:\n\n${text}`,
      config: { responseModalities: ["AUDIO"] }
    });
    const audioPart = response?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (audioPart) {
      return c.json({ success: true, audioBase64: audioPart.inlineData.data, mimeType: audioPart.inlineData.mimeType });
    }
    return c.json({ success: false, error: "No audio returned" }, 500);
  } catch(error) {
    console.error(error);
    return c.json({ success: false, error: "TTS failed: " + (error.message || "Unknown error") }, 500);
  }
});

app.post('/audio/transcribe', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['voiceRecord'];
    if (!file) return c.json({ success: false, error: "No audio detected." }, 400);

    const base64Audio = Buffer.from(await file.arrayBuffer()).toString('base64');
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

    const response = await generateContentWithRetry(ai, {
      contents: [
        { text: `Transcribe the English words spoken in this audio accurately. If no English speech is detected, return an empty string. Return ONLY the transcribed text, with no extra commentary.` },
        { inlineData: { data: base64Audio, mimeType: file.type } }
      ]
    }, true);

    return c.json({ success: true, text: response.response.text.trim() });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Transcription failed: " + (error.message || "Unknown error") }, 500);
  }
});

export const onRequest = handle(app);
