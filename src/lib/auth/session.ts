import "server-only";

import { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";

const COOKIE_NAME = "pdm_session";
const ONE_DAY = 60 * 60 * 24;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

async function getSecretKey() {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

export async function createSessionCookie(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${7}d`)
    .sign(await getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, await getSecretKey());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== UserRole.ADMIN) {
    throw new Error("Forbidden");
  }
  return session;
}
