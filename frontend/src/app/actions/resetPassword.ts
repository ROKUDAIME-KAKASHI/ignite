"use server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success anyway to prevent email enumeration
      return { success: true };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // In a real app, send an email here with `http://localhost:3000/login/reset-password?token=${token}`
    // Since we don't have an SMTP server set up, we will log it to the console.
    const resetUrl = `http://localhost:3000/login/reset-password?token=${token}`;
    console.log(`\n\n========================================`);
    console.log(`🔒 PASSWORD RESET LINK FOR ${email}`);
    console.log(`👉 ${resetUrl}`);
    console.log(`========================================\n\n`);

    return { success: true };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function resetPassword(token: string, newPasswordHash: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired token" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPasswordHash, salt);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
      where: { token }
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
