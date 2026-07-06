import { ProductMediaRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { productSchema } from "@/lib/validators/catalog";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      productMedia: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      course: { include: { lessons: { orderBy: { position: "asc" } } } },
    },
  });
  if (!product) return fail("Product not found.", 404);
  return ok(product);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
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

    await db.productMedia.deleteMany({ where: { productId: id } });

    const product = await db.product.update({
      where: { id },
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
      include: { category: true, productMedia: { include: { media: true } } },
    });

    await createAuditLog({
      userId: session.id,
      action: "product.update",
      entityType: "Product",
      entityId: id,
    });
    return ok(product);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update product.",
      400,
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    await db.product.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "product.delete",
      entityType: "Product",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to delete product.",
      400,
    );
  }
}
