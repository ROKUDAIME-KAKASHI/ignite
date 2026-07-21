"use server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getBibleProgress() {
  try {
    const session = await getSession();
    if (!session?.id) return { read: 0, total: 1189 };

    const logs = await prisma.xPLog.findMany({
      where: {
        userId: session.id,
        reason: { startsWith: "Read Scripture:" }
      },
      select: { reason: true }
    });

    const uniqueChapters = new Set(logs.map(log => log.reason));
    
    return {
      read: uniqueChapters.size,
      total: 1189
    };
  } catch (error) {
    console.error(error);
    return { read: 0, total: 1189 };
  }
}

export async function getBibleContent() {
  let [plans, featured] = await Promise.all([
    prisma.readingPlan.findMany(),
    prisma.featuredVerse.findMany()
  ]);

  if (plans.length === 0) {
    await prisma.readingPlan.createMany({
      data: [
        { title: "Walk with Christ — Gospels", duration: "40 Days", progress: 0, icon: "✝️", color: "bg-amber-100 text-amber-800" },
        { title: "Psalms & Proverbs: 30 Days", duration: "30 Days", progress: 0, icon: "📜", color: "bg-green-100 text-green-800" },
        { title: "Letters of St. Paul", duration: "21 Days", progress: 0, icon: "⚓", color: "bg-green-100 text-green-800" },
        { title: "Lenten Journey: 40 Days", duration: "40 Days", progress: 0, icon: "🌿", color: "bg-purple-100 text-purple-800" },
      ]
    });
    plans = await prisma.readingPlan.findMany();
  }

  if (featured.length === 0) {
    await prisma.featuredVerse.createMany({
      data: [
        { text: "Psalm 23", reference: "psalms:23", theme: "🌿" },
        { text: "John 1", reference: "john:1", theme: "✝️" },
        { text: "Romans 8", reference: "romans:8", theme: "⚡" },
        { text: "Genesis 1", reference: "genesis:1", theme: "🌅" },
        { text: "Matthew 5", reference: "matthew:5", theme: "⛰️" },
        { text: "Revelation 21", reference: "revelation:21", theme: "👑" },
      ]
    });
    featured = await prisma.featuredVerse.findMany();
  }

  const session = await getSession();
  if (session?.id) {
    const logs = await prisma.xPLog.findMany({
      where: { userId: session.id, reason: { startsWith: "Read Scripture:" } },
      select: { reason: true }
    });
    const readSet = new Set(logs.map(log => log.reason));

    plans = plans.map(plan => {
      let readCount = 0;
      let totalCount = 1;

      if (plan.title.includes("Gospels")) {
        totalCount = 89;
        ["Matthew", "Mark", "Luke", "John"].forEach(book => {
          for (let i = 1; i <= 28; i++) {
             if (readSet.has(`Read Scripture: ${book} ${i}`)) readCount++;
          }
        });
      } else if (plan.title.includes("Psalms & Proverbs")) {
        totalCount = 181;
        ["Psalms", "Proverbs"].forEach(book => {
          for (let i = 1; i <= 150; i++) {
            if (readSet.has(`Read Scripture: ${book} ${i}`)) readCount++;
          }
        });
      } else if (plan.title.includes("St. Paul")) {
        totalCount = 87;
        const paul = ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"];
        paul.forEach(book => {
          for (let i = 1; i <= 16; i++) {
            if (readSet.has(`Read Scripture: ${book} ${i}`)) readCount++;
          }
        });
      } else if (plan.title.includes("Lenten")) {
         totalCount = 40;
         readCount = Math.min(readSet.size, 40); // Count any 40 chapters as Lenten journey
      }

      const progress = Math.min(100, Math.floor((readCount / totalCount) * 100));
      return { ...plan, progress };
    });
  }

  return { plans, featured };
}

export async function toggleDatabaseBookmark(bookSlug: string, chapter: number, verse: number, text?: string) {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Not logged in" };

    const existing = await prisma.bibleBookmark.findFirst({
      where: { userId: session.id, bookSlug, chapter, verse }
    });

    if (existing) {
      await prisma.bibleBookmark.delete({ where: { id: existing.id } });
      return { success: true, bookmarked: false };
    } else {
      await prisma.bibleBookmark.create({
        data: {
          userId: session.id,
          bookSlug,
          chapter,
          verse,
          text
        }
      });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function getDatabaseBookmarks() {
  try {
    const session = await getSession();
    if (!session?.id) return [];

    const bookmarks = await prisma.bibleBookmark.findMany({
      where: { userId: session.id },
      orderBy: [
        { bookSlug: 'asc' },
        { chapter: 'asc' },
        { verse: 'asc' }
      ]
    });
    
    return bookmarks;
  } catch (error) {
    console.error("Fetch bookmarks error:", error);
    return [];
  }
}
