"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";

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
      
      // Queue for batch AI verification (Option 1)
      await prisma.pendingValidation.create({
         data: {
            userId: session.id,
            eventId: mission.id,
            isMission: true,
            reflection: reflectionText,
            eventTitle: mission.title,
            xpAmount: mission.xpReward
         }
      });

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

    // Queue for batch AI verification
    await prisma.pendingValidation.create({
      data: {
        userId: session.id,
        eventId: event.id,
        isMission: false,
        reflection: reflectionText,
        eventTitle: event.title,
        xpAmount: 150
      }
    });

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
