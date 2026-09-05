import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { createClassroomRouter } from '../server/classrooms.js';
import { createLessonRouter } from '../server/lessons.js';

const rootApp = new Hono();
const APP_ISSUER = 'stepping-stones';
const APP_AUDIENCE = 'stepping-stones-web';
const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const MAX_REQUEST_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const MAX_TTS_TEXT_LENGTH = 280;

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }
  return secret;
};

const jwtVerificationOptions = {
  alg: 'HS256',
  iss: APP_ISSUER,
  aud: APP_AUDIENCE,
};

const hasRequiredSessionClaims = (session) => {
  const now = Math.floor(Date.now() / 1000);
  return Boolean(
    session
    && typeof session.userId === 'string'
    && ObjectId.isValid(session.userId)
    && Number.isInteger(session.iat)
    && Number.isInteger(session.exp)
    && session.iat <= now
    && session.exp > now
  );
};

const createSessionToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  return sign({
    userId: user._id.toString(),
    role: ['admin', 'teacher'].includes(user.role) ? user.role : 'student',
    tokenVersion: Number.isInteger(user.tokenVersion) ? user.tokenVersion : 0,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    iss: APP_ISSUER,
    aud: APP_AUDIENCE,
  }, getJwtSecret(), 'HS256');
};

rootApp.use('*', async (c, next) => {
  const requestId = c.req.header('x-request-id') || randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
  c.header('Cross-Origin-Opener-Policy', 'same-origin');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
  c.header('X-Permitted-Cross-Domain-Policies', 'none');
  c.header('Cache-Control', 'no-store, max-age=0');
  await next();
});

rootApp.onError((error, c) => {
  console.error('[API]', c.get('requestId') || 'unknown', error);
  return c.json({ success: false, error: 'Something went wrong. Please try again.', requestId: c.get('requestId') }, 500);
});

rootApp.notFound((c) => c.json({ success: false, error: 'Not found.' }, 404));
rootApp.get('/', (c) => c.json({ status: 'ok' }));

const app = new Hono().basePath('/api');

// Same-origin browser traffic is routed through the frontend proxy. Direct
// cross-origin API access is opt-in through the server-side ALLOWED_ORIGINS
// environment variable; it is never reflected from an arbitrary request.
app.use('/*', cors({
  origin: (origin) => allowedOrigins.has(origin) ? origin : null,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
}));

app.use('/*', async (c, next) => {
  const contentLength = Number(c.req.header('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return c.json({ success: false, error: 'Request is too large.' }, 413);
  }
  await next();
});

// DB Connection Cache
let client = null;
let cachedCols = null;
let connectionPromise = null;

async function getDb() {
  if (cachedCols) return cachedCols;
  if (!connectionPromise) connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI environment variable is not set!");
    
    client = new MongoClient(uri);
    await client.connect(); 
    const db = client.db('stepping_stones_v2');
    cachedCols = {
      users: db.collection("users"),
      curriculum: db.collection("curriculum"),
      progress: db.collection("progress"),
      placementTests: db.collection("placement_tests"),
      classes: db.collection('classes'),
      assignments: db.collection('class_assignments'),
      submissions: db.collection('assignment_submissions'),
      teacherInvites: db.collection('teacher_invitations'),
      classroomLimits: db.collection('classroom_rate_limits'),
      lessonCollections: db.collection('lesson_collections'),
      lessons: db.collection('course_lessons'),
      lessonAssets: db.collection('lesson_slide_assets'),
      lessonParts: db.collection('lesson_activity_submissions'),
      withLessonTransaction: async work => {
        const session = client.startSession();
        try { return await session.withTransaction(() => work(session), { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }, maxCommitTimeMS: 10000 }); }
        finally { await session.endSession(); }
      }
    };
    try {
      await cachedCols.users.createIndex({ username: 1 }, { unique: true, name: 'unique_username' });
    } catch (error) {
      // Keep the site available for legacy data while making a duplicate-name
      // problem obvious in provider logs so it can be cleaned up.
      console.error('[Database] Could not enforce the unique username index.', error);
    }
    console.log("✅ Successfully connected to MongoDB Atlas on Vercel!");
    return cachedCols;
  })().catch(error => { client = null; cachedCols = null; connectionPromise = null; throw error; });
  return connectionPromise;
}

// ── Security: In-memory rate limiter for auth endpoints ──────────────────────
const rateLimitEntries = new Map();

const getRequestIdentity = (c) => {
  const accountId = c.get('user')?.userId;
  if (accountId) return 'user:' + accountId;
  const forwarded = c.req.header('x-vercel-forwarded-for')
    || 'unknown';
  return 'ip:' + forwarded;
};

const createRateLimiter = (bucket, { windowMs, maxRequests }) => async (c, next) => {
  const now = Date.now();
  const key = bucket + ':' + getRequestIdentity(c);
  const entry = rateLimitEntries.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    rateLimitEntries.set(key, { windowStart: now, count: 1 });
  } else if (entry.count >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - entry.windowStart)) / 1000));
    c.header('Retry-After', String(retryAfter));
    return c.json({ success: false, error: 'Too many requests. Please try again later.' }, 429);
  } else {
    entry.count += 1;
  }

  if (rateLimitEntries.size > 500) {
    for (const [storedKey, storedEntry] of rateLimitEntries) {
      if (now - storedEntry.windowStart >= windowMs * 2) rateLimitEntries.delete(storedKey);
    }
  }

  await next();
};

