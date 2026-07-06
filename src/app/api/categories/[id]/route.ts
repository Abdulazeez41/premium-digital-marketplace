import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { categorySchema } from "@/lib/validators/catalog";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const category = await db.category.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!category) return fail("Category not found.", 404);
  return ok(category);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid category payload.",
        400,
      );

    const category = await db.category.update({
      where: { id },
      data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    });
    await createAuditLog({
      userId: session.id,
      action: "category.update",
      entityType: "Category",
      entityId: id,
    });
    return ok(category);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update category.",
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
    await db.category.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "category.delete",
      entityType: "Category",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to delete category.",
      400,
    );
  }
}
