"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      attendances: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    // Keep the full ISO date for rawDate logic in client
    date: new Date(e.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: e.location || "TBA",
    attendees: e.attendances.length,
    category: "General",
    description: e.description || "Join us for this parish event.",
    // Return the ISO string so client can compare with today for Upcoming/Past tabs
    isoDate: e.date.toISOString(),
  }));
}

export async function rsvpEvent(eventId: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not logged in" };

  const existing = await prisma.attendance.findFirst({
    where: { userId: session.id, eventId },
  });

  if (!existing) {
    await prisma.attendance.create({
      data: {
        userId: session.id,
        eventId,
      },
    });

    // Award XP for RSVP-ing an event
    await prisma.user.update({
      where: { id: session.id },
      data: { xp: { increment: 20 } },
    });
    await prisma.xPLog.create({
      data: {
        userId: session.id,
        amount: 20,
        reason: "RSVP'd for a parish event",
      },
    });
  }

  return { success: true };
}
