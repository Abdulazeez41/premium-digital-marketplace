import { NextRequest } from "next/server";

import { requireApiSession } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { generateInvoiceBuffer } from "@/lib/payments/invoice";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const session = await requireApiSession();
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payments: true,
        user: true,
      },
    });

    if (!order) return fail("Order not found.", 404);
    if (session.role !== "ADMIN" && order.userId !== session.id)
      return fail("Forbidden", 403);

    if (request.nextUrl.searchParams.get("format") === "invoice") {
      const buffer = await generateInvoiceBuffer({
        orderId: order.id,
        customerName: order.billingName,
        customerEmail: order.billingEmail,
        amountCents: order.totalCents,
        currency: order.currency,
        items: order.items.map((item) => ({
          title: item.titleSnapshot,
          priceCents: item.priceCents,
        })),
        paidAt: order.paymentVerifiedAt,
      });
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${order.id}.pdf"`,
        },
      });
    }

    return ok(order);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}
