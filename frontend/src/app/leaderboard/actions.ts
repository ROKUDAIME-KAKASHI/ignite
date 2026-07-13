"use server";

import prisma from "@/lib/prisma";

export async function getLeaderboardUsers(timeframe: "all-time" | "weekly" | "seasonal" = "all-time") {
  if (timeframe === "all-time") {
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 50,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        xp: true,
        level: true,
        avatarUrl: true
      }
    });

    return users.map((u, i) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      rank: i + 1,
      xp: u.xp,
      level: u.level,
      initials: `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase()
    }));
  }

  // Calculate start date based on timeframe
  const now = new Date();
  let startDate = new Date(0);
  if (timeframe === "weekly") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === "seasonal") {
    // Current season: Great Lent (example dates)
    // In a real app, you would query your Season table or use your liturgy logic
    startDate = new Date(now.getFullYear(), 1, 15); // Roughly mid-Feb
  }

  const grouped = await prisma.xPLog.groupBy({
    by: ['userId'],
    _sum: { amount: true },
    where: { awardedAt: { gte: startDate } },
    orderBy: { _sum: { amount: 'desc' } },
    take: 50,
  });

  const userIds = grouped.map(g => g.userId);
  const usersData = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, level: true, avatarUrl: true }
  });

  const userMap = new Map(usersData.map(u => [u.id, u]));

  return grouped
    .filter(g => userMap.has(g.userId))
    .map((g, i) => {
      const u = userMap.get(g.userId)!;
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        rank: i + 1,
        xp: g._sum.amount || 0,
        level: u.level,
        initials: `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase()
      };
    });
}

export async function getParishLeaderboard(timeframe: "all-time" | "weekly" | "seasonal" = "all-time") {
  const churches = await prisma.church.findMany({
    include: {
      users: {
        select: { 
          id: true,
          xp: true 
        }
      }
    }
  });

  if (timeframe === "all-time") {
    const parishStandings = churches.map(church => ({
      id: church.id,
      name: church.name,
      xp: church.users.reduce((sum, u) => sum + u.xp, 0)
    })).sort((a, b) => b.xp - a.xp).map((church, index) => ({
      ...church,
      rank: index + 1,
      initials: church.name.substring(0, 2).toUpperCase()
    }));
    return parishStandings;
  }

  // Calculate start date based on timeframe
  const now = new Date();
  let startDate = new Date(0);
  if (timeframe === "weekly") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay()); 
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === "seasonal") {
    startDate = new Date(now.getFullYear(), 1, 15);
  }

  // Find XP for all users in timeframe
  const userXP = await prisma.xPLog.groupBy({
    by: ['userId'],
    _sum: { amount: true },
    where: { awardedAt: { gte: startDate } }
  });
  const userXPMap = new Map(userXP.map(x => [x.userId, x._sum.amount || 0]));

  const parishStandings = churches.map(church => ({
    id: church.id,
    name: church.name,
    xp: church.users.reduce((sum, u) => sum + (userXPMap.get(u.id) || 0), 0)
  })).sort((a, b) => b.xp - a.xp).map((church, index) => ({
    ...church,
    rank: index + 1,
    initials: church.name.substring(0, 2).toUpperCase()
  }));

  return parishStandings;
}
