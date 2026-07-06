import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiAdminSession } from "@/lib/auth/api";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

const schema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  company: z.string().optional().nullable(),
  quote: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().optional().nullable(),
  featured: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
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
        parsed.error.issues[0]?.message || "Invalid testimonial payload.",
        400,
      );
    const testimonial = await db.testimonial.update({
      where: { id },
      data: parsed.data,
    });
    await createAuditLog({
      userId: session.id,
      action: "testimonial.update",
      entityType: "Testimonial",
      entityId: id,
    });
    return ok(testimonial);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unable to update testimonial.", 400);
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const session = await requireApiAdminSession();
    await db.testimonial.delete({ where: { id } });
    await createAuditLog({
      userId: session.id,
      action: "testimonial.delete",
      entityType: "Testimonial",
      entityId: id,
    });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unable to delete testimonial.", 400);
  }
}
