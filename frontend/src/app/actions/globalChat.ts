"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";
import { z } from "zod";
import { LRUCache } from "lru-cache";

// Rate limiting cache (500 items max, TTL 10 seconds)
// This will limit each user to 1 message per 3 seconds.
const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 3000, 
});

// Zod schema for chat message validation
const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long"),
});

async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { userId: string, role: string };
  } catch {
    return null;
  }
}

export async function getMessages(limit = 50) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            level: true,
          },
        },
      },
    });
    
    return messages.reverse();
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

export async function sendMessage(content: string) {
  const session = await getSessionUser();
  if (!session?.userId) return { success: false, error: "Not authenticated" };

  // 1. Zod Input Validation
  const parseResult = chatMessageSchema.safeParse({ content });
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors[0].message };
  }

  // 2. Rate Limiting Check
  const lastRequest = rateLimitCache.get(session.userId);
  if (lastRequest && Date.now() - lastRequest < 3000) {
    return { success: false, error: "Please wait a few seconds before sending another message." };
  }
  rateLimitCache.set(session.userId, Date.now());

  try {
    const message = await prisma.chatMessage.create({
      data: {
        userId: session.userId,
        content: parseResult.data.content,
      },
    });

    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentChatXP = await prisma.xPLog.findFirst({
      where: {
        userId: session.userId,
        reason: { contains: "chat", mode: "insensitive" },
        awardedAt: { gte: oneMinuteAgo },
      },
    });

    if (!recentChatXP) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.userId },
          data: { xp: { increment: 2 } },
        }),
        prisma.xPLog.create({
          data: {
            userId: session.userId,
            amount: 2,
            reason: "Community Chat Participation",
          },
        })
      ]);
    }

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, error: "Server error" };
  }
}

export async function deleteMessage(messageId: string) {
  const session = await getSessionUser();
  if (!session?.userId) return { success: false, error: "Not authenticated" };

  try {
    // Check if user is admin/priest or the owner of the message
    const message = await prisma.chatMessage.findUnique({ where: { id: messageId }, include: { user: true } });
    if (!message) return { success: false, error: "Message not found" };

    const isAdmin = ["ADMIN", "PRIEST"].includes(session.role);
    const isOwner = message.userId === session.userId;

    if (!isAdmin && !isOwner) {
      return { success: false, error: "Unauthorized to delete this message" };
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Server error" };
  }
}
