import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export const maxDuration = 300; // Allows cron job to run longer on Vercel

export async function GET(req: Request) {
  try {
    // 1. Fetch up to 100 pending validations to avoid payload size issues
    const pending = await prisma.pendingValidation.findMany({
      where: { status: "PENDING" },
      take: 100
    });

    if (pending.length === 0) {
      return NextResponse.json({ message: "No pending validations." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY." }, { status: 500 });
    }

    // 2. Format a massive prompt for Batch checking
    const listString = pending.map((p, index) => `[ID: ${p.id}] Event: ${p.eventTitle} | Note: ${p.reflection}`).join("\n");
    
    const prompt = `You are a strict spam and gibberish detector for a church application. 
Users check in to events and leave personal reflections/notes. We need to detect random typos, spam, completely irrelevant notes (like "test", "asdfgh", "good food"), and repetitive gibberish.
If the note looks like a genuine attempt at a reflection, summary, or thought, it is valid. 
If it is clearly gibberish, spam, or random keys, it is invalid.

Analyze the following list of check-ins. Return a raw JSON array containing ONLY the IDs of the notes that are CLEARLY SPAM OR GIBBERISH. Do NOT include IDs of valid notes. 
If all notes are valid, return an empty array [].
Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Just output the raw JSON array of strings.

Here is the list:
${listString}`;

    // 3. Make exactly ONE call to Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let spamIds: string[] = [];
    try {
      const text = response.text?.trim() || "[]";
      // Remove any accidental markdown wrapping
      const cleaned = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      spamIds = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response", response.text);
      return NextResponse.json({ error: "AI response parse failed" }, { status: 500 });
    }

    // 4. Process the results
    const spamValidations = pending.filter(p => spamIds.includes(p.id));
    const validValidations = pending.filter(p => !spamIds.includes(p.id));

    // Update statuses
    if (validValidations.length > 0) {
      await prisma.pendingValidation.updateMany({
        where: { id: { in: validValidations.map(p => p.id) } },
        data: { status: "APPROVED" }
      });
    }

    // 5. Revoke points for spam
    for (const p of spamValidations) {
      // Mark as rejected
      await prisma.pendingValidation.update({
        where: { id: p.id },
        data: { status: "REJECTED" }
      });

      const reasonPrefix = p.isMission ? `Completed Mission: ${p.eventTitle}` : `Event Check-In & Notes: ${p.eventTitle}`;
      
      const xpLog = await prisma.xPLog.findFirst({
         where: { userId: p.userId, reason: { startsWith: reasonPrefix } },
         orderBy: { awardedAt: 'desc' }
      });
      
      if (xpLog) {
         // Revert XP
         await prisma.user.update({
            where: { id: p.userId },
            data: { xp: { decrement: xpLog.amount } }
         });
         await prisma.xPLog.delete({ where: { id: xpLog.id } });
      }

      if (!p.isMission) {
         // Delete attendance
         await prisma.attendance.deleteMany({
            where: { userId: p.userId, eventId: p.eventId }
         });
      }

      // Notify the user
      await prisma.notification.create({
         data: {
            userId: p.userId,
            title: "Check-in Rejected",
            message: `Your check-in note for "${p.eventTitle}" was flagged as invalid/spam by our automated system. The ${p.xpAmount} Grace Points have been revoked. Please write genuine reflections!`
         }
      });
    }

    return NextResponse.json({
      processed: pending.length,
      spamDetected: spamValidations.length,
      approved: validValidations.length
    });

  } catch (error: any) {
    console.error("Cron Job Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
