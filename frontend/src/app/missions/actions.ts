"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function completeMission(missionId: string | number, xpReward: number, title: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not logged in" };

  // In a real app we'd verify the mission wasn't already completed today,
  // and we'd probably use a DailyJourney or Mission model.
  // For now, let's just log the XP.
  
  await prisma.user.update({
    where: { id: session.id },
    data: { xp: { increment: xpReward } }
  });

  await prisma.xPLog.create({
    data: {
      userId: session.id,
      amount: xpReward,
      reason: `Completed Mission: ${title}`
    }
  });

  return { success: true };
}
