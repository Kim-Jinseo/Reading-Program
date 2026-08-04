import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const grades = ['1-2', '3-4', '5-6'];
const prompts = {
  '1-2': `You are an English curriculum designer for rural Chinese beginners (Grade 1-2). 
Create 3 grammar lessons. Use extremely simple vocabulary (cat, dog, apple, book).
Topics: 
1. "a" vs "an"
2. Pronouns (I, You, He, She, It)
3. Simple Plurals (adding -s).`,

  '3-4': `You are an English curriculum designer for rural Chinese beginners (Grade 3-4). 
Create 3 grammar lessons. Keep vocabulary accessible.
Topics: 
1. Prepositions of Location (in, on, under, next to)
2. Be verb (am, is, are)
3. Simple Present verbs (like, likes, play, plays)`,

  '5-6': `You are an English curriculum designer for rural Chinese beginners (Grade 5-6). 
Create 3 grammar lessons. 
Topics: 
1. Present Continuous (am/is/are + -ing)
2. Comparative Adjectives (bigger, smaller, faster)
3. Simple Past Tense (was, were, walked)`
};

const generateGrammar = async () => {
  const curriculum = JSON.parse(fs.readFileSync('curriculum.json', 'utf8'));
  let nextId = 200;

  for (const grade of grades) {
    console.log(`Generating grammar for ${grade}...`);
    const prompt = `${prompts[grade]}
    
For each lesson, generate EXACTLY 6 questions. 
Assign difficulty correctly: 2 easy questions (difficulty: 1), 2 medium questions (difficulty: 2), and 2 hard questions (difficulty: 3).

Return ONLY a valid JSON array of lesson objects. Do not include markdown formatting.
Schema:
[
  {
    "title": { "en": "English Title", "zh": "Chinese Title" },
    "desc": { "en": "A welcoming, concise 1-sentence description.", "zh": "Chinese welcoming description." },
    "rule": { "en": "The grammar rule.", "zh": "Chinese translation of rule." },
    "questions": [
      {
        "q": "The question sentence with a blank ___.",
        "options": ["opt1", "opt2", "opt3"],
        "a": "the correct option exactly as it appears in options",
        "difficulty": 1 
      }
    ]
  }
]
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const cleanJsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const lessons = JSON.parse(cleanJsonStr);
      
      const processedLessons = lessons.map(lesson => {
        nextId++;
        return {
          id: nextId,
          dayIndex: 100, // standard placeholder for grammar
          ...lesson
        };
      });

      curriculum[grade].grammar = processedLessons;
      console.log(`Successfully generated and applied ${grade}`);
    } catch (error) {
      console.error(`Failed to generate ${grade}:`, error);
    }
  }

  fs.writeFileSync('curriculum.json', JSON.stringify(curriculum, null, 2));
  console.log("Updated curriculum.json!");
};

generateGrammar();
