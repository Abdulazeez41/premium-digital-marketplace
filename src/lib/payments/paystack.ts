import "server-only";

import crypto from "crypto";

import { getEnv } from "@/lib/env";

const PAYSTACK_API = "https://api.paystack.co";

export async function initializePaystackTransaction(payload: {
  email: string;
  amountCents: number;
  reference: string;
  metadata: Record<string, unknown>;
  callbackUrl?: string;
}) {
  const env = getEnv();

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: payload.amountCents,
      reference: payload.reference,
      metadata: payload.metadata,
      callback_url: payload.callbackUrl,
      currency: "NGN",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize Paystack transaction");
  }

  const data = (await response.json()) as {
    data: { authorization_url: string; access_code: string; reference: string };
  };

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const env = getEnv();
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to verify transaction");
  }

  return (await response.json()) as {
    data: {
      id: number;
      status: string;
      reference: string;
      amount: number;
      currency: string;
      metadata?: Record<string, unknown>;
      paid_at?: string;
      customer: { email: string };
    };
  };
}

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
) {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", getEnv().PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
