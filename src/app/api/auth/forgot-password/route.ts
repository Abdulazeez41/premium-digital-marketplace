import crypto from "crypto";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/mailer";
import { fail, ok } from "@/lib/http";
import { getClientIp } from "@/lib/request";
import { assertAuthRateLimit, recordAuthAttempt } from "@/lib/auth/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

  try {
    await assertAuthRateLimit(ipAddress, "forgot-password", parsed.data.email);
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user) {
      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
      const token = crypto.randomUUID();
      await db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      await sendPasswordResetEmail(user.email, token);
      await recordAuthAttempt({
        ipAddress,
        action: "forgot-password",
        email: user.email,
        success: true,
        userId: user.id,
      });
    }

    return ok({ sent: true });
  } catch (error) {
    await recordAuthAttempt({
      ipAddress,
      action: "forgot-password",
      email: parsed.data.email,
      success: false,
    });
    return fail(
      error instanceof Error ? error.message : "Unable to process request.",
      400,
    );
  }
}