// This is a per-instance safety net. Configure durable rate limits/WAF rules
// at the hosting edge as described in SECURITY.md for cross-instance coverage.
const authRateLimit = createRateLimiter('auth', { windowMs: 15 * 60 * 1000, maxRequests: 8 });
const placementRateLimit = createRateLimiter('placement', { windowMs: 15 * 60 * 1000, maxRequests: 6 });
const writingRateLimit = createRateLimiter('writing', { windowMs: 5 * 60 * 1000, maxRequests: 8 });
const audioRateLimit = createRateLimiter('audio', { windowMs: 5 * 60 * 1000, maxRequests: 18 });
const ttsRateLimit = createRateLimiter('tts', { windowMs: 5 * 60 * 1000, maxRequests: 30 });
const practiceRateLimit = createRateLimiter('practice', { windowMs: 5 * 60 * 1000, maxRequests: 8 });
const syncRateLimit = createRateLimiter('sync', { windowMs: 5 * 60 * 1000, maxRequests: 60 });

// ── Security Headers Middleware ──────────────────────────────────────────────
// Auth Middlewares
const requireAuth = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verify(token, getJwtSecret(), jwtVerificationOptions);
    if (!hasRequiredSessionClaims(decoded)) {
      throw new Error('Invalid token subject.');
    }
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid or expired session.' }, 401);
  }
};

const optionalAuth = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await verify(token, getJwtSecret(), jwtVerificationOptions);
      c.set('user', hasRequiredSessionClaims(decoded) ? decoded : { isGuest: true });
    } catch {
      c.set('user', { isGuest: true });
    }
  } else {
    c.set('user', { isGuest: true });
  }
  await next();
};

