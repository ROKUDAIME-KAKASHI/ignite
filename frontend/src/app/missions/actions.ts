"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import { awardXP } from "@/app/actions/gamification";

export async function getMissions() {
  let missions = await prisma.mission.findMany();
  
  if (missions.length === 0) {
    await prisma.mission.createMany({
      data: [
        { title: "Corporal Work of Mercy", description: "Feed the hungry today. Share a meal, donate food, or volunteer at a soup kitchen. (Matthew 25:40)", xpReward: 50 },
        { title: "Holy Mass", description: "Attend Sunday Liturgy and participate fully in the Eucharist. (CCC 1324)", xpReward: 150 },
        { title: "Lectio Divina", description: "Spend 10 minutes in Sacred Reading — Read, Meditate, Pray, and Contemplate a passage. (Col 3:16)", xpReward: 30 },
        { title: "Pilgrimage of the Gospels", description: "Read chapters from all four Gospels — Matthew, Mark, Luke, and John.", xpReward: 500 },
      ]
    });
    missions = await prisma.mission.findMany();
  }

  const session = await getSession();
  const completedIds: string[] = [];
  if (session?.id) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const logs = await prisma.xPLog.findMany({
      where: { userId: session.id, awardedAt: { gte: today }, reason: { startsWith: "Completed Mission:" } }
    });
    logs.forEach(log => {
      const title = log.reason.replace("Completed Mission: ", "");
      const m = missions.find(x => x.title === title);
      if (m) completedIds.push(m.id);
    });
  }

  return { missions, completedIds };
}

export async function completeMission(missionId: string | number, xpReward: number, title: string) {
  const res = await awardXP(xpReward, `Completed Mission: ${title}`);
  return { success: res.success };
}
