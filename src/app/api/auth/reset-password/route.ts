import { NextRequest } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!resetToken || resetToken.expiresAt < new Date())
    return fail("Reset link is invalid or expired.", 400);

  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await db.passwordResetToken.delete({ where: { token: parsed.data.token } });

  return ok({ updated: true });
}
