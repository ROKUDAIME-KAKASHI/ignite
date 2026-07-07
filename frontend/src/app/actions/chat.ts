"use server";

import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function askAbba(prompt: string, history: {role: string, content: string}[]) {
  try {
    const session = await getSession();
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are "Abba", a spiritual guide and theological companion for Jacobite Orthodox Christian youth. You are integrated into the "Ignite" app.
Your goal is to answer questions about faith, theology, the Bible, and life from an Orthodox Christian perspective.
Always be warm, peaceful, concise, and deeply grounded in Scripture and Holy Tradition.
Address the user respectfully. If you don't know the answer, encourage them to ask their parish priest.
Do not use markdown formatting like **bold** or *italics* as the chat UI does not currently render markdown properly. Keep paragraphs short and easily readable.`;

    // Map history to the format expected by the Gemini API if necessary,
    // or just pass a combined string for simplicity.
    const conversation = history.map(h => `${h.role === 'user' ? 'User' : 'Abba'}: ${h.content}`).join("\n");
    
    const finalPrompt = `${systemPrompt}\n\nHere is the conversation so far:\n${conversation}\n\nUser: ${prompt}\nAbba:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
    });

    return { success: true, text: response.text };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { success: false, error: "Abba is currently resting. Please try again later." };
  }
}

export async function getPublicChatSuggestions() {
  const suggestions = await prisma.chatSuggestion.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
  return suggestions.map(s => s.text);
}