const requireAdmin = async (c, next) => {
  const user = c.get('user');
  if (!user?.userId || !ObjectId.isValid(user.userId)) {
    return c.json({ success: false, error: 'Forbidden.' }, 403);
  }
  try {
    const { users } = await getDb();
    const account = await users.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { role: 1, tokenVersion: 1 } }
    );
    const currentTokenVersion = Number.isInteger(account?.tokenVersion) ? account.tokenVersion : 0;
    if (account?.role !== 'admin' || currentTokenVersion !== (Number.isInteger(user.tokenVersion) ? user.tokenVersion : 0)) {
      return c.json({ success: false, error: 'Forbidden.' }, 403);
    }
    c.set('account', account);
    await next();
  } catch (error) {
    console.error('[Admin authorization]', error);
    return c.json({ success: false, error: 'Forbidden.' }, 403);
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
app.get('/', (c) => c.json({ status: 'ok' }));
app.get('/health', (c) => c.json({ status: 'ok' }));

// 1. AUTH API
const cleanUsername = (value) => {
  if (typeof value !== 'string') return null;
  const username = value.trim();
  if (username.length < 2 || username.length > 40 || /[\u0000-\u001F\u007F]/.test(username)) return null;
  return username;
};

const publicUser = (user) => {
  const { _id, pin, tokenVersion, role, ...safeUser } = user;
  return { ...safeUser, role: ['admin', 'teacher'].includes(role) ? role : 'student' };
};

app.route('/classroom', createClassroomRouter({ getDb, requireAuth, createSessionToken, publicUser }));
app.route('/lessons', createLessonRouter({ getDb, requireAuth, evaluateSpeech: async ({ sentence, audioBase64, audioMime, authorization }) => {
  // Internal dispatch reuses the existing Deepgram-first evaluator. The target
  // comes from the stored lesson, never from a student's request.
  const response = await app.request('http://localhost/api/audio/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authorization }, body: JSON.stringify({ targetSentence: sentence, audioBase64, mimeType: audioMime }) });
  return response.json();
} }));

app.post('/auth/login', authRateLimit, async (c) => {
  try {
    const { users } = await getDb();
    const body = await c.req.json();
    const username = cleanUsername(body?.username);
    const pin = typeof body?.pin === 'string' ? body.pin : '';
    const isSignup = body?.isSignup === true;

    if (!username || !pin || pin.length > 128) {
      return c.json({ success: false, error: 'Please enter a valid username and password.' }, 400);
    }
    if (isSignup && pin.length < 8) {
      return c.json({ success: false, error: 'New passwords must be at least 8 characters long.' }, 400);
    }

    let user = await users.findOne({ username });
    
    if (isSignup) {
      if (user) return c.json({ success: false, error: 'That username is not available.' }, 400);

      const hashedPin = await bcrypt.hash(pin, 12);
      const baseUserData = {
        username,
        pin: hashedPin,
        role: 'student',
        tokenVersion: 0,
        stars: 0,
        masteredVocab: [], completedGrammar: [], completedWriting: [], completedSpeaking: [], completedReading: [],
        stats: { vocab: 0, grammar: 0, writing: 0, speaking: 0, reading: 0 },
        starsTracker: {}, essays: {}
      };

      try {
        const result = await users.insertOne({ ...baseUserData, role: 'student' });
        user = await users.findOne({ _id: result.insertedId });
      } catch (error) {
        if (error?.code === 11000) {
          return c.json({ success: false, error: 'That username is not available.' }, 400);
        }
        throw error;
      }
    } else {
      if (!user) return c.json({ success: false, error: "Invalid credentials." }, 401);
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (!isMatch) return c.json({ success: false, error: "Invalid credentials." }, 401);
    }

    const token = await createSessionToken(user);
    return c.json({ success: true, user: publicUser(user), token });
  } catch (error) {
    console.error('[Authentication]', error);
    return c.json({ success: false, error: 'Unable to complete sign-in. Please try again.' }, 500);
  }
});

// Auto-login: verify token and return user data
app.get('/auth/me', requireAuth, async (c) => {
  try {
    const { users } = await getDb();
    const session = c.get('user');
    const userId = session.userId;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    const currentTokenVersion = Number.isInteger(user.tokenVersion) ? user.tokenVersion : 0;
    if (currentTokenVersion !== (Number.isInteger(session.tokenVersion) ? session.tokenVersion : 0)) {
      return c.json({ success: false, error: 'Invalid or expired session.' }, 401);
    }
    return c.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('[Session restore]', error);
    return c.json({ success: false, error: 'Failed to restore session' }, 500);
  }
});

const isPlainRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const containsUnsafeKeys = (value, depth = 0) => {
  if (depth > 5) return true;
  if (Array.isArray(value)) return value.some(item => containsUnsafeKeys(item, depth + 1));
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).some(([key, item]) => key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor' || containsUnsafeKeys(item, depth + 1));
};
const isBoundedStringArray = (value, maxItems = 1000) => Array.isArray(value)
  && value.length <= maxItems
  && value.every(item => typeof item === 'string' && item.length > 0 && item.length <= 120);

const syncArrayFields = new Set([
  'masteredVocab', 'completedGrammar', 'completedWriting', 'completedSpeaking',
  'completedReading', 'inventory', 'unlockedChars', 'unlockedPets'
]);
const syncObjectFields = new Set([
  'vocabStats', 'grammarStats', 'dailyProgress', 'essays', 'clearedVoiceStages',
  'starsTracker', 'stats'
]);
const syncEquipmentFields = new Set(['equippedChar', 'equippedPet', 'equippedShield']);

const sanitizeProgressUpdates = (updates) => {
  if (!isPlainRecord(updates) || Object.keys(updates).length === 0 || Object.keys(updates).length > 20) {
    return { error: 'Invalid progress update.' };
  }
  if (containsUnsafeKeys(updates)) return { error: 'Invalid progress update.' };

  const safeUpdates = {};
  for (const [key, value] of Object.entries(updates)) {
    if (syncArrayFields.has(key)) {
      if (!isBoundedStringArray(value, key === 'inventory' ? 80 : 1500)) return { error: 'Invalid progress update.' };
      safeUpdates[key] = value;
      continue;
    }
    if (syncObjectFields.has(key)) {
      if (!isPlainRecord(value) || Object.keys(value).length > 1500 || JSON.stringify(value).length > 300000) {
        return { error: 'Invalid progress update.' };
      }
      safeUpdates[key] = value;
      continue;
    }
    if (syncEquipmentFields.has(key)) {
      if (value !== null && (typeof value !== 'string' || !/^[a-z0-9_]{2,60}$/.test(value))) {
        return { error: 'Invalid progress update.' };
      }
      safeUpdates[key] = value;
      continue;
    }
    if (key === 'stars' || key === 'trophies') {
      if (!Number.isSafeInteger(value) || value < 0 || value > 100000) return { error: 'Invalid progress update.' };
      safeUpdates[key] = value;
      continue;
    }
    return { error: 'This account field cannot be changed from the browser.' };
  }
  return { value: safeUpdates };
};

app.post('/auth/sync', requireAuth, syncRateLimit, async (c) => {
  try {
    const { users } = await getDb();
    const body = await c.req.json();
    const { value: updates, error: validationError } = sanitizeProgressUpdates(body?.updates);
    if (validationError) return c.json({ success: false, error: validationError }, 400);
    const session = c.get('user');
    const userId = session.userId;
    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { tokenVersion: 1 } }
    );
    const currentTokenVersion = Number.isInteger(user?.tokenVersion) ? user.tokenVersion : 0;
    if (!user || currentTokenVersion !== (Number.isInteger(session.tokenVersion) ? session.tokenVersion : 0)) {
      return c.json({ success: false, error: 'Invalid or expired session.' }, 401);
    }
    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updates });
    return c.json({ success: true });
  } catch (error) {
    console.error('[Progress sync]', error);
    return c.json({ success: false, error: 'Failed to sync user data.' }, 500);
  }
});

