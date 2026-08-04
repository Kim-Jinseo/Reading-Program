import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    for await (const model of models) {
        if (model.name.includes('tts') || model.name.includes('audio')) {
            console.log(model.name, " - Supported methods:", model.supportedGenerationMethods);
        }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
