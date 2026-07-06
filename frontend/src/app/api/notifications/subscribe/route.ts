import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user securely from the server-side JWT cookie
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized: You must be logged in to subscribe to notifications" }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    // 2. Upsert subscription and strongly link it to the authenticated userId
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: session.userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: session.userId,
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
