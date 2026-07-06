import { getSession } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  return ok(session);
}
