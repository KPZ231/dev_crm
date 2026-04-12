import { prisma } from "@/lib/prisma";

type AuditLogParams = {
  action: string;
  entityType?: string;
  entityId?: string;
  workspaceId?: string;
  actorId?: string;
  metadata?: Record<string, any>;
};

/**
 * Creates an immutable audit log entry.
 * Can be used within server actions, services or Prisma extensions.
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        workspaceId: params.workspaceId,
        actorId: params.actorId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });
  } catch (error) {
    // We intentionally don't throw here to prevent audit logging failures 
    // from crashing the primary business transactions.
    console.error("[AUDIT_LOG_ERROR] Failed to save audit log:", error);
  }
}
