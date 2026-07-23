import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function testValidation(title, reflection) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are validating a user's completion of a religious mission in a youth ministry app.
Mission Title: ${title.split(" - ")[0]}
User's Reflection: "${reflection}"

Evaluate if the reflection reasonably indicates they completed the mission or if it is just random spam/gibberish (like "asdf" or "test").
Respond strictly in JSON format with two fields:
{
  "valid": boolean, // true if it looks like a genuine attempt, false if spam/irrelevant
  "reason": string // A short, kind message explaining why it was accepted or rejected (max 1 sentence)
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["valid", "reason"],
        }
      }
    });
    
    console.log(`\n--- Test Case ---`);
    console.log(`Mission: ${title}`);
    console.log(`Reflection: "${reflection}"`);
    console.log(`AI Response:`, response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

async function runTests() {
  await testValidation("Corporal Work of Mercy", "I gave some food to a homeless person on my way to work today and prayed for them.");
  await testValidation("Lectio Divina", "I read the Bible.");
  await testValidation("Lectio Divina", "asdfasdf test test 123");
  await testValidation("Holy Mass", "I went to the mall with my friends and bought some new shoes.");
}

runTests();
