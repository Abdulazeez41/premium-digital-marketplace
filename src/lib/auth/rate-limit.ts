import "server-only";

import { subMinutes } from "date-fns";

import { db } from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 8;

export async function assertAuthRateLimit(
  ipAddress: string,
  action: string,
  email?: string,
) {
  const windowStart = subMinutes(new Date(), WINDOW_MINUTES);

  const count = await db.authAttempt.count({
    where: {
      ipAddress,
      action,
      createdAt: { gte: windowStart },
      success: false,
      ...(email ? { email } : {}),
    },
  });

  if (count >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Please try again later.");
  }
}

export async function recordAuthAttempt(input: {
  ipAddress: string;
  action: string;
  email?: string;
  success: boolean;
  userId?: string;
}) {
  await db.authAttempt.create({ data: input });
}
