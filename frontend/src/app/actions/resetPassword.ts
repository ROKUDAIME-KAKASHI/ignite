"use server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { logAudit } from "@/lib/logger";

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

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login/reset-password?token=${token}`;

    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      // Send real email via Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail", // For Gmail. Use 'host' and 'port' for other providers.
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Ignite App" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Reset your Ignite Password",
        text: `You requested a password reset. Please click this link to reset your password: ${resetUrl}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Ignite account.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">Reset Password</a>
            <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      
      console.log(`✅ Password reset email sent to ${email}`);
    } else {
      // Fallback for development if no SMTP credentials exist
      console.log(`\n\n========================================`);
      console.log(`🔒 PASSWORD RESET LINK FOR ${email}`);
      console.log(`👉 ${resetUrl}`);
      console.log(`========================================\n\n`);
      console.log(`⚠️ Note: Add SMTP_EMAIL and SMTP_PASSWORD to .env to send real emails.`);
    }

    // Returning resetUrl purely so you can copy it in the app without checking console.
    // REMOVE THIS in production when real emails are implemented!
    await logAudit(user.id, "PASSWORD_RESET_REQUESTED", { method: "email" });

    return { success: true, resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined };
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

    await logAudit(resetToken.userId, "PASSWORD_RESET_COMPLETED");

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
