import { requireApiAdminSession } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET() {
  try {
    await requireApiAdminSession();
    const users = await db.user.findMany({
      include: { orders: true, downloads: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(users);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}
