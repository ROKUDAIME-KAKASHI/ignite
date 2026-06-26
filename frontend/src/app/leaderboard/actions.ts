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
