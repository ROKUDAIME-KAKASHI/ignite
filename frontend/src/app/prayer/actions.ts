"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function submitPrayer(content: string, isAnonymous: boolean, category: string) {
  const session = await getSession();
  
  await prisma.prayerRequest.create({
    data: {
      userId: session?.id || undefined, // Allow null if not fully logged in? Better to attach if possible
      content,
      isAnonymous,
      isApproved: false, // Must be approved by admin
    }
  });

  return { success: true };
}

export async function getApprovedPrayers() {
  const prayers = await prisma.prayerRequest.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  return prayers.map(p => ({
    id: p.id,
    text: p.content,
    author: p.isAnonymous ? "Anonymous" : (p.user ? `${p.user.firstName} ${p.user.lastName}` : "Anonymous"),
    anonymous: p.isAnonymous,
    prayers: p.prayCount,
    prayed: false,
    category: "General", // The db schema doesn't have category yet, but we can default to General
    time: p.createdAt.toISOString(),
  }));
}

export async function incrementPrayerCount(id: string) {
  await prisma.prayerRequest.update({
    where: { id },
    data: { prayCount: { increment: 1 } }
  });
  return { success: true };
}
