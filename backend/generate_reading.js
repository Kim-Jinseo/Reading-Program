import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GRADES = ['1-2', '3-4', '5-6'];
const READING_COUNT = 20;

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

async function generateReading(grade, startId) {
  let allReading = [];
  const tiers = [
    { name: 'easy', qCount: 4 },
    { name: 'medium', qCount: 5 },
    { name: 'hard', qCount: 6 },
    { name: 'super_hard', qCount: 7 }
  ];
  const chunkSize = 5; // 4 tiers * 5 = 20 stories

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    console.log(`Generating ${tier.name} reading chunk for grade ${grade}...`);
    const prompt = `Generate a JSON array of ${chunkSize} English reading comprehension stories suitable for ${grade} grade students in China. The stories should be engaging, age-appropriate, and use simple language.
    This chunk should be of difficulty level: ${tier.name.toUpperCase()}.
    For each story, generate ${tier.qCount} multiple-choice questions. The text and vocabulary should reflect the difficulty level.
    Format:
    [
      { 
        "id": ID, 
        "difficulty": "${tier.name}",
        "dayIndex": DAY_INDEX, 
        "title": { "en": "Story Title", "zh": "中文标题" }, 
        "text": { "en": "The full story in English...", "zh": "完整的中文翻译..." },
        "questions": [ 
          { "q": "Question text", "options": ["opt1", "opt2", "opt3"], "a": "correct option" } 
        ] 
      }
    ]
    Use starting ID ${startId + i * chunkSize}. DayIndex should be Math.floor((ID - 1) / 2).`;
    const chunk = await generateChunk(prompt);
    allReading = allReading.concat(chunk);
    await delay(1000);
  }
  return allReading;
}

async function main() {
  const dbPath = 'curriculum.json';
  if (!fs.existsSync(dbPath)) {
    console.error("curriculum.json not found!");
    return;
  }
  
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let currentId = 1000; // start reading IDs higher to avoid any conflicts

  for (const grade of GRADES) {
    console.log(`\n=== Generating Reading Data for Grade ${grade} ===`);
    try {
      db[grade].reading = await generateReading(grade, currentId);
      currentId += READING_COUNT;
      // Save progress per grade
      fs.writeFileSync('curriculum_wip.json', JSON.stringify(db, null, 2));
    } catch (e) {
      console.error(`Error generating grade ${grade}:`, e);
    }
  }

  fs.writeFileSync('curriculum.json', JSON.stringify(db, null, 2));
  console.log('Finished generating reading data to curriculum.json');
}

main().catch(console.error);
