import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { APP_URL } from "@/lib/constants";
import { createAuditLog } from "@/lib/audit";
import { checkoutSchema } from "@/lib/validators/checkout";
import { fail, ok } from "@/lib/http";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { createPendingOrder } from "@/lib/services/checkout";

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid checkout payload.",
        400,
      );

    const { order } = await createPendingOrder(session.id, parsed.data);
    const initialized = await initializePaystackTransaction({
      email: parsed.data.billingEmail,
      amountCents: order.totalCents,
      reference: order.paystackReference!,
      callbackUrl: `${APP_URL}/checkout?reference=${order.paystackReference}`,
      metadata: {
        orderId: order.id,
        userId: session.id,
      },
    });

    await createAuditLog({
      userId: session.id,
      action: "checkout.initialize",
      entityType: "Order",
      entityId: order.id,
    });

    return ok({
      orderId: order.id,
      reference: order.paystackReference,
      authorizationUrl: initialized.authorization_url,
      accessCode: initialized.access_code,
      totalCents: order.totalCents,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to initialize checkout.",
      400,
    );
  }
}
