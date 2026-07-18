"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jose from "jose";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import { logAudit } from "@/lib/logger";

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

import { getSession } from "@/lib/auth";

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
            badges: {
              include: { badge: true }
            }
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
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  // 1. Zod Input Validation
  const parseResult = chatMessageSchema.safeParse({ content });
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0].message };
  }

  // 1.5 Check if banned
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (user?.isBanned) return { success: false, error: "Your account is temporarily suspended from chat." };

  // 2. Rate Limiting Check
  const lastRequest = rateLimitCache.get(session.id);
  if (lastRequest && Date.now() - lastRequest < 3000) {
    return { success: false, error: "Please wait a few seconds before sending another message." };
  }
  rateLimitCache.set(session.id, Date.now());

  try {
    const message = await prisma.chatMessage.create({
      data: {
        userId: session.id,
        content: parseResult.data.content,
      },
    });

    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentChatXP = await prisma.xPLog.findFirst({
      where: {
        userId: session.id,
        reason: { contains: "chat", mode: "insensitive" },
        awardedAt: { gte: oneMinuteAgo },
      },
    });

    if (!recentChatXP) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.id },
          data: { xp: { increment: 2 } },
        }),
        prisma.xPLog.create({
          data: {
            userId: session.id,
            amount: 2,
            reason: "Community Chat Participation",
          },
        })
      ]);
    }

    // Log the action
    await logAudit(session.id, "SENT_CHAT_MESSAGE", { messageId: message.id, contentLength: parseResult.data.content.length });

    return { success: true, messageId: message.id };
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return { success: false, error: error.message || "Server error" };
  }
}

export async function deleteMessage(messageId: string) {
  const session = await getSession();
  if (!session?.id) return { success: false, error: "Not authenticated" };

  try {
    // Check if user is admin/priest or the owner of the message
    const message = await prisma.chatMessage.findUnique({ where: { id: messageId }, include: { user: true } });
    if (!message) return { success: false, error: "Message not found" };

    const isAdmin = ["ADMIN", "PRIEST"].includes(session.role);
    const isOwner = message.userId === session.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: "Unauthorized to delete this message" };
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    // Log the action
    await logAudit(session.id, "DELETED_CHAT_MESSAGE", { messageId, messageOwner: message.userId });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Server error" };
  }
}
