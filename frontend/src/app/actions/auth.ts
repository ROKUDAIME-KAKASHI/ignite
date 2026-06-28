"use server";

import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function login(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  if (!email || !password) return { error: "Missing fields" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid credentials" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Invalid credentials" };

  const sessionData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true, secure: true });

  return { success: true, user: sessionData };
}

export async function signup(data: FormData) {
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const firstName = data.get("firstName") as string || "User";
  const lastName = data.get("lastName") as string || "";

  if (!email || !password) return { error: "Missing fields" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use" };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "MEMBER",
    },
  });

  const sessionData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true, secure: true });

  return { success: true, user: sessionData };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

export async function updateProfile(firstName: string, lastName: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Not logged in" };

  const sessionData = await decrypt(sessionToken).catch(() => null);
  if (!sessionData) return { error: "Invalid session" };

  await prisma.user.update({
    where: { id: sessionData.id },
    data: { firstName, lastName }
  });

  const updatedSession = { ...sessionData, firstName, lastName };
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newSessionToken = await encrypt(updatedSession);
  
  cookieStore.set("session", newSessionToken, { expires, httpOnly: true, secure: true });
  return { success: true, user: updatedSession };
}
