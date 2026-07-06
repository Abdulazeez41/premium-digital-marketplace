import { NextRequest } from "next/server";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    await requireApiAdminSession();
    const media = await db.media.findUnique({
      where: { id },
      include: { uploadedBy: true },
    });
    if (!media) return fail("Media not found.", 404);
    return ok(media);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    const body = await request.json();
    const media = await db.media.update({
      where: { id },
      data: {
        altText: body.altText || null,
        fileName: body.fileName || undefined,
      },
    });
    await createAuditLog({
      userId: session.id,
      action: "media.update",
      entityType: "Media",
      entityId: id,
    });
    return ok(media);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to update media.",
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
    await db.media.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "media.delete",
      entityType: "Media",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail(
      error instanceof Error ? error.message : "Unable to delete media.",
      400,
    );
  }
}