// Placement tests are intentionally stored in their own MongoDB collection.
// We store scores and recommendations, never microphone recordings.
app.post('/placement-tests', optionalAuth, placementRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const chineseName = typeof body.chineseName === 'string' ? body.chineseName.trim() : '';
    const currentGrade = Number(body.currentGrade);
    const formId = typeof body.formId === 'string' ? body.formId : '';
    const requestedLevel = body.recommendedLevel;
    const validFormIds = new Set(['garden-seeds', 'market-bread', 'rainy-walk', 'bird-house', 'school-poster', 'night-sky', 'adaptive-v1', 'adaptive-v2', 'adaptive-v3', 'adaptive-v4']);
    const isAdaptiveForm = formId === 'adaptive-v1' || formId === 'adaptive-v2' || formId === 'adaptive-v3' || formId === 'adaptive-v4';
    const usesWeightedAdaptiveScoring = formId === 'adaptive-v2' || formId === 'adaptive-v3' || formId === 'adaptive-v4';
    const usesStrictAdaptiveRouting = formId === 'adaptive-v3' || formId === 'adaptive-v4';
    const strictAdaptiveConfig = formId === 'adaptive-v4'
      ? { pathLength: 20, sectionCounts: { vocab: 5, grammar: 5, reading: 5, speaking: 5 } }
      : { pathLength: 14, sectionCounts: { vocab: 5, grammar: 3, reading: 3, speaking: 3 } };

    if (!/^[\u3400-\u9fff]{2,10}$/u.test(chineseName)) {
      return c.json({ success: false, error: 'Please provide a Chinese name with 2 to 10 characters.' }, 400);
    }
    if (!Number.isInteger(currentGrade) || currentGrade < 1 || currentGrade > 6) {
      return c.json({ success: false, error: 'Current grade must be between 1 and 6.' }, 400);
    }
    if (!validFormIds.has(formId)) {
      return c.json({ success: false, error: 'Unknown placement test form.' }, 400);
    }

    // The older fixed forms always have the same mix of levels. An adaptive
    // form does not: its level mix is selected from the student's answers.
    const levelMaximums = { 1: 7, 2: 7, 3: 6 };
    const levelScores = {};
    for (const [level, max] of Object.entries(levelMaximums)) {
      const raw = body.levelScores?.[level];
      const score = Number(raw?.score);
      const reportedMax = Number(raw?.max);
      const hasValidAdaptiveMaximum = Number.isInteger(reportedMax) && reportedMax >= 0;
      const hasValidFixedMaximum = reportedMax === max;
      if (!Number.isFinite(score) || !Number.isFinite(reportedMax) || !Number.isInteger(score) || (!isAdaptiveForm && !hasValidFixedMaximum) || (isAdaptiveForm && !hasValidAdaptiveMaximum) || score < 0 || score > reportedMax) {
        return c.json({ success: false, error: 'Invalid placement level scores.' }, 400);
      }
      levelScores[level] = { score, max: reportedMax };
    }

    const sectionMaximums = { reading: 3, vocab: 5, grammar: 3, speaking: 9 };
    const sectionScores = {};
    for (const [section, max] of Object.entries(sectionMaximums)) {
      const raw = body.sectionScores?.[section];
      const score = Number(raw?.score);
      const reportedMax = Number(raw?.max);
      const validWeightedSectionScore = Number.isInteger(score) && Number.isInteger(reportedMax) && reportedMax > 0;
      if (!Number.isFinite(score) || !Number.isFinite(reportedMax) || (!usesWeightedAdaptiveScoring && reportedMax !== max) || (usesWeightedAdaptiveScoring && !validWeightedSectionScore) || score < 0 || score > reportedMax) {
        return c.json({ success: false, error: 'Invalid placement section scores.' }, 400);
      }
      sectionScores[section] = { score, max: reportedMax };
    }

    const totalScore = Number(body.totalScore);
    const totalMax = Number(body.totalMax);
    const levelTotal = Object.values(levelScores).reduce((sum, item) => sum + item.score, 0);
    const sectionTotal = Object.values(sectionScores).reduce((sum, item) => sum + item.score, 0);
    const levelMaximumTotal = Object.values(levelScores).reduce((sum, item) => sum + item.max, 0);
    const hasValidWeightedTotal = Number.isInteger(totalMax) && totalMax > 0;
    if (!Number.isFinite(totalScore) || !Number.isInteger(totalScore) || (!usesWeightedAdaptiveScoring && totalMax !== 20) || (usesWeightedAdaptiveScoring && !hasValidWeightedTotal) || totalScore < 0 || totalScore > totalMax || levelMaximumTotal !== totalMax || totalScore !== levelTotal || totalScore !== sectionTotal) {
      return c.json({ success: false, error: 'Placement total does not match the section scores.' }, 400);
    }

    const rate = level => levelScores[level].score / levelScores[level].max;
    const totalRate = totalScore / totalMax;
    const sectionRate = section => sectionScores[section].score / sectionScores[section].max;
    const coreSections = ['vocab', 'reading', 'speaking'];
    const coreScore = coreSections.reduce((sum, section) => sum + sectionScores[section].score, 0);
    const coreMax = coreSections.reduce((sum, section) => sum + sectionScores[section].max, 0);
    const coreRate = coreMax ? coreScore / coreMax : 0;
    const strongCoreSkills = coreSections.filter(section => sectionRate(section) >= 0.6).length;
    const recommendedLevel = usesWeightedAdaptiveScoring
      ? (coreRate >= 0.72 && strongCoreSkills >= 2 && totalRate >= 0.66
        ? '3'
        : coreRate >= 0.38 && totalRate >= 0.34
          ? '2'
          : '1')
      : isAdaptiveForm
      ? (sectionRate('vocab') >= 0.8 && sectionRate('grammar') >= (2 / 3) && sectionRate('reading') >= (2 / 3) && sectionRate('speaking') >= (2 / 3) && totalRate >= 0.72
        ? '3'
        : sectionRate('vocab') >= 0.4 && sectionRate('grammar') >= (1 / 3) && sectionRate('reading') >= (1 / 3) && totalRate >= 0.48
          ? '2'
          : '1')
      : (rate(1) >= 0.8 && rate(2) >= 0.7 && rate(3) >= 0.6 && totalRate >= 0.72
        ? '3'
        : rate(1) >= 0.6 && rate(2) >= 0.45 && totalRate >= 0.5
          ? '2'
          : '1');

    if (requestedLevel !== recommendedLevel) {
      return c.json({ success: false, error: 'Placement recommendation did not match the score.' }, 400);
    }

    const adaptivePath = (isAdaptiveForm || usesStrictAdaptiveRouting) && Array.isArray(body.adaptivePath)
      ? body.adaptivePath.slice(0, usesStrictAdaptiveRouting ? strictAdaptiveConfig.pathLength : 12).filter(item => item && typeof item.id === 'string' && /^adaptive-(vocab|grammar|reading|speaking)-[1-3]-\d+$/.test(item.id) && ['vocab', 'grammar', 'reading', 'speaking'].includes(item.section) && [1, 2, 3].includes(Number(item.level))).map(item => ({ id: item.id, section: item.section, level: Number(item.level) }))
      : [];
    const expectedPathLength = usesStrictAdaptiveRouting ? strictAdaptiveConfig.pathLength : 12;
    const expectedReadingEntries = usesStrictAdaptiveRouting ? strictAdaptiveConfig.sectionCounts.reading : 1;
    const hasExpectedSectionCounts = usesStrictAdaptiveRouting
      ? Object.entries(strictAdaptiveConfig.sectionCounts).every(([section, count]) => adaptivePath.filter(item => item.section === section).length === count)
      : adaptivePath.filter(item => item.section === 'vocab').length === 5
        && adaptivePath.filter(item => item.section === 'grammar').length === 3
        && adaptivePath.filter(item => item.section === 'reading').length === expectedReadingEntries
        && adaptivePath.filter(item => item.section === 'speaking').length === 3;
    if ((isAdaptiveForm || usesStrictAdaptiveRouting) && (adaptivePath.length !== expectedPathLength || !hasExpectedSectionCounts)) {
      return c.json({ success: false, error: 'Invalid adaptive placement path.' }, 400);
    }
    if (usesStrictAdaptiveRouting && new Set(adaptivePath.map(item => item.id)).size !== adaptivePath.length) {
      return c.json({ success: false, error: 'Adaptive placement questions must not repeat.' }, 400);
    }

    let adaptiveResponses = [];
    if (usesStrictAdaptiveRouting) {
      const rawResponses = Array.isArray(body.adaptiveResponses) ? body.adaptiveResponses : [];
      adaptiveResponses = rawResponses.slice(0, strictAdaptiveConfig.pathLength).map(item => ({
        section: item?.section,
        level: Number(item?.level),
        score: Number(item?.score)
      }));
      if (adaptiveResponses.length !== adaptivePath.length || adaptiveResponses.some((response, index) => {
        const rawMaximum = response.section === 'speaking' ? 3 : 1;
        const pathItem = adaptivePath[index];
        return !pathItem || response.section !== pathItem.section || response.level !== pathItem.level || !Number.isInteger(response.score) || response.score < 0 || response.score > rawMaximum;
      })) {
        return c.json({ success: false, error: 'Invalid adaptive response evidence.' }, 400);
      }

      const levelPoints = { 1: 1, 2: 2, 3: 3 };
      const sectionWeights = { vocab: 3, grammar: 1, reading: 3, speaking: 3 };
      const responseSectionScores = { reading: { score: 0, max: 0 }, vocab: { score: 0, max: 0 }, grammar: { score: 0, max: 0 }, speaking: { score: 0, max: 0 } };
      const responseLevelScores = { 1: { score: 0, max: 0 }, 2: { score: 0, max: 0 }, 3: { score: 0, max: 0 } };
      adaptiveResponses.forEach(response => {
        const rawMaximum = response.section === 'speaking' ? 3 : 1;
        const multiplier = levelPoints[response.level] * sectionWeights[response.section];
        const max = rawMaximum * multiplier;
        const score = response.score * multiplier;
        responseSectionScores[response.section].score += score;
        responseSectionScores[response.section].max += max;
        responseLevelScores[response.level].score += score;
        responseLevelScores[response.level].max += max;
      });
      const totalsMatch = Object.entries(responseSectionScores).every(([section, score]) => score.score === sectionScores[section].score && score.max === sectionScores[section].max)
        && Object.entries(responseLevelScores).every(([level, score]) => score.score === levelScores[level].score && score.max === levelScores[level].max);
      if (!totalsMatch) return c.json({ success: false, error: 'Placement totals did not match the response evidence.' }, 400);

      const rateForSections = sections => {
        let score = 0;
        let max = 0;
        adaptiveResponses.forEach(response => {
          if (!sections.includes(response.section)) return;
          const rawMaximum = response.section === 'speaking' ? 3 : 1;
          const multiplier = levelPoints[response.level] * sectionWeights[response.section];
          score += response.score * multiplier;
          max += rawMaximum * multiplier;
        });
        return max ? score / max : 0;
      };
      const routedLevel = sections => {
        const rate = rateForSections(sections);
        return rate >= 0.8 ? 3 : rate >= 0.45 ? 2 : 1;
      };
      const expectedLevelForResponse = (response, index) => {
        if (index === 0) return 1;
        const previous = adaptiveResponses[index - 1];
        if (response.section === previous.section) {
          const wasCorrect = previous.section === 'speaking' ? previous.score >= 2 : previous.score === 1;
          return Math.max(1, Math.min(3, previous.level + (wasCorrect ? 1 : -1)));
        }
        if (response.section === 'grammar') return Math.min(2, routedLevel(['vocab']));
        if (response.section === 'reading') return routedLevel(['vocab', 'grammar']);
        if (response.section === 'speaking') return routedLevel(['vocab', 'grammar', 'reading']);
        return 1;
      };
      if (adaptiveResponses.some((response, index) => response.level !== expectedLevelForResponse(response, index))) {
        return c.json({ success: false, error: 'Adaptive placement path did not follow the response results.' }, 400);
      }
    }
    if (usesWeightedAdaptiveScoring) {
      const levelPoints = { 1: 1, 2: 2, 3: 3 };
      const sectionWeights = { vocab: 3, grammar: 1, reading: 3, speaking: 3 };
      const expectedSectionMaximums = { reading: 0, vocab: 0, grammar: 0, speaking: 0 };
      adaptivePath.forEach(({ section, level }) => {
        const questionCount = section === 'reading' && !usesStrictAdaptiveRouting ? 3 : 1;
        const rawMaximum = section === 'speaking' ? 3 : 1;
        expectedSectionMaximums[section] += questionCount * rawMaximum * levelPoints[level] * sectionWeights[section];
      });
      const expectedWeightedTotal = Object.values(expectedSectionMaximums).reduce((sum, maximum) => sum + maximum, 0);
      if (totalMax !== expectedWeightedTotal || Object.entries(expectedSectionMaximums).some(([section, maximum]) => sectionScores[section].max !== maximum)) {
        return c.json({ success: false, error: 'Placement points do not match the adaptive path.' }, 400);
      }
    }

    let scaledScore = null;
    if (usesStrictAdaptiveRouting) {
      const sectionWeights = { vocab: 3, grammar: 1, reading: 3, speaking: 3 };
      const pathDifficultyWeight = item => (item.section === 'speaking' ? 3 : 1) * sectionWeights[item.section];
      const difficultyTotal = adaptivePath.reduce((sum, item) => sum + pathDifficultyWeight(item), 0);
      const averageDifficulty = difficultyTotal
        ? adaptivePath.reduce((sum, item) => sum + (item.level * pathDifficultyWeight(item)), 0) / difficultyTotal
        : 1;
      const evidenceRate = (coreRate * 0.9) + (sectionRate('grammar') * 0.1);
      const difficultySignal = (averageDifficulty - 1) / 2;
      scaledScore = Math.round(Math.max(100, Math.min(300, 100 + (200 * ((evidenceRate * 0.85) + (difficultySignal * 0.15))))));
      if (!Number.isInteger(Number(body.scaledScore)) || Number(body.scaledScore) !== scaledScore) {
        return c.json({ success: false, error: 'Placement score did not match the adaptive results.' }, 400);
      }
    }

    const { placementTests } = await getDb();
    const record = {
      chineseName,
      currentGrade,
      recommendedLevel,
      formId,
      totalScore,
      totalMax,
      levelScores,
      sectionScores,
      ...((isAdaptiveForm || usesStrictAdaptiveRouting) ? { adaptivePath } : {}),
      ...(usesStrictAdaptiveRouting ? { adaptiveResponses } : {}),
      ...(usesStrictAdaptiveRouting ? { scaledScore } : {}),
      createdAt: new Date()
    };
    await placementTests.insertOne(record);
    return c.json({ success: true, recommendedLevel });
  } catch (error) {
    console.error('[Placement Test Save]', error);
    return c.json({ success: false, error: 'Failed to save placement test.' }, 500);
  }
});

