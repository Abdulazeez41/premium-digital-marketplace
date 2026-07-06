import { NextRequest } from "next/server";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { sendNewsletterNotification } from "@/lib/email/mailer";
import { fail, ok } from "@/lib/http";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

  await createAuditLog({
    action: "newsletter.subscribe",
    entityType: "NewsletterSubscription",
    entityId: parsed.data.email,
    details: parsed.data,
  });
  await sendNewsletterNotification(parsed.data.email);

  return ok({ subscribed: true });
}
