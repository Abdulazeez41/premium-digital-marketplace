import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { grantOrderAccess } from "@/lib/services/checkout";

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const body = (await request.json()) as { reference?: string };
    if (!body.reference) return fail("Reference is required.", 400);

    const verification = await verifyPaystackTransaction(body.reference);
    if (verification.data.status !== "success")
      return fail("Payment has not been completed.", 400);

    const order = await db.order.findUnique({
      where: { paystackReference: body.reference },
    });
    if (!order) return fail("Order not found for reference.", 404);
    if (order.userId !== session.id && session.role !== "ADMIN")
      return fail("Forbidden", 403);

    await grantOrderAccess(
      order.id,
      verification.data as unknown as Record<string, unknown>,
    );
    await createAuditLog({
      userId: session.id,
      action: "checkout.verify",
      entityType: "Order",
      entityId: order.id,
      details: verification.data as any,
    });

    return ok({ verified: true, orderId: order.id });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to verify payment.",
      400,
    );
  }
}
