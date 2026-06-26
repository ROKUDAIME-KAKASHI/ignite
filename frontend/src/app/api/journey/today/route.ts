import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Generate today's date at midnight for querying
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find today's journey in the database
    let journey = await prisma.dailyJourney.findUnique({
      where: { date: today },
      include: { mission: true, quiz: true }
    });

    // If it doesn't exist yet, we'll generate and save a default one for the MVP
    if (!journey) {
      // In a full production app, an admin cron job would generate these ahead of time
      journey = await prisma.dailyJourney.create({
        data: {
          date: today,
          verse: "I can do all things through Christ who strengthens me.",
          verseRef: "Philippians 4:13",
          reflection: "Reflect on the strength that comes not from within, but from your faith in Christ. When facing challenges, remember that you are never walking alone.",
          prayer: "Lord, grant me the strength to overcome today's obstacles, knowing You are always with me.",
        },
        include: { mission: true, quiz: true }
      });
    }

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
