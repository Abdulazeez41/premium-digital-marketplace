import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiSession();
    const user = await db.user.findUnique({
      where: { id },
      include: { orders: true, downloads: true, courseProgress: true },
    });
    if (!user) return fail("User not found.", 404);
    if (session.role !== "ADMIN" && session.id !== id)
      return fail("Forbidden", 403);
    return ok(user);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiSession();
    const body = await request.json();
    if (session.role !== "ADMIN" && session.id !== id)
      return fail("Forbidden", 403);
    const user = await db.user.update({
      where: { id },
      data: {
        name: body.name || undefined,
        avatarUrl: body.avatarUrl ?? undefined,
        role: session.role === "ADMIN" ? body.role || undefined : undefined,
      },
    });
    await createAuditLog({
      userId: session.id,
      action: "user.update",
      entityType: "User",
      entityId: id,
    });
    return ok(user);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update user.",
      400,
    );
  }
}