const maskLeaderboardName = (username) => {
  const text = typeof username === 'string' ? username.trim() : '';
  if (!text) return 'Student';
  if (text.length === 1) return text + '•';
  return text.slice(0, 1) + '•'.repeat(Math.min(4, Math.max(1, text.length - 1)));
};

app.get('/leaderboard', optionalAuth, async (c) => {
  try {
    const { users } = await getDb();
    const usersData = await users.find(
      { role: { $nin: ['admin', 'teacher'] } },
      { projection: { username: 1, stars: 1, trophies: 1 } }
    ).toArray();

    const accountUserId = c.get('user')?.userId || null;
    const leaderboard = usersData.map(u => ({
      userId: u._id.toString(),
      name: maskLeaderboardName(u.username),
      trophies: u.trophies !== undefined ? u.trophies : (u.stars || 0),
    }))
      .sort((a, b) => b.trophies - a.trophies)
      .slice(0, 100)
      .map((u, index) => ({
        id: 'rank-' + (index + 1),
        name: u.name,
        trophies: u.trophies,
        isCurrentUser: Boolean(accountUserId && u.userId === accountUserId)
      }));

    return c.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('[Leaderboard]', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard.' }, 500);
  }
});

app.get('/curriculum', async (c) => {
  try {
    const { curriculum } = await getDb();
    const allData = await curriculum.find({}).toArray();
    const formattedData = {};
    allData.forEach(doc => { formattedData[doc.grade] = doc.content; });

    // Clean up any remaining '翻译' placeholder items in DB responses
    for (const g in formattedData) {
      if (Array.isArray(formattedData[g]?.vocab)) {
        formattedData[g].vocab.forEach(v => {
          if (v.def && (v.def.includes('翻译') || v.answer === '翻译')) {
            if (v.word === 'minute') { v.def = '分钟 (fēn zhōng)'; v.answer = '分钟'; }
            else if (v.word === 'nature') { v.def = '自然 (zì rán)'; v.answer = '自然'; }
            else if (v.word === 'numbers') { v.def = '数字 (shù zì)'; v.answer = '数字'; }
            else if (v.word === 'quick') { v.def = '快速的 (kuài sù de)'; v.answer = '快速的'; }
            else if (v.word === 'sell') { v.def = '卖 (mài)'; v.answer = '卖'; }
            else if (v.word === 'work') { v.def = '工作 (gōng zuò)'; v.answer = '工作'; }
            else if (v.word === 'year') { v.def = '年 (nián)'; v.answer = '年'; }
            else if (v.word === 'years') { v.def = '年份 (nián fèn)'; v.answer = '年份'; }
            else if (v.word === 'people') { v.def = '人们 (rén men)'; v.answer = '人们'; }
            else if (v.word === 'day') { v.def = '一天 (yì tiān)'; v.answer = '一天'; }
          }
        });
      }
    }

    return c.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('[Curriculum]', error);
    return c.json({ success: false, error: 'Failed to load curriculum.' }, 500);
  }
});

app.post('/curriculum/update', requireAuth, requireAdmin, async (c) => {
  try {
    const { curriculum } = await getDb();
    const { grade, content } = await c.req.json();
    if (!['1-2', '3-4', '5-6'].includes(grade) || !isPlainRecord(content)) {
      return c.json({ success: false, error: 'Invalid curriculum update.' }, 400);
    }
    await curriculum.updateOne({ grade }, { $set: { content } }, { upsert: true });
    return c.json({ success: true });
  } catch (error) {
    console.error('[Curriculum update]', error);
    return c.json({ success: false, error: 'Failed to update curriculum.' }, 500);
  }
});

// AI endpoints
app.post('/practice/generate', requireAuth, practiceRateLimit, async (c) => {
  const { grade } = await c.req.json();
  if (!['1-2', '3-4', '5-6'].includes(grade)) {
    return c.json({ success: false, error: 'Invalid grade.' }, 400);
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const { response } = await generateContentWithRetry(ai, {
      contents: `Generate 3 completely new English vocabulary words suitable for ${grade} grade. Return ONLY a valid JSON array of objects.`,
      config: { responseMimeType: "application/json" }
    });
    const cleanJsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return c.json({ success: true, data: JSON.parse(cleanJsonStr) });
  } catch (error) {
    console.error('[Practice generation]', error);
    return c.json({ success: false, error: 'Failed to generate practice.' }, 500);
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
      input = [body.studentAnswer, body.prompt].filter(value => typeof value === 'string').join('\n');
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

app.post('/writing/grade', optionalAuth, writingRateLimit, firewallLayer1, async (c) => {
  const { prompt, studentAnswer, grade } = await c.req.json();
  if (
    typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 600
    || typeof studentAnswer !== 'string' || studentAnswer.trim().length === 0 || studentAnswer.length > 2000
    || !['1-2', '3-4', '5-6'].includes(grade)
  ) {
    return c.json({ success: false, error: 'Please provide a valid writing response.' }, 400);
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemPrompt = `You are an encouraging but thorough English teacher evaluating a student's writing.
      Score out of 5 stars based on Grade ${grade || '1-2'} expectations.
      CRITICAL GRADING RULES:
      1. Exceptional, high-quality, well-structured writing with clear ideas and zero major grammar errors gets 4 or 5 stars.
      2. If there are multiple grammar/spelling mistakes, deduct stars (maximum score 3 or less).
      3. The answer MUST relate perfectly to the prompt and answer all parts of the prompt.
      4. Feedback MUST be detailed and informative, between 2 to 5 sentences per field.
      5. ALL Chinese translations (grammar_feedback_zh, content_feedback_zh, general_feedback_zh) MUST be in Simplified Chinese. DO NOT use Traditional Chinese.
      6. The student MUST write in English. If they write in Chinese or any other language, give 0 stars and explain in simple words.
      
      Return JSON: {"reasoning":"", "stars": 5, "grammar_feedback":"", "grammar_feedback_zh":"", "content_feedback":"", "content_feedback_zh":"", "general_feedback":"", "general_feedback_zh":""}`;
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
    const stars = isNaN(rawStars) ? 1 : Math.max(0, Math.min(5, Math.round(rawStars)));
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
      general: 'Keep practicing!',
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
const allowedAudioMimeTypes = new Set([
  'audio/webm', 'audio/mp4', 'audio/aac', 'audio/mpeg', 'audio/mp3',
  'audio/ogg', 'audio/wav', 'audio/x-wav'
]);

const normalizeAudioMimeType = (value) => typeof value === 'string'
  ? value.split(';')[0].trim().toLowerCase()
  : '';

const validateAudioInput = (base64Audio, requestedMimeType) => {
  if (typeof base64Audio !== 'string' || base64Audio.length === 0) {
    return { error: null, mimeType: normalizeAudioMimeType(requestedMimeType) || 'audio/webm' };
  }
  const mimeType = normalizeAudioMimeType(requestedMimeType);
  if (!allowedAudioMimeTypes.has(mimeType)) {
    return { error: 'Unsupported audio format.', mimeType };
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Audio)) {
    return { error: 'Invalid audio data.', mimeType };
  }
  const estimatedBytes = Math.floor((base64Audio.length * 3) / 4) - (base64Audio.endsWith('==') ? 2 : base64Audio.endsWith('=') ? 1 : 0);
  if (estimatedBytes <= 0 || estimatedBytes > MAX_AUDIO_BYTES) {
    return { error: 'Audio is too large. Please record a shorter answer.', mimeType };
  }
  return { error: null, mimeType };
};

async function parseAudioRequest(c) {
  const contentType = c.req.header('content-type') || '';

  if (contentType.includes('application/json')) {
    const parsedBody = await c.req.json();
    const body = isPlainRecord(parsedBody) ? parsedBody : {};
    const validation = validateAudioInput(body.audioBase64, body.mimeType || 'audio/webm');
    return {
      base64Audio: body.audioBase64 || null,
      mimeType: validation.mimeType,
      extras: body,
      error: validation.error,
    };
  }

  // Multipart form-data (legacy browser uploads)
  const formData = await c.req.parseBody();
  const file = formData['voiceRecord'];
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return { base64Audio: null, mimeType: null, extras: formData, error: null };
  }
  if (Number(file.size) > MAX_AUDIO_BYTES) {
    return { base64Audio: null, mimeType: normalizeAudioMimeType(file.type), extras: formData, error: 'Audio is too large. Please record a shorter answer.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_AUDIO_BYTES) {
    return { base64Audio: null, mimeType: normalizeAudioMimeType(file.type), extras: formData, error: 'Audio is too large. Please record a shorter answer.' };
  }
  const base64Audio = Buffer.from(arrayBuffer).toString('base64');
  const validation = validateAudioInput(base64Audio, file.type || 'audio/webm');
  return {
    base64Audio,
    mimeType: validation.mimeType,
    extras: formData,
    error: validation.error,
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
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      console.error('[STT] Deepgram request failed with status', response.status);
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
    console.error('[STT] Deepgram request failed.');
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
    console.error('[STT] Gemini transcription failed.');
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
app.post('/audio/stt', optionalAuth, audioRateLimit, async (c) => {
  try {
    const { base64Audio, mimeType, error: audioError } = await parseAudioRequest(c);
    if (audioError) return c.json({ success: false, error: audioError }, 400);
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
    return c.json({ success: false, error: 'Speech recognition is temporarily unavailable.' }, 500);
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
app.post('/audio/evaluate', optionalAuth, audioRateLimit, async (c) => {
  try {
    const { base64Audio, mimeType, extras, error: audioError } = await parseAudioRequest(c);
    if (audioError) return c.json({ success: false, error: audioError }, 400);
    const targetSentence = typeof extras.targetSentence === 'string' ? extras.targetSentence.trim() : '';

    if (!base64Audio || !targetSentence || targetSentence.length > 300) {
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
    return c.json({ success: false, error: 'Audio analysis is temporarily unavailable.' }, 500);
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
app.post('/audio/roleplay', requireAuth, audioRateLimit, async (c) => {
  try {
    const { base64Audio, mimeType, error: audioError } = await parseAudioRequest(c);
    if (audioError) return c.json({ success: false, error: audioError }, 400);
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
    } catch {
      console.error('[Roleplay TTS] failed.');
    }

    return c.json({ success: true, text: replyText, audioBase64, mimeType: audioMimeType });
  } catch (error) {
    console.error('[Roleplay]', error);
    return c.json({ success: false, error: 'Roleplay is temporarily unavailable.' }, 500);
  }
});


/**
 * GET /api/audio/tts
 *
 * Text-to-speech endpoint using Gemini Flash TTS.
 *
 * Accepts: { text }
 * Returns: { success, audioBase64, mimeType }
 */
app.get('/audio/tts', optionalAuth, ttsRateLimit, async (c) => {
  const text = c.req.query('text')?.trim();
  
  if (!text || text.length > MAX_TTS_TEXT_LENGTH || /[\u0000-\u001F\u007F]/.test(text)) {
    return c.json({ success: false, error: 'Please provide a short, valid text sample.' }, 400);
  }

  const ttsKey = process.env.TEXT_TO_SPEECH?.trim();
  if (!ttsKey) return c.json({ success: false, error: 'Speech audio is temporarily unavailable.' }, 503);

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
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000)
    });

    if (deepgramRes.ok) {
      audioBuffer = await deepgramRes.arrayBuffer();
      mimeType = deepgramRes.headers.get('content-type') || 'audio/mp3';
    } else {
     console.error(`Deepgram TTS failed: ${deepgramRes.status} ${deepgramRes.statusText}`);
      console.error('[TTS] Deepgram request failed with status', deepgramRes.status);
      return c.json({ success: false, error: 'Speech audio is temporarily unavailable.' }, 503);
    }
  } catch (error) {
    console.error('[TTS]', error);
    return c.json({ success: false, error: 'Speech audio is temporarily unavailable.' }, 500);
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
app.post('/audio/transcribe', optionalAuth, audioRateLimit, async (c) => {
  try {
    const { base64Audio, mimeType, error: audioError } = await parseAudioRequest(c);
    if (audioError) return c.json({ success: false, error: audioError }, 400);
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
    return c.json({ success: false, error: 'Speech recognition is temporarily unavailable.' }, 500);
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
