import { describe, expect, it } from "vitest";

import { computeDiscountCents } from "@/lib/payments/helpers";

describe("computeDiscountCents", () => {
  it("calculates percentage discounts", () => {
    expect(
      computeDiscountCents(100_000, {
        type: "PERCENTAGE",
        value: 15,
        maxDiscountCents: null,
      }),
    ).toBe(15_000);
  });

  it("caps percentage discounts at the configured maximum", () => {
    expect(
      computeDiscountCents(500_000, {
        type: "PERCENTAGE",
        value: 20,
        maxDiscountCents: 50_000,
      }),
    ).toBe(50_000);
  });

  it("returns fixed discounts directly when no cap applies", () => {
    expect(
      computeDiscountCents(500_000, {
        type: "FIXED",
        value: 25_000,
        maxDiscountCents: null,
      }),
    ).toBe(25_000);
  });
});
