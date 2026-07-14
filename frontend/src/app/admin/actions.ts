"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/auth";
import webpush from "web-push";
import { neon } from "@neondatabase/serverless";

async function verifyAdmin() {
  const cookieStore = await cookies();
  
  // 1. Check admin_session cookie first (super admin credentials)
  const adminToken = cookieStore.get("admin_session")?.value;
  if (adminToken) {
    try {
      const payload = await decrypt(adminToken);
      if (payload?.role === "SUPER_ADMIN") return true;
    } catch {}
  }

  // 2. Check standard user session cookie
  const sessionToken = cookieStore.get("session")?.value;
  if (sessionToken) {
    try {
      const payload = await decrypt(sessionToken);
      if (payload?.id) {
        // Fetch user from DB to verify role
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: { role: true }
        });
        if (user?.role === "ADMIN") return true;
      }
    } catch {}
  }

  return false;
}

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value;
  if (!adminToken) return false;
  try {
    const payload = await decrypt(adminToken);
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

  const announcement = await prisma.announcement.create({
    data: { title, content }
  });

  // Broadcast Web Push notifications asynchronously
  try {
    webpush.setVapidDetails(
      'mailto:admin@ignite.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const subscriptions = await prisma.pushSubscription.findMany();
    
    const payload = JSON.stringify({
      title: title,
      body: content,
      icon: "/icon-192x192.png"
    });

    const sendPromises = subscriptions.map(sub => {
      // If it's a standard webpush subscription
      if (sub.p256dh !== "fcm") {
        return webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Clean up expired subscriptions
            return prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          console.error('Error sending push to subscription ID:', sub.id, err);
        });
      } else {
        // FCM token fallback if someone registered through client Firebase getToken directly
        // We log it or could trigger an HTTP POST request to Firebase FCM endpoint if key exists
        console.log("FCM subscription token found (skipping direct webpush for FCM token):", sub.endpoint);
        return Promise.resolve();
      }
    });

    // Execute in the background without blocking the UI response
    Promise.all(sendPromises).catch(err => console.error("Error in sending push notifications:", err));
  } catch (pushError) {
    console.error("Failed to broadcast push notifications:", pushError);
  }

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
    take: 10, // Increased limit to see more users
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const recentUsers = recentUsersData.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    joined: new Date(u.createdAt).toLocaleDateString(),
    status: u.role === "ADMIN" ? "Admin" : u.role === "LEADER" ? "Leader" : "Member"
  }));

  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value;
  let isSuperAdmin = false;
  if (adminToken) {
    try {
      const payload = await decrypt(adminToken);
      if (payload?.role === "SUPER_ADMIN") isSuperAdmin = true;
    } catch {}
  }

  return {
    success: true,
    isSuperAdmin,
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

export async function getAllUsers() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  try {
    const usersData = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        stars: true
      }
    });

    const users = usersData.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      stars: u.stars || 0,
      joined: new Date(u.createdAt).toLocaleDateString(),
      status: u.role === "ADMIN" ? "Admin" : u.role === "LEADER" ? "Leader" : "Member"
    }));

    return { success: true, users };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch users" };
  }
}

export async function updateUserRole(targetUserId: string, newRole: string) {
  if (!(await verifySuperAdmin())) return { error: "Unauthorized" };
  
  try {
    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole }
    });
    return { success: true, role: updated.role };
  } catch (error: any) {
    return { error: error.message || "Failed to update role" };
  }
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

export async function deleteUser(id: string) {
  if (!(await verifySuperAdmin())) return { error: "Unauthorized" };
  
  await prisma.$transaction([
    prisma.userGroup.deleteMany({ where: { userId: id } }),
    prisma.attendance.deleteMany({ where: { userId: id } }),
    prisma.prayerRequest.deleteMany({ where: { userId: id } }),
    prisma.userBadge.deleteMany({ where: { userId: id } }),
    prisma.xPLog.deleteMany({ where: { userId: id } }),
    prisma.quizAttempt.deleteMany({ where: { userId: id } }),
    prisma.appointment.deleteMany({ where: { userId: id } }),
    prisma.pushSubscription.deleteMany({ where: { userId: id } }),
    prisma.mentorshipQuestion.deleteMany({ where: { userId: id } }),
    prisma.userJourneyNode.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } })
  ]);
  
  return { success: true };
}

