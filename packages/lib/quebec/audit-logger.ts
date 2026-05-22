/**
 * Law 25 Audit Logger — Quebec privacy compliance
 *
 * Logs all PII access, data operations, and consent changes.
 * Called automatically by consent handlers and data access middleware.
 */

import { prisma } from "@calcom/prisma";

type AuditAction =
  | "pii_read"
  | "pii_write"
  | "data_export"
  | "data_erasure"
  | "consent_change"
  | "booking_access";

interface AuditEntry {
  userId?: number;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
  performedBy?: string;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        detail: entry.detail ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        performedBy: entry.performedBy ?? "system",
      },
    });
  } catch (e) {
    // Never crash on audit failure — log to console as fallback
    console.error("[AuditLog] Failed to persist audit entry:", e, entry);
  }
}

/**
 * Convenience: Log PII access and update User.lastPiiAccessAt
 */
export async function logPiiAccess(
  userId: number,
  resource: string,
  resourceId?: string,
  detail?: string,
  meta?: { ipAddress?: string; userAgent?: string; performedBy?: string }
): Promise<void> {
  await Promise.allSettled([
    logAudit({
      userId,
      action: "pii_read",
      resource,
      resourceId,
      detail,
      ...meta,
    }),
    prisma.user
      .update({
        where: { id: userId },
        data: {
          lastPiiAccessAt: new Date(),
          lastPiiAccessBy: meta?.performedBy ?? "system",
        },
      })
      .catch(() => {}),
  ]);
}
