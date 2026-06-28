"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardXP } from "@/app/actions/gamification";

export async function bookAppointment(data: FormData) {
  try {
    const session = await getSession();
    if (!session?.id) return { success: false, error: "Not authenticated" };

    const date = data.get("date") as string;
    const time = data.get("time") as string;
    const purpose = data.get("purpose") as string;

    if (!date || !time) return { success: false, error: "Date and time are required" };

    await prisma.appointment.create({
      data: {
        userId: session.id,
        date,
        time,
        purpose
      }
    });

    // Optionally award a little XP for scheduling spiritual direction
    await awardXP(10, "Scheduled spiritual direction");

    return { success: true };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return { success: false, error: "Failed to book appointment." };
  }
}
