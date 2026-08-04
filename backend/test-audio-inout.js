import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testAudioInOut() {
  try {
    const dummyAudio = Buffer.from('UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', 'base64'); // tiny valid wav

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: "Listen to this audio and reply with audio saying 'hello'." },
        { inlineData: { data: dummyAudio.toString('base64'), mimeType: 'audio/wav' } }
      ],
      config: {
        responseModalities: ["AUDIO", "TEXT"]
      }
    });

    console.log("Success with gemini-2.5-flash!");
    console.log(response.text);
  } catch(e) {
    console.error("Error with gemini-2.5-flash:", e.message);
  }
}
testAudioInOut();
