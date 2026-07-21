"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/logger";

export async function awardXP(amount: number, reason: string) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Not authenticated" };

    if (reason.startsWith("Read Scripture:")) {
      const existing = await prisma.xPLog.findFirst({
        where: { userId: session.id, reason }
      });
      if (existing) {
        return { success: true, xp: 0, level: 0, message: "Already read" }; // Don't award again
      }
    }

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

    // Force Next.js to clear the cache so Dashboard and Profile update instantly
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    await logAudit(session.id, "EARNED_XP", { amount, reason, newLevel });

    return { success: true, xp: user.xp, level: newLevel };
  } catch (error) {
    console.error(error);
    return { error: "Failed to award XP" };
  }
}

export async function awardStars(amount: number, reason: string) {
  try {
    const session = await getSession();
    if (!session?.id) return { error: "Not authenticated" };

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        stars: { increment: amount },
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");

    await logAudit(session.id, "EARNED_STARS", { amount, reason });

    return { success: true, stars: user.stars };
  } catch (error) {
    console.error(error);
    return { error: "Failed to award Stars" };
  }
}
