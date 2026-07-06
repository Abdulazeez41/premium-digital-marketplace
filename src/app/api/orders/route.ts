import { requireApiSession } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function GET() {
  try {
    const session = await requireApiSession();
    const orders = await db.order.findMany({
      where: session.role === "ADMIN" ? {} : { userId: session.id },
      include: {
        items: { include: { product: true } },
        payments: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(orders);
  } catch (error) {
    if (error instanceof Response) return error;
    return fail("Unauthorized", 401);
  }
}
