import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";

import { APP_URL } from "@/lib/constants";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    "",
    "/shop",
    "/courses",
    "/ebooks",
    "/audiobooks",
    "/workbooks",
    "/categories",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    ...products.map((product) => `/product/${product.slug}`),
    ...categories.map((category) => `/category/${category.slug}`),
  ].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
