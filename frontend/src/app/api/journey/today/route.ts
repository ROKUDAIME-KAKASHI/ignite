import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Generate today's date at midnight UTC for querying
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Use upsert to prevent unique constraint failures
    let journey = await prisma.dailyJourney.upsert({
      where: { date: today },
      update: {},
      create: {
        date: today,
        verse: "I can do all things through Christ who strengthens me.",
        verseRef: "Philippians 4:13",
        reflection: "Reflect on the strength that comes not from within, but from your faith in Christ. When facing challenges, remember that you are never walking alone.",
        prayer: "Lord, grant me the strength to overcome today's obstacles, knowing You are always with me.",
      },
      include: { mission: true, quiz: true }
    });

    return NextResponse.json(journey);
  } catch (error) {
    console.error('Error fetching Daily Journey:', error);
    // Return a fallback for the UI so it doesn't break if DB fails
    return NextResponse.json({
      verse: "I can do all things through Christ who strengthens me.",
      verseRef: "Philippians 4:13",
      reflection: "Reflect on the strength that comes not from within, but from your faith in Christ. When facing challenges, remember that you are never walking alone.",
    });
  }
}
