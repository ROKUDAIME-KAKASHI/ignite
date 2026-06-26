"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      attendances: true
    }
  });

  return events.map(e => ({
    id: e.id,
    title: e.title,
    date: new Date(e.date).toLocaleDateString(),
    time: new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: e.location || "TBA",
    attendees: e.attendances.length,
    category: "General", // Placeholder as category isn't in DB
    description: e.description || "Join us for this parish event.",
  }));
}

export async function rsvpEvent(eventId: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not logged in" };

  // For RSVP, we'll just log an attendance record for now, or just return success
  // Realistically we'd need an RSVP model, but we'll use Attendance as RSVP
  const existing = await prisma.attendance.findFirst({
    where: { userId: session.id, eventId }
  });

  if (!existing) {
    await prisma.attendance.create({
      data: {
        userId: session.id,
        eventId,
      }
    });
  }

  return { success: true };
}
