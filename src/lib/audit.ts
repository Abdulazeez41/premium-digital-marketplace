import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
export async function createAuditLog(input: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
    },
  });
}
