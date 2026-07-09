"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

async function verifyWithAI(userId: string, eventId: string, reflection: string, eventTitle: string, isMission: boolean) {
  try {
    if (!process.env.GEMINI_API_KEY) return; // Skip if no key

    const prompt = `You are a strict validator for a church app. A user checked into ${isMission ? 'the mission' : 'the event'} "${eventTitle}" and left this reflection/note:
"${reflection}"
Your job is to determine if this is a genuine note/reflection, or if it is spam/gibberish (like "asdf", "hello world", "good very good", "test test test").
If it is a genuine, thoughtful note related to the event, faith, or personal growth, reply with exactly "YES".
If it is spam, gibberish, or completely irrelevant, reply with exactly "NO".
Do not output any other text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const answer = response.text?.trim().toUpperCase();
    if (answer?.includes("NO")) {
      // It's spam! Revoke points.
      const reasonPrefix = isMission ? `Completed Mission: ${eventTitle}` : `Event Check-In & Notes: ${eventTitle}`;
      
      const xpLog = await prisma.xPLog.findFirst({
         where: { userId, reason: { startsWith: reasonPrefix } },
         orderBy: { awardedAt: 'desc' }
      });
      
      if (xpLog) {
         await prisma.user.update({
            where: { id: userId },
            data: { xp: { decrement: xpLog.amount } }
         });
         await prisma.xPLog.delete({ where: { id: xpLog.id } });
      }

      if (!isMission) {
         await prisma.attendance.deleteMany({
            where: { userId, eventId }
         });
      }

      await prisma.notification.create({
         data: {
            userId,
            title: "Check-in Rejected",
            message: `Your check-in note for "${eventTitle}" was flagged as invalid by our automated system. The Grace Points have been revoked. Please write genuine reflections!`
         }
      });
    }
  } catch (error) {
    console.error("AI Verification failed", error);
  }
}

export async function validateEvent(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { error: "Not logged in" };

    // Check if it's an event
    const event = await prisma.event.findUnique({ where: { id: id } });
    if (event) {
      const existing = await prisma.attendance.findFirst({
        where: { userId: session.id, eventId: id }
      });
      if (existing) return { error: "Already checked in" };
      return { success: true, eventTitle: event.title, eventId: event.id, type: "event" as const };
    }

    // Check if it's a mission
    const mission = await prisma.mission.findUnique({ where: { id: id } });
    if (mission) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const existing = await prisma.xPLog.findFirst({
        where: { userId: session.id, awardedAt: { gte: today }, reason: `Completed Mission: ${mission.title}` }
      });
      if (existing) return { error: "Mission already completed today" };
      return { success: true, eventTitle: mission.title, eventId: mission.id, type: "mission" as const };
    }

    return { error: "Event or Mission not found" };
  } catch (error) {
    return { error: "Invalid QR code" };
  }
}

export async function checkInToEvent(id: string, reflectionText: string, type: "event" | "mission" = "event") {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { error: "You must be logged in." };
    }

    const words = reflectionText.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3 || reflectionText.trim().length < 10) {
      return { error: "Please provide a more detailed reflection (at least 3 words)." };
    }
    const hasLongGibberish = words.some(w => w.length > 25);
    if (hasLongGibberish) {
      return { error: "Please write a genuine reflection." };
    }

    if (type === "mission") {
      const mission = await prisma.mission.findUnique({ where: { id } });
      if (!mission) return { error: "Mission not found." };
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const existing = await prisma.xPLog.findFirst({
        where: { userId: session.id, awardedAt: { gte: today }, reason: `Completed Mission: ${mission.title}` }
      });
      if (existing) return { error: "Mission already completed today!" };

      const res = await awardXP(mission.xpReward, `Completed Mission: ${mission.title}`);
      
      // Fire and forget AI verification (Problem 2 Option A)
      verifyWithAI(session.id, mission.id, reflectionText, mission.title, true).catch(console.error);

      return {
        success: true,
        eventTitle: mission.title,
        xp: res.xp,
        level: res.level
      };
    }

    // Event logic
    const event = await prisma.event.findUnique({
      where: { id: id }
    });

    if (!event) {
      return { error: "Event not found or has ended." };
    }

    // Check if already checked in
    const existing = await prisma.attendance.findFirst({
      where: { userId: session.id, eventId: id }
    });

    if (existing) {
      return { error: "You have already checked in to this event!" };
    }

    // Record attendance
    await prisma.attendance.create({
      data: {
        userId: session.id,
        eventId: event.id,
        reflection: reflectionText,
      }
    });

    // Award XP
    const shortReflect = reflectionText.substring(0, 30) + (reflectionText.length > 30 ? "..." : "");
    const res = await awardXP(150, `Event Check-In & Notes: ${event.title} - "${shortReflect}"`);

    // Fire and forget AI verification (Problem 2 Option A)
    verifyWithAI(session.id, event.id, reflectionText, event.title, false).catch(console.error);

    return { 
      success: true, 
      eventTitle: event.title,
      xp: res.xp,
      level: res.level
    };
  } catch (error) {
    console.error("Check-in error:", error);
    return { error: "Failed to check in. Please try again." };
  }
}
