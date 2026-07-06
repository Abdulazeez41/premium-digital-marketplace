import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { couponSchema } from "@/lib/validators/catalog";

export async function GET() {
  try {
    await requireApiAdminSession();
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return ok(coupons);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid coupon payload.",
        400,
      );

    const coupon = await db.coupon.create({
      data: {
        ...parsed.data,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      },
    });
    await createAuditLog({
      userId: session.id,
      action: "coupon.create",
      entityType: "Coupon",
      entityId: coupon.id,
    });
    return ok(coupon, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to create coupon.",
      400,
    );
  }
}
