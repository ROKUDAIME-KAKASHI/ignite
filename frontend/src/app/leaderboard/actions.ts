"use server";

import prisma from "@/lib/prisma";

export async function getLeaderboardUsers() {
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

export async function getParishLeaderboard() {
  const churches = await prisma.church.findMany({
    include: {
      users: {
        select: { xp: true }
      }
    }
  });

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
