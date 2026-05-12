import { prisma } from "@/lib/prisma";

interface LogParams {
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}

export async function logAction(params: LogParams) {
  try {
    await prisma.log.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || null,
      },
    });
  } catch {
    // No interrumpir la operación principal si falla el log
  }
}
