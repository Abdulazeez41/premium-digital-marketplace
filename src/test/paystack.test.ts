import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { verifyPaystackSignature } from "@/lib/payments/paystack";

describe("paystack signature verification", () => {
  beforeEach(() => {
    vi.stubEnv("PAYSTACK_WEBHOOK_SECRET", "test_webhook_secret");
  });

  it("accepts a valid webhook signature", () => {
    const payload = JSON.stringify({
      event: "charge.success",
      data: { reference: "abc123" },
    });
    const signature = crypto
      .createHmac("sha512", "test_webhook_secret")
      .update(payload)
      .digest("hex");

    expect(verifyPaystackSignature(payload, signature)).toBe(true);
  });

  it("rejects an invalid webhook signature", () => {
    const payload = JSON.stringify({
      event: "charge.success",
      data: { reference: "abc123" },
    });

    expect(verifyPaystackSignature(payload, "invalid-signature")).toBe(false);
    expect(verifyPaystackSignature(payload, null)).toBe(false);
  });
});
