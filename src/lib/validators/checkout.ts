import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        title: z.string().min(1),
        slug: z.string().min(1),
        coverImage: z.string().min(1),
        priceCents: z.number().int().positive(),
        type: z.enum(["EBOOK", "AUDIOBOOK", "WORKBOOK", "COURSE"]),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  billingName: z.string().min(2),
  billingEmail: z.string().email(),
  billingPhone: z.string().min(7),
  billingAddress: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
  }),
  couponCode: z.string().optional(),
});
