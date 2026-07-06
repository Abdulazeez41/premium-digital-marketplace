import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { homepageContentSchema } from "@/lib/validators/catalog";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  const content = await db.homepageContent.findUnique({ where: { key } });
  if (!content) return fail("Content block not found.", 404);
  return ok(content);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const parsed = homepageContentSchema.safeParse({ ...body, key });
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid homepage payload.",
        400,
      );

    const content = await db.homepageContent.upsert({
      where: { key },
      update: {
        title: parsed.data.title,
        content: parsed.data.content as any,
        status: parsed.data.status,
      },
      create: { ...parsed.data, content: parsed.data.content as any },
    });
    await createAuditLog({
      userId: session.id,
      action: "homepage.update",
      entityType: "HomepageContent",
      entityId: content.id,
    });
    return ok(content);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update content.",
      400,
    );
  }
}
