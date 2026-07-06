import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { categorySchema } from "@/lib/validators/catalog";

export async function GET() {
  const categories = await db.category.findMany({
    include: { products: true },
    orderBy: { name: "asc" },
  });
  return ok(categories);
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid category payload.",
        400,
      );

    const category = await db.category.create({
      data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    });
    await createAuditLog({
      userId: session.id,
      action: "category.create",
      entityType: "Category",
      entityId: category.id,
    });
    return ok(category, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to create category.",
      400,
    );
  }
}
