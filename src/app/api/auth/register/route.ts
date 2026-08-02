import crypto from "crypto";

import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/mailer";
import { fail, ok } from "@/lib/http";
import { getClientIp } from "@/lib/request";
import { hashPassword } from "@/lib/auth/password";
import { assertAuthRateLimit, recordAuthAttempt } from "@/lib/auth/rate-limit";
import { getEnv } from "@/lib/env";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);
  }

  let createdUserId: string | undefined;
  let verificationEmailSent = false;

  try {
    getEnv();
  } catch {
    return fail(
      "Registration is temporarily unavailable because email is not configured correctly.",
      503,
    );
  }

  try {
    await assertAuthRateLimit(ipAddress, "register", parsed.data.email);

    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing)
      return fail("An account with this email already exists.", 409);

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
    createdUserId = user.id;

    const token = crypto.randomUUID();
    await db.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendVerificationEmail(user.email, token);
    verificationEmailSent = true;
    await recordAuthAttempt({
      ipAddress,
      action: "register",
      email: user.email,
      success: true,
      userId: user.id,
    }).catch(() => undefined);

    return ok({ id: user.id });
  } catch {
    if (createdUserId && !verificationEmailSent) {
      await db.user
        .delete({ where: { id: createdUserId } })
        .catch(() => undefined);
    }

    await recordAuthAttempt({
      ipAddress,
      action: "register",
      email: parsed.data.email,
      success: false,
    }).catch(() => undefined);

    if (createdUserId && !verificationEmailSent) {
      return fail(
        "We couldn't send the verification email. Please try again later.",
        503,
      );
    }

    return fail("Unable to create account.", 400);
  }
}
