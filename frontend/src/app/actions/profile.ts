"use server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getProfileStats() {
  const session = await getSession();
  if (!session?.id) return { chapters: 0, badges: 0, streakDone: [false, false, false, false, false, false, false], badgeList: [] };

  const [chapters, badgeCount, user] = await Promise.all([
    prisma.xPLog.count({ where: { userId: session.id, reason: { contains: "Chapter" } } }),
    prisma.userBadge.count({ where: { userId: session.id } }),
    prisma.user.findUnique({ where: { id: session.id }, select: { xp: true, level: true, streak: true, church: true } })
  ]);

  let allBadges = await prisma.badge.findMany();
  if (allBadges.length === 0) {
    await prisma.badge.createMany({
      data: [
        { name: "First Steps", description: "Completed your first daily journey.", imageUrl: "🌟" },
        { name: "Gospel Reader", description: "Read a chapter from the Gospels.", imageUrl: "📖" },
        { name: "Faithful Steward", description: "Donated to the parish.", imageUrl: "🕊️" },
        { name: "Servant Heart", description: "Volunteered at an event.", imageUrl: "🤝" },
        { name: "Adorer", description: "5 Adoration sessions", imageUrl: "🕯️" },
        { name: "Lenten Warrior", description: "Completed Lent plan", imageUrl: "🌿" },
      ]
    });
    allBadges = await prisma.badge.findMany();
  }

  let userBadges = await prisma.userBadge.findMany({
    where: { userId: session.id },
    include: { badge: true }
  });

  if (userBadges.length === 0 && allBadges.length > 0) {
    await prisma.userBadge.create({
      data: {
        userId: session.id,
        badgeId: allBadges[0].id
      }
    });
    userBadges = await prisma.userBadge.findMany({
      where: { userId: session.id },
      include: { badge: true }
    });
  }

  const badgeList = userBadges.map(ub => ({
    emoji: ub.badge.imageUrl || "🏅",
    label: ub.badge.name,
    desc: ub.badge.description,
    color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30"
  }));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentLogs = await prisma.xPLog.findMany({
    where: { userId: session.id, awardedAt: { gte: sevenDaysAgo } },
    select: { awardedAt: true }
  });
  
  const streakDone = Array(7).fill(false);
  const now = new Date();
  recentLogs.forEach(log => {
    const diffDays = Math.floor((now.getTime() - log.awardedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      streakDone[6 - diffDays] = true;
    }
  });

  return { chapters, badges: badgeCount, streakDone, badgeList, user };
}

export async function joinParish(inviteCode: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  const church = await prisma.church.findUnique({
    where: { inviteCode }
  });

  if (!church) {
    return { success: false, error: "Invalid invite code" };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { churchId: church.id }
  });

  return { success: true, churchName: church.name };
}
