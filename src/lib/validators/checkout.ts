import { z } from "zod";

const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  coverImage: z.string().trim().min(1),
  priceCents: z.number().int().positive(),
  type: z.enum(["EBOOK", "AUDIOBOOK", "WORKBOOK", "COURSE"]),
  quantity: z
    .number()
    .int()
    .refine(
      (value) => value === 1,
      "Digital products can only be purchased as a single license.",
    ),
});

export const checkoutSchema = z
  .object({
    items: z.array(checkoutItemSchema).min(1),
    billingName: z.string().trim().min(2),
    billingEmail: z.string().trim().email(),
    billingPhone: z.string().trim().min(7),
    billingAddress: z.object({
      line1: z.string().trim().min(3),
      line2: z.string().trim().optional(),
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
      country: z.string().trim().min(2),
    }),
    couponCode: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();

    value.items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "productId"],
          message: "Duplicate products are not allowed in checkout.",
        });
        return;
      }

      seen.add(item.productId);
    });
  });
