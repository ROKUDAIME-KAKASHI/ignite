"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function createAnnouncement(title: string, content: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.announcement.create({
    data: { title, content }
  });
  return { success: true };
}

export async function createEvent(title: string, description: string, dateStr: string, location: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(dateStr),
      location
    }
  });
  return { success: true, event };
}
