import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

const schema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  category: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid FAQ payload.",
        400,
      );
    const faq = await db.faq.update({ where: { id }, data: parsed.data });
    await createAuditLog({
      userId: session.id,
      action: "faq.update",
      entityType: "Faq",
      entityId: id,
    });
    return ok(faq);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unable to update FAQ.", 400);
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    await db.faq.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "faq.delete",
      entityType: "Faq",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unable to delete FAQ.", 400);
  }
}
