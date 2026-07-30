import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { verifyPaystackSignature } from "@/lib/payments/paystack";
import { grantOrderAccess } from "@/lib/services/checkout";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: {
    event?: string;
    data?: { reference?: string; status?: string };
  };

  try {
    payload = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string; status?: string };
    };
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (
    payload.event !== "charge.success" ||
    payload.data?.status !== "success" ||
    !payload.data.reference
  ) {
    return new Response("Ignored", { status: 200 });
  }

  const order = await db.order.findUnique({
    where: { paystackReference: payload.data.reference },
  });
  if (!order) return new Response("Order not found", { status: 404 });

  await grantOrderAccess(
    order.id,
    payload as unknown as Record<string, unknown>,
  );

  return new Response("ok", { status: 200 });
}
