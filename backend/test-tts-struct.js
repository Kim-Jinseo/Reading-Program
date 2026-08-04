import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testTTS() {
  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-2.5-flash-preview-tts',
      contents: 'Generate audio for: Hello, this is a test.',
      config: {
        responseModalities: ["AUDIO"],
      }
    });

    console.log(JSON.stringify(response.candidates[0].content.parts, null, 2));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
testTTS();
