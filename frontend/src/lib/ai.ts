import { GoogleGenAI } from "@google/genai";

export function getAIClient() {
  // Support either a single key or a comma-separated list of keys for rotation
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  
  if (!keysString) {
    return new GoogleGenAI({ apiKey: "dummy" });
  }
  
  const keys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);
  
  // Pick a random key from the array
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  
  return new GoogleGenAI({ apiKey: randomKey });
}
