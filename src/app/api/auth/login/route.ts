import { NextRequest } from "next/server";

import { createSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getClientIp } from "@/lib/request";
import { verifyPassword } from "@/lib/auth/password";
import { assertAuthRateLimit, recordAuthAttempt } from "@/lib/auth/rate-limit";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

  try {
    await assertAuthRateLimit(ipAddress, "login", parsed.data.email);
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (
      !user ||
      !(await verifyPassword(parsed.data.password, user.passwordHash))
    ) {
      await recordAuthAttempt({
        ipAddress,
        action: "login",
        email: parsed.data.email,
        success: false,
        userId: user?.id,
      });
      return fail("Invalid email or password.", 401);
    }

    if (!user.emailVerifiedAt)
      return fail("Please verify your email before signing in.", 403);

    await createSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await recordAuthAttempt({
      ipAddress,
      action: "login",
      email: user.email,
      success: true,
      userId: user.id,
    });

    return ok({ redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard" });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to log in.",
      400,
    );
  }
}
