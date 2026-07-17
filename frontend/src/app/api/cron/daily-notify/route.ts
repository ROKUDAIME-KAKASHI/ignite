import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// Vercel Cron triggers GET by default
export async function GET(req: Request) {
  // Check authorization header for Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    // Generate today's date at midnight UTC for querying
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Try to find today's journey in the database
    let journey = await prisma.dailyJourney.findUnique({
      where: { date: today }
    });

    const verseText = journey 
      ? `"${journey.verse}" - ${journey.verseRef}`
      : "This is the day the Lord has made; let us rejoice and be glad in it. - Psalm 118:24";

    if (appId && apiKey) {
      await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({
          app_id: appId,
          contents: { en: verseText },
          headings: { en: "Daily Grace" },
          included_segments: ["Total Subscriptions"],
        })
      });
    }

    return NextResponse.json({ success: true, count: 1 });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
