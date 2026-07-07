"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;
  try {
    const payload = await decrypt(token);
    return payload?.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

export async function adminLogin(email: string, pass: string) {
  if (email === process.env.ADMIN_EMAIL && pass === process.env.ADMIN_PASS) {
    const cookieStore = await cookies();
    const token = await encrypt({ role: "SUPER_ADMIN" });
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    return { success: true };
  }
  return { error: "Invalid admin credentials" };
}

export async function createAnnouncement(title: string, content: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  await prisma.announcement.create({
    data: { title, content }
  });
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { success: true };
}

export async function createEvent(title: string, description: string, dateStr: string, location: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(dateStr),
      location
    }
  });
  revalidatePath("/dashboard");
  revalidatePath("/events");
  return { success: true, event };
}

export async function getAdminDashboardData() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  const [totalUsers, prayersOffered, quizzesTaken, chaptersRead, journeyNodesDone, totalStarsEarned] = await Promise.all([
    prisma.user.count(),
    prisma.prayerRequest.count(),
    prisma.quizAttempt.count(),
    prisma.xPLog.count({ where: { reason: { contains: "Chapter" } } }),
    prisma.userJourneyNode.count({ where: { status: "completed" } }),
    prisma.user.aggregate({ _sum: { stars: true } })
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
      chaptersRead,
      journeyNodesDone,
      totalStarsEarned: totalStarsEarned._sum.stars || 0
    },
    recentUsers
  };
}

export async function getAllPrayers() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  const prayers = await prisma.prayerRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true, email: true } } }
  });

  return { success: true, prayers };
}

export async function deletePrayer(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  await prisma.prayerRequest.delete({ where: { id } });
  revalidatePath("/prayer");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return { success: true };
}

export async function deleteEvent(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  // Remove attendances first (FK constraint)
  await prisma.attendance.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/events");
  return { success: true };
}

export async function getChurches() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const churches = await prisma.church.findMany({
    include: { _count: { select: { users: true, events: true } } },
    orderBy: { createdAt: "desc" }
  });
  return { success: true, churches };
}

export async function createChurch(name: string, location: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  
  // Generate random 6 character code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let inviteCode = '';
  for (let i = 0; i < 6; i++) inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));

  // Ensure unique (very unlikely collision, but safe to loop if needed in production)
  const church = await prisma.church.create({
    data: { name, location, inviteCode }
  });
  return { success: true, church };
}

// ── Public (no admin auth required) ──────────────────────────────────────────

export async function getAnnouncements() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return announcements.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt.toISOString(),
    targetRole: a.targetRole,
  }));
}

export async function getUpcomingEvents() {
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { attendances: true },
    take: 20,
  });
  return events.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || "Join us for this parish event.",
    date: e.date.toISOString(),
    location: e.location || "TBA",
    attendees: e.attendances.length,
  }));
}
