import { ProductMediaRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { productSchema } from "@/lib/validators/catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query") || undefined;
  const type = searchParams.get("type") || undefined;
  const category = searchParams.get("category") || undefined;

  const products = await db.product.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      productMedia: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      course: { include: { lessons: { orderBy: { position: "asc" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok(products);
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid product payload.",
        400,
      );

    const { coverMediaId, downloadMediaIds, features, ...data } = parsed.data;

    const product = await db.product.create({
      data: {
        ...data,
        features,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        productMedia: {
          create: [
            ...(coverMediaId
              ? [
                  {
                    mediaId: coverMediaId,
                    role: ProductMediaRole.COVER,
                    sortOrder: 0,
                    isPrimary: true,
                  },
                ]
              : []),
            ...downloadMediaIds.map((mediaId, index) => ({
              mediaId,
              role: ProductMediaRole.DOWNLOAD,
              sortOrder: index + 1,
            })),
          ],
        },
      },
      include: { productMedia: { include: { media: true } }, category: true },
    });

    await createAuditLog({
      userId: session.id,
      action: "product.create",
      entityType: "Product",
      entityId: product.id,
    });
    return ok(product, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to create product.",
      400,
    );
  }
}
