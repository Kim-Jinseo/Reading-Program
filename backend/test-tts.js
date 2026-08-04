import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testTTS() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Generate audio for the following text: Hello, this is a test of the text to speech capabilities.',
      config: {
          responseModalities: ["AUDIO"],
      }
    });
    
    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      console.log("Parts array length:", response.candidates[0].content.parts.length);
      const audioPart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (audioPart) {
          console.log("Found audio inline data!");
          console.log("MimeType:", audioPart.inlineData.mimeType);
          console.log("Data length:", audioPart.inlineData.data.length);
      } else {
          console.log("No audio inline data found in parts:", response.candidates[0].content.parts);
      }
    } else {
        console.log("No content returned:", response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testTTS();
