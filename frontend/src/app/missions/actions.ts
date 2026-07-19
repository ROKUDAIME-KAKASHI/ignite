"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";
import { GoogleGenAI, Type } from "@google/genai";

export async function getMissions() {
  let missions = await prisma.mission.findMany();
  
  if (missions.length === 0) {
    await prisma.mission.createMany({
      data: [
        { title: "Corporal Work of Mercy", description: "Feed the hungry today. Share a meal, donate food, or volunteer at a soup kitchen. (Matthew 25:40)", xpReward: 50 },
        { title: "Holy Mass", description: "Attend Sunday Liturgy and participate fully in the Eucharist. (CCC 1324)", xpReward: 150 },
        { title: "Lectio Divina", description: "Spend 10 minutes in Sacred Reading — Read, Meditate, Pray, and Contemplate a passage. (Col 3:16)", xpReward: 30 },
        { title: "Pilgrimage of the Gospels", description: "Read chapters from all four Gospels — Matthew, Mark, Luke, and John.", xpReward: 500 },
      ]
    });
    missions = await prisma.mission.findMany();
  }

  const session = await getSession();
  const completedIds: string[] = [];
  if (session?.id) {
    // Robust calendar-day check covering all global timezone offsets
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const lookbackLimit = new Date(today.getTime() - 12 * 60 * 60 * 1000); // 12h overlap to catch early morning timezones
    
    const logs = await prisma.xPLog.findMany({
      where: { userId: session.id, awardedAt: { gte: lookbackLimit }, reason: { startsWith: "Completed Mission:" } }
    });
    logs.forEach(log => {
      const title = log.reason.replace("Completed Mission: ", "");
      const m = missions.find(x => title.startsWith(x.title));
      if (m && !completedIds.includes(m.id)) completedIds.push(m.id);
    });
  }

  return { missions, completedIds };
}

export async function completeMission(missionId: string | number, xpReward: number, title: string, reflection?: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  const today = new Date();
  today.setUTCHours(0,0,0,0);
  const lookbackLimit = new Date(today.getTime() - 12 * 60 * 60 * 1000);
  
  const existing = await prisma.xPLog.findFirst({
    where: {
      userId: session.id,
      awardedAt: { gte: lookbackLimit },
      reason: `Completed Mission: ${title}`
    }
  });

  if (existing) {
    return { success: false, error: "Mission already completed today." };
  }
  if (reflection) {
    try {
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
      
      const result = JSON.parse(response.text || "{}");
      if (result.valid === false) {
        return { success: false, error: result.reason || "Your reflection was not accepted. Please provide a genuine response." };
      }
    } catch (e) {
      console.error("AI Verification failed, allowing fallback", e);
      // If AI fails for some reason (rate limit, etc), allow it through rather than blocking the user
    }
  }

  const res = await awardXP(xpReward, `Completed Mission: ${title}`);
  return { success: res.success };
}
