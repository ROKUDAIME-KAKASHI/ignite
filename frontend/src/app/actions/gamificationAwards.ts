"use server";
import prisma from "@/lib/prisma";

export const AWARDS_CONFIG = [
  { id: "faithful_steward", title: "Faithful Steward", icon: "⛪", maxLevel: 8, tiers: [1, 4, 10, 20, 30, 40, 50, 52] },
  { id: "scripture_scholar", title: "Scripture Scholar", icon: "📖", maxLevel: 8, tiers: [1, 10, 50, 100, 250, 500, 800, 1189] },
  { id: "prayer_warrior", title: "Prayer Warrior", icon: "🙏", maxLevel: 8, tiers: [1, 5, 20, 50, 100, 200, 365, 500] },
  { id: "missionary_heart", title: "Missionary Heart", icon: "🕊️", maxLevel: 8, tiers: [1, 5, 10, 25, 50, 100, 200, 365] },
  { id: "wisdom_seeker", title: "Wisdom Seeker", icon: "💡", maxLevel: 8, tiers: [1, 5, 10, 25, 50, 100, 150, 200] },
  { id: "vessel_of_grace", title: "Vessel of Grace", icon: "✨", maxLevel: 8, tiers: [100, 500, 1000, 5000, 10000, 25000, 50000, 100000] },
  { id: "unbroken_devotion", title: "Unbroken Devotion", icon: "🔥", maxLevel: 8, tiers: [3, 7, 14, 30, 60, 100, 200, 365] },
  { id: "digital_disciple", title: "Digital Disciple", icon: "🎮", maxLevel: 8, tiers: [1, 5, 10, 25, 50, 100, 250, 500] },
  { id: "voice_of_faithful", title: "Voice of the Faithful", icon: "💬", maxLevel: 8, tiers: [1, 10, 50, 100, 250, 500, 1000, 2000] },
  { id: "liturgical_pilgrim", title: "Liturgical Pilgrim", icon: "🗓️", maxLevel: 8, tiers: [1, 2, 3, 4, 5, 6, 7, 8] },
];

export async function getUserAwardsProgress(userId: string) {
  if (!userId) return [];

  try {
    // Fetch stats sequentially to prevent connection pool exhaustion on serverless
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true, streak: true } });
    const attendances = await prisma.attendance.count({ where: { userId } });
    const scriptureLogs = await prisma.xPLog.findMany({ where: { userId, reason: { startsWith: "Read Scripture:" } }, select: { reason: true } });
    const prayerLogs = await prisma.xPLog.count({ where: { userId, reason: { contains: "prayer", mode: "insensitive" } } });
    const missionLogs = await prisma.xPLog.count({ where: { userId, reason: { contains: "mission", mode: "insensitive" } } });
    const quizzes = await prisma.quizAttempt.count({ where: { userId } });
    const gameLogs = await prisma.xPLog.count({ where: { userId, reason: { contains: "game", mode: "insensitive" } } });
    const journeyLogs = await prisma.userJourneyNode.count({ where: { userId, completedAt: { not: null } } });
    const chatLogs = await prisma.xPLog.count({ where: { userId, reason: { contains: "chat", mode: "insensitive" } } });

    const uniqueChapters = new Set(scriptureLogs.map(l => l.reason)).size;

    // Map progress values
    const progressMap: Record<string, number> = {
      faithful_steward: attendances,
      scripture_scholar: uniqueChapters,
      prayer_warrior: prayerLogs,
      missionary_heart: missionLogs,
      wisdom_seeker: quizzes,
      vessel_of_grace: user?.xp || 0,
      unbroken_devotion: user?.streak || 0,
      digital_disciple: gameLogs,
      voice_of_faithful: chatLogs,
      liturgical_pilgrim: journeyLogs // Using completed journey nodes as proxy for seasonal engagement for now
    };

    // Construct award array with level info
    return AWARDS_CONFIG.map(award => {
      const value = progressMap[award.id] || 0;
      let currentLevel = 0;
      
      for (let i = 0; i < award.tiers.length; i++) {
        if (value >= award.tiers[i]) {
          currentLevel = i + 1;
        } else {
          break;
        }
      }

      const nextTierValue = currentLevel < 8 ? award.tiers[currentLevel] : award.tiers[7];

      return {
        ...award,
        currentValue: value,
        currentLevel,
        nextTierValue,
        isMaxed: currentLevel === 8
      };
    });
  } catch (error: any) {
    console.error("Failed to load user gamification awards:", error);
    return { error: error.message || "Database error" } as any;
  }
}
