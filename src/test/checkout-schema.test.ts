import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/lib/validators/checkout";

const validPayload = {
  items: [
    {
      productId: "prod_1",
      title: "Premium Finance Workbook",
      slug: "premium-finance-workbook",
      coverImage: "https://example.com/cover.jpg",
      priceCents: 250000,
      type: "WORKBOOK" as const,
      quantity: 1 as const,
    },
  ],
  billingName: "Ada Lovelace",
  billingEmail: "ada@example.com",
  billingPhone: "+2348000000000",
  billingAddress: {
    line1: "10 Market Street",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
  },
  couponCode: "WELCOME10",
};

describe("checkoutSchema", () => {
  it("accepts a valid single-license digital order", () => {
    const parsed = checkoutSchema.safeParse(validPayload);

    expect(parsed.success).toBe(true);
  });

  it("rejects duplicate products in the same checkout", () => {
    const parsed = checkoutSchema.safeParse({
      ...validPayload,
      items: [...validPayload.items, { ...validPayload.items[0] }],
    });

    expect(parsed.success).toBe(false);
    expect(
      parsed.error?.issues.some((issue) =>
        issue.message.includes("Duplicate products"),
      ),
    ).toBe(true);
  });

  it("rejects quantities greater than one for digital products", () => {
    const parsed = checkoutSchema.safeParse({
      ...validPayload,
      items: [{ ...validPayload.items[0], quantity: 2 }],
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toContain("single license");
  });
});