export async function loginAsUser(id: string) {
  if (!(await verifySuperAdmin())) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "User not found" };

  const sessionData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true, secure: process.env.NODE_ENV === "production" });

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

// ── Content Management ────────────────────────────────────────────────────────

export async function getQuotes() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
  return { success: true, quotes };
}

export async function createQuote(quote: string, author: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const q = await prisma.quote.create({ data: { quote, author } });
  return { success: true, quote: q };
}

export async function toggleQuoteActive(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  await prisma.quote.updateMany({ data: { isActive: false } }); // Only one active at a time
  await prisma.quote.update({ where: { id }, data: { isActive: true } });
  return { success: true };
}

export async function deleteQuote(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  await prisma.quote.delete({ where: { id } });
  return { success: true };
}

export async function getChatSuggestions() {
  const suggestions = await prisma.chatSuggestion.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
  return { success: true, suggestions };
}

export async function getAllChatSuggestions() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const suggestions = await prisma.chatSuggestion.findMany({ orderBy: { createdAt: "desc" } });
  return { success: true, suggestions };
}

export async function createChatSuggestion(text: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const s = await prisma.chatSuggestion.create({ data: { text } });
  return { success: true, suggestion: s };
}

export async function deleteChatSuggestion(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  await prisma.chatSuggestion.delete({ where: { id } });
  return { success: true };
}

export async function getBadges() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const badges = await prisma.badge.findMany();
  return { success: true, badges };
}

export async function createBadge(name: string, description: string, imageUrl: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  const b = await prisma.badge.create({ data: { name, description, imageUrl } });
  return { success: true, badge: b };
}

export async function deleteBadge(id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  await prisma.userBadge.deleteMany({ where: { badgeId: id } });
  await prisma.badge.delete({ where: { id } });
  return { success: true };
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

export async function getAppointments() {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  return { success: true, appointments };
}

export async function updateAppointmentStatus(id: string, status: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status }
  });

  return { success: true, appointment };
}

export async function sendDirectPushNotification(title: string, message: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  try {
    webpush.setVapidDetails(
      'mailto:admin@ignite.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const subscriptions = await prisma.pushSubscription.findMany();
    
    const payload = JSON.stringify({
      title: title,
      body: message,
      icon: "/icon-192x192.png"
    });

    const sendPromises = subscriptions.map(sub => {
      if (sub.p256dh !== "fcm") {
        return webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            return prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          console.error('Error sending push to subscription ID:', sub.id, err);
        });
      } else {
        console.log("FCM subscription token found:", sub.endpoint);
        return Promise.resolve();
      }
    });

    // Execute in the background and return immediately
    Promise.all(sendPromises).catch(err => console.error("Error in sending custom push notifications:", err));
    return { success: true };
  } catch (error: any) {
    console.error("Direct push notification failed:", error);
    return { error: error.message || "Failed to broadcast notifications" };
  }
}

export async function getAuditLogs(limit = 100) {
  if (!await verifyAdmin()) return { success: false, error: "Unauthorized" };

  try {
    const logDbUrl = process.env.LOG_DATABASE_URL || "postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
    if (!logDbUrl) return { success: false, error: "LOG_DATABASE_URL not configured" };

    const sql = neon(logDbUrl);
    
    // Fetch logs from Neon
    const logs = await sql`
      SELECT id, user_id, action, details, created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;

    if (!logs || logs.length === 0) return { success: true, logs: [] };

    // Fetch user details from Prisma
    const userIds = Array.from(new Set(logs.map(log => log.user_id).filter(id => id && id !== 'anonymous')));
    
    let userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds as string[] } },
        select: { id: true, firstName: true, lastName: true, email: true }
      });
      userMap = Object.fromEntries(users.map(u => [u.id, u]));
    }

    // Combine data
    const enrichedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.created_at,
      user: log.user_id && log.user_id !== 'anonymous' && userMap[log.user_id] 
        ? {
            name: `${userMap[log.user_id].firstName} ${userMap[log.user_id].lastName}`,
            email: userMap[log.user_id].email
          }
        : { name: 'Anonymous', email: '' }
    }));

    return { success: true, logs: enrichedLogs };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { success: false, error: "Database error" };
  }
}
