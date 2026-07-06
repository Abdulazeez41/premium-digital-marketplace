import { NextRequest } from "next/server";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getEnv } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { sendReceiptEmail } from "@/lib/email/mailer";
import { sendContactNotification } from "@/lib/email/mailer";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message || "Invalid request.", 400);

  await createAuditLog({
    action: "contact.submit",
    entityType: "ContactMessage",
    entityId: parsed.data.email,
    details: parsed.data,
  });

  const env = getEnv();
  await sendReceiptEmail(env.SUPPORT_EMAIL, `CONTACT-${Date.now()}`);
  await sendContactNotification(parsed.data);

  return ok({ submitted: true });
}
