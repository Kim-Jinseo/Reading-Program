import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function testSchema() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Give me JSON',
      config: {
        responseMimeType: "application/json"
      }
    });
    console.log("Success!");
  } catch(e) {
    console.error("Error:", e);
  }
}
testSchema();
