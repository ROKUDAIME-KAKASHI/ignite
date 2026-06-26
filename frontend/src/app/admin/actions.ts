"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function adminLogin(email: string, pass: string) {
  if (email === "adminofignite@gmail.com" && pass === "adminofignite123") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "super_admin_verified", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    return { success: true };
  }
  return { error: "Invalid admin credentials" };
}

export async function createAnnouncement(title: string, content: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token !== "super_admin_verified") {
    return { error: "Unauthorized" };
  }

  await prisma.announcement.create({
    data: { title, content }
  });
  return { success: true };
}

export async function createEvent(title: string, description: string, dateStr: string, location: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token !== "super_admin_verified") {
    return { error: "Unauthorized" };
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(dateStr),
      location
    }
  });
  return { success: true, event };
}

export async function getAdminDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token !== "super_admin_verified") {
    return { error: "Unauthorized" };
  }

  const [totalUsers, prayersOffered, quizzesTaken, chaptersRead] = await Promise.all([
    prisma.user.count(),
    prisma.prayerRequest.count(),
    prisma.quizAttempt.count(),
    prisma.xPLog.count({ where: { reason: { contains: "Chapter" } } }),
  ]);

  const recentUsersData = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true
    }
  });

  const recentUsers = recentUsersData.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    joined: new Date(u.createdAt).toLocaleDateString(),
    status: "active"
  }));

  return {
    success: true,
    stats: {
      totalUsers,
      prayersOffered,
      quizzesTaken,
      chaptersRead
    },
    recentUsers
  };
}
