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

export async function GET() {
  const faqs = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return ok(faqs);
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiAdminSession();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return fail(
        parsed.error.issues[0]?.message || "Invalid FAQ payload.",
        400,
      );
    const faq = await db.faq.create({ data: parsed.data });
    await createAuditLog({
      userId: session.id,
      action: "faq.create",
      entityType: "Faq",
      entityId: faq.id,
    });
    return ok(faq, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unable to create FAQ.", 400);
  }
}
