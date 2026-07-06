import { ProductStatus, ProductType } from "@prisma/client";
import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3).max(180),
  slug: z.string().min(3).max(180),
  excerpt: z.string().min(20).max(240),
  description: z.string().min(50),
  type: z.nativeEnum(ProductType),
  status: z.nativeEnum(ProductStatus),
  sku: z.string().min(3),
  priceCents: z.coerce.number().int().positive(),
  compareAtPriceCents: z.coerce.number().int().positive().optional().nullable(),
  categoryId: z.string().min(1),
  featured: z.coerce.boolean().default(false),
  popularScore: z.coerce.number().int().min(0).max(100).default(0),
  features: z.array(z.string().min(2)).min(1),
  coverMediaId: z.string().optional().nullable(),
  downloadMediaIds: z.array(z.string()).default([]),
  seoTitle: z.string().max(180).optional().nullable(),
  seoDescription: z.string().max(240).optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().min(10).max(280),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  type: z.nativeEnum(ProductType).optional().nullable(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase()),
  description: z.string().max(160).optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().int().positive(),
  maxDiscountCents: z.coerce.number().int().positive().optional().nullable(),
  minOrderCents: z.coerce.number().int().nonnegative().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  active: z.coerce.boolean().default(true),
});

export const homepageContentSchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  content: z.record(z.string(), z.any()),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
