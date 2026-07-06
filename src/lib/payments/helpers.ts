import type { Coupon } from "@prisma/client";

export function computeDiscountCents(
  subtotalCents: number,
  coupon: Pick<Coupon, "type" | "value" | "maxDiscountCents">,
) {
  const rawDiscount =
    coupon.type === "PERCENTAGE"
      ? Math.floor((subtotalCents * coupon.value) / 100)
      : coupon.value;
  return coupon.maxDiscountCents
    ? Math.min(rawDiscount, coupon.maxDiscountCents)
    : rawDiscount;
}
