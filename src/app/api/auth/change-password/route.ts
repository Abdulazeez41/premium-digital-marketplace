import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/auth/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

const schema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(12)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return fail("User not found.", 404);
    if (
      !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))
    ) {
      return fail("Current password is incorrect.", 400);
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
    return ok({ updated: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}
