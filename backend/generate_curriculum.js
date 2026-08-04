import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GRADES = ['1-2', '3-4', '5-6'];
const VOCAB_COUNT = 200;
const GRAMMAR_RULES_COUNT = 30; // ~6-7 questions per rule = 200 questions
const SPEAKING_COUNT = 100;
const WRITING_COUNT = 50;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateChunk(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed: ${err.message}. Retrying...`);
      await delay(2000);
    }
  }
  throw new Error("Failed to generate chunk after retries.");
}

async function generateVocab(grade, startId) {
  let allVocab = [];
  const chunkSize = 50;
  for (let i = 0; i < VOCAB_COUNT / chunkSize; i++) {
    console.log(`Generating vocab chunk ${i + 1} for grade ${grade}...`);
    const prompt = `Generate a JSON array of ${chunkSize} English vocabulary words suitable for ${grade} grade students in China. Do not repeat words.
    Format:
    [
      { "id": ID, "dayIndex": DAY_INDEX, "word": "Word", "def": "中文 (pinyin)", "options": ["wrong1", "wrong2", "wrong3", "correct"], "answer": "correct" }
    ]
    Use starting ID ${startId + i * chunkSize}. DayIndex should be Math.floor((ID - 1) / 10).`;
    const chunk = await generateChunk(prompt);
    allVocab = allVocab.concat(chunk);
    await delay(1000);
  }
  return allVocab;
}

async function generateGrammar(grade, startId) {
  let allGrammar = [];
  const chunkSize = 10; // 10 rules per chunk
  for (let i = 0; i < GRAMMAR_RULES_COUNT / chunkSize; i++) {
    console.log(`Generating grammar chunk ${i + 1} for grade ${grade}...`);
    const prompt = `Generate a JSON array of ${chunkSize} English grammar rules suitable for ${grade} grade students in China. For each rule, generate 7 multiple-choice questions. Do not repeat rules.
    Format:
    [
      { 
        "id": ID, 
        "dayIndex": DAY_INDEX, 
        "rule": { "en": "Rule description in English", "zh": "规则描述（中文）" }, 
        "questions": [ { "q": "Question text with ___", "options": ["opt1", "opt2", "opt3"], "a": "correct option" } ] 
      }
    ]
    Use starting ID ${startId + i * chunkSize}. DayIndex should be Math.floor((ID - 1) / 2).`;
    const chunk = await generateChunk(prompt);
    allGrammar = allGrammar.concat(chunk);
    await delay(1000);
  }
  return allGrammar;
}

async function generateSpeaking(grade, startId) {
  let allSpeaking = [];
  const chunkSize = 25;
  for (let i = 0; i < SPEAKING_COUNT / chunkSize; i++) {
    console.log(`Generating speaking chunk ${i + 1} for grade ${grade}...`);
    const prompt = `Generate a JSON array of ${chunkSize} English speaking sentences suitable for ${grade} grade students in China. Do not repeat sentences.
    Format:
    [
      { "id": ID, "dayIndex": DAY_INDEX, "en": "English sentence.", "zh": "中文翻译。" }
    ]
    Use starting ID ${startId + i * chunkSize}. DayIndex should be Math.floor((ID - 1) / 5).`;
    const chunk = await generateChunk(prompt);
    allSpeaking = allSpeaking.concat(chunk);
    await delay(1000);
  }
  return allSpeaking;
}

async function generateWriting(grade, startId) {
  let allWriting = [];
  const chunkSize = 25;
  for (let i = 0; i < WRITING_COUNT / chunkSize; i++) {
    console.log(`Generating writing chunk ${i + 1} for grade ${grade}...`);
    const prompt = `Generate a JSON array of ${chunkSize} English writing prompts suitable for ${grade} grade students in China. Make the prompts EASY and accessible (e.g. daily life, favorites, simple imagination). Do NOT use complex topics like industrialization.
    Format:
    [
      { "id": ID, "dayIndex": DAY_INDEX, "en": "English prompt.", "zh": "中文提示。" }
    ]
    Use starting ID ${startId + i * chunkSize}. DayIndex should be Math.floor((ID - 1) / 2).`;
    const chunk = await generateChunk(prompt);
    allWriting = allWriting.concat(chunk);
    await delay(1000);
  }
  return allWriting;
}

async function main() {
  const db = {};
  let currentId = 1;

  for (const grade of GRADES) {
    console.log(`\n=== Generating Data for Grade ${grade} ===`);
    
    db[grade] = {
      vocab: [],
      grammar: [],
      speaking: [],
      writing: [],
      reading: [] // Leaving empty for now as reading usually requires longer passages
    };

    try {
      db[grade].vocab = await generateVocab(grade, currentId);
      currentId += VOCAB_COUNT;
      
      db[grade].grammar = await generateGrammar(grade, currentId);
      currentId += GRAMMAR_RULES_COUNT;
      
      db[grade].speaking = await generateSpeaking(grade, currentId);
      currentId += SPEAKING_COUNT;
      
      db[grade].writing = await generateWriting(grade, currentId);
      currentId += WRITING_COUNT;
      
      // Save progress per grade
      fs.writeFileSync('curriculum_wip.json', JSON.stringify(db, null, 2));
    } catch (e) {
      console.error(`Error generating grade ${grade}:`, e);
    }
  }

  fs.writeFileSync('curriculum.json', JSON.stringify(db, null, 2));
  console.log('Finished generating curriculum.json');
}

main().catch(console.error);
