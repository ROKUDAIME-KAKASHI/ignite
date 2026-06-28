"use server";
import prisma from "@/lib/prisma";

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

  return { plans, featured };
}
