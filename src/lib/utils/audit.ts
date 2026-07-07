import { getDb } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

type AuditAction = "create" | "update" | "delete" | "login" | "logout";

export async function logAudit(
  userId: string,
  action: AuditAction,
  resourceType?: string,
  resourceId?: string,
  changes?: Record<string, unknown>,
): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO audit_logs (id, action, user_id, resource_type, resource_id, changes, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        action,
        userId,
        resourceType ?? null,
        resourceId ?? null,
        changes ? JSON.stringify(changes) : null,
        null,
        new Date().toISOString(),
      )
      .run();
  } catch (error) {
    logger.error("Audit log write failed", error instanceof Error ? error : undefined, {
      userId,
      action,
      resourceType,
      resourceId,
    });
  }
}
