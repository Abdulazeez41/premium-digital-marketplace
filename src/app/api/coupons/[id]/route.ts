import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { couponSchema } from "@/lib/validators/catalog";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await requireApiAdminSession();
    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) return fail("Coupon not found.", 404);
    return ok(coupon);
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
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid coupon payload.",
        400,
      );
    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...parsed.data,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      },
    });
    await createAuditLog({
      userId: session.id,
      action: "coupon.update",
      entityType: "Coupon",
      entityId: id,
    });
    return ok(coupon);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update coupon.",
      400,
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    await db.coupon.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "coupon.delete",
      entityType: "Coupon",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to delete coupon.",
      400,
    );
  }
}
