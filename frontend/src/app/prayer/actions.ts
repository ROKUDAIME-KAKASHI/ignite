"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { awardXP } from "@/app/actions/gamification";

export async function submitPrayer(content: string, isAnonymous: boolean, categoryName: string) {
  const session = await getSession();
  
  const category = await prisma.prayerCategory.findUnique({ where: { name: categoryName } });
  
  await prisma.prayerRequest.create({
    data: {
      userId: session?.id || undefined,
      content,
      isAnonymous,
      isApproved: true,
      categoryId: category?.id || null,
    }
  });

  if (session?.id) {
    await awardXP(10, "Submitted a prayer request");
  }

  revalidatePath("/prayer");
  return { success: true };
}

export async function getCategories() {
  let categories = await prisma.prayerCategory.findMany();
  if (categories.length === 0) {
    await prisma.prayerCategory.createMany({
      data: [
        { name: "General", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
        { name: "Healing", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
        { name: "Strength", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
        { name: "Thanksgiving", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
        { name: "Comfort", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
        { name: "Family", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
        { name: "Community", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" }
      ]
    });
    categories = await prisma.prayerCategory.findMany();
  }
  return categories.map(c => ({ name: c.name, color: c.color || "bg-gray-100 text-gray-800" }));
}

export async function getApprovedPrayers() {
  const prayers = await prisma.prayerRequest.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      },
      category: true
    }
  });

  return prayers.map(p => ({
    id: p.id,
    text: p.content,
    author: p.isAnonymous ? "Anonymous" : (p.user ? `${p.user.firstName} ${p.user.lastName}` : "Anonymous"),
    anonymous: p.isAnonymous,
    prayers: p.prayCount,
    prayed: false,
    category: p.category?.name || "General",
    time: p.createdAt.toISOString(),
  }));
}

export async function incrementPrayerCount(id: string) {
  await prisma.prayerRequest.update({
    where: { id },
    data: { prayCount: { increment: 1 } }
  });
  await awardXP(5, "Prayed for someone in need");
  return { success: true };
}
