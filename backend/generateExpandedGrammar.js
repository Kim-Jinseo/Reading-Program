import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const grades = {
  '1-2': [
    { title: "A vs An", zh: "A 和 An 的用法", rule: "Use 'a' before consonants and 'an' before vowels." },
    { title: "Pronouns", zh: "代词", rule: "Use I, You, He, She, It, We, They correctly." },
    { title: "Simple Plurals", zh: "简单的复数", rule: "Add -s to make most nouns plural." },
    { title: "Be Verb", zh: "Be 动词", rule: "Use am, is, and are correctly." },
    { title: "Demonstratives", zh: "指示代词", rule: "Use this, that, these, those." },
    { title: "Possessive Adjectives", zh: "物主代词", rule: "Use my, your, his, her, its, our, their." },
    { title: "Adjectives", zh: "形容词", rule: "Use simple colors and sizes to describe nouns." },
    { title: "Action Verbs", zh: "行为动词", rule: "Basic action verbs like run, jump, play, eat." },
    { title: "Prepositions of Location", zh: "方位介词", rule: "Use in, on, under correctly." },
    { title: "Question Words", zh: "疑问词", rule: "Use What, Who, Where." }
  ],
  '3-4': [
    { title: "Simple Present Tense", zh: "一般现在时", rule: "Talk about daily habits and routines." },
    { title: "Present Continuous Tense", zh: "现在进行时", rule: "Talk about actions happening right now (-ing)." },
    { title: "Irregular Plurals", zh: "不规则复数", rule: "Nouns that change spelling (men, children, mice)." },
    { title: "Possessive 's", zh: "名词所有格", rule: "Show ownership with 's (John's book)." },
    { title: "Adverbs of Frequency", zh: "频度副词", rule: "Use always, usually, sometimes, never." },
    { title: "Simple Past Tense (Regular)", zh: "一般过去时 (规则)", rule: "Add -ed to talk about the past." },
    { title: "Simple Past Tense (Irregular)", zh: "一般过去时 (不规则)", rule: "Common irregular past verbs (went, saw, had)." },
    { title: "Quantifiers", zh: "量词", rule: "Countable vs Uncountable (some, any, much, many)." },
    { title: "Conjunctions", zh: "连词", rule: "Connecting ideas (and, but, or, because)." },
    { title: "Modal Verbs", zh: "情态动词", rule: "Expressing ability and obligation (can, must, should)." }
  ],
  '5-6': [
    { title: "Comparative Adjectives", zh: "比较级形容词", rule: "Comparing two things (bigger, more beautiful)." },
    { title: "Superlative Adjectives", zh: "最高级形容词", rule: "Comparing three or more things (biggest, most beautiful)." },
    { title: "Future Tense", zh: "将来时", rule: "Talking about the future (will vs going to)." },
    { title: "Past Continuous Tense", zh: "过去进行时", rule: "Actions that were happening in the past (was/were -ing)." },
    { title: "Adverbs of Manner", zh: "方式副词", rule: "Describing how an action is done (quickly, happily)." },
    { title: "Prepositions of Time", zh: "时间介词", rule: "Using at, in, and on for times and dates." },
    { title: "Relative Clauses", zh: "定语从句", rule: "Adding information using who, which, that." },
    { title: "First Conditional", zh: "第一条件句", rule: "Talking about possibilities (If it rains, I will...)." },
    { title: "Present Perfect Tense", zh: "现在完成时", rule: "Experiences and recent past (have/has + past participle)." },
    { title: "Passive Voice", zh: "被动语态", rule: "Focus on the action (is made, was built)." }
  ]
};

const generateGrammar = async () => {
  const curriculum = JSON.parse(fs.readFileSync('curriculum.json', 'utf8'));
  let idCounter = 1000;

  for (const grade of Object.keys(grades)) {
    const concepts = grades[grade];
    const generatedLessons = [];
    
    for (const concept of concepts) {
      console.log(`Generating: [${grade}] ${concept.title}...`);
      
      const prompt = `
You are an expert English curriculum designer for rural Chinese beginners.
Generate a Grammar Lesson for the topic: "${concept.title}".
Rule: "${concept.rule}"
Target Grade: ${grade}. (Keep vocabulary highly accessible for rural Chinese students of this grade level).

You must generate exactly 1 lesson object.
The lesson must contain EXACTLY 20 questions.
Distribute the difficulty of the 20 questions as follows:
- 7 easy questions (difficulty: 1)
- 7 medium questions (difficulty: 2)
- 6 hard questions (difficulty: 3)

Return ONLY a valid JSON object. Do not include markdown formatting or backticks.
Schema:
{
  "title": { "en": "${concept.title}", "zh": "${concept.zh}" },
  "desc": { "en": "A welcoming, concise 1-sentence description.", "zh": "Chinese welcoming description." },
  "rule": { "en": "${concept.rule}", "zh": "Chinese translation of rule." },
  "questions": [
    {
      "q": "The question sentence with a blank ___.",
      "options": ["opt1", "opt2", "opt3"],
      "a": "the correct option exactly as it appears in options",
      "difficulty": 1 
    }
  ]
}
      `;

      let retries = 3;
      let success = false;
      while (retries > 0 && !success) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          
          let cleanJsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          let lessonObj = JSON.parse(cleanJsonStr);
          
          // Verify we have 20 questions
          if (!lessonObj.questions || lessonObj.questions.length < 15) {
             throw new Error("Generated too few questions: " + (lessonObj.questions?.length || 0));
          }
          
          idCounter++;
          lessonObj.id = idCounter;
          lessonObj.dayIndex = 100;
          
          generatedLessons.push(lessonObj);
          success = true;
          console.log(`Success! Total questions: ${lessonObj.questions.length}`);
          
          // Wait to respect rate limits
          await wait(8000); 

        } catch (error) {
          retries--;
          console.error(`Failed ${concept.title}. Retries left: ${retries}. Error:`, error.message);
          await wait(15000); // Backoff on error
        }
      }
      
      if (!success) {
        console.error(`CRITICAL FAILURE on ${concept.title}. Skipping to next.`);
      }
    }
    
    curriculum[grade].grammar = generatedLessons;
  }

  fs.writeFileSync('curriculum.json', JSON.stringify(curriculum, null, 2));
  console.log("Successfully generated all concepts! Wrote to curriculum.json.");
};

generateGrammar();
