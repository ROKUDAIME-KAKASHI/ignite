import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    // Upsert subscription
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: userId || null,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: userId || null,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}
