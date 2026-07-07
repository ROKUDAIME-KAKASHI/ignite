"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";

export async function validateEvent(eventId: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { error: "Not logged in" };

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: "Event not found" };

    const existing = await prisma.attendance.findFirst({
      where: { userId: session.id, eventId }
    });
    if (existing) return { error: "Already checked in" };

    return { success: true, eventTitle: event.title, eventId: event.id };
  } catch (error) {
    return { error: "Invalid QR code" };
  }
}

export async function checkInToEvent(eventId: string, reflectionText: string) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { error: "You must be logged in to check in." };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return { error: "Event not found or has ended." };
    }

    // Check if already checked in
    const existing = await prisma.attendance.findFirst({
      where: { userId: session.id, eventId }
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
