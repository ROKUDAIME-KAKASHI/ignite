import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "web-push";

// Vercel Cron triggers GET by default
export async function GET(req: Request) {
  // Check authorization header for Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    webpush.setVapidDetails(
      'mailto:admin@ignite.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const subscriptions = await prisma.pushSubscription.findMany();
    
    // Generate today's date at midnight for querying
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find today's journey in the database
    let journey = await prisma.dailyJourney.findUnique({
      where: { date: today }
    });

    const verseText = journey 
      ? `"${journey.verse}" - ${journey.verseRef}`
      : "This is the day the Lord has made; let us rejoice and be glad in it. - Psalm 118:24";

    const payload = JSON.stringify({
      title: "Daily Grace",
      body: verseText,
      icon: "/icon-192x192.png"
    });

    const notifications = subscriptions.map(sub => 
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }, payload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Clean up expired subscriptions
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push', err);
      })
    );

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
