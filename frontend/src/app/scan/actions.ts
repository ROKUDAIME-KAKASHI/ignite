"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";

export async function checkInToEvent(eventId: string) {
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
        eventId: event.id
      }
    });

    // Award XP
    const res = await awardXP(100, `Event Check-In: ${event.title}`);

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
