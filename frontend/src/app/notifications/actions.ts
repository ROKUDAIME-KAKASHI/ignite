"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

async function getUserId() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

export async function getNotifications() {
  const userId = await getUserId();
  if (!userId) return [];

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(id: string) {
  const userId = await getUserId();
  if (!userId) return { success: false };

  await prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllAsRead() {
  const userId = await getUserId();
  if (!userId) return { success: false };

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
}
