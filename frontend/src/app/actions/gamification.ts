"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function awardXP(amount: number, reason: string) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Not authenticated" };

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        xp: { increment: amount },
        xpLogs: {
          create: {
            amount,
            reason,
          }
        }
      }
    });

    // Level up logic (every 500 XP = 1 level)
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: session.id },
        data: { level: newLevel }
      });
    }

    return { success: true, xp: user.xp, level: newLevel };
  } catch (error) {
    console.error(error);
    return { error: "Failed to award XP" };
  }
}
