/**
 * Law 25 Right to Erasure — Quebec privacy compliance
 *
 * Handles complete data deletion workflows ("Right to be Forgotten").
 * Purges all user data across related tables while maintaining
 * referential integrity through careful cascade ordering.
 *
 * Usage:
 *   npx ts-node packages/lib/quebec/erase-user.ts --email user@example.com
 */

import { prisma } from "@calcom/prisma";
import { logAudit } from "./audit-logger";

interface ErasureResult {
  userId: number;
  email: string;
  deletedTables: string[];
  errors: string[];
}

export async function eraseUserData(userId: number): Promise<ErasureResult> {
  const result: ErasureResult = {
    userId,
    email: "",
    deletedTables: [],
    errors: [],
  };

  try {
    // Fetch user first
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found`);
    result.email = user.email;

    // Mark erasure as requested
    await prisma.user.update({
      where: { id: userId },
      data: { dataErasureRequested: new Date() },
    });

    // Phase 1: Nullify optional relations (preserve referential integrity)
    const safeNullOps = [
      { table: "user", action: async () => prisma.user.update({
        where: { id: userId },
        data: {
          name: "[supprimé]",
          email: `erased_${userId}@deleted.planxo.ca`,
          bio: null,
          avatarUrl: null,
          username: null,
          metadata: {},
        },
      })},
    ];

    // Phase 2: Delete dependent records (cascade-safe order)
    const deleteOps = [
      { name: "ConsentRecord", fn: () => prisma.consentRecord.deleteMany({ where: { userId } }) },
      { name: "DataErasureRequest", fn: () => prisma.dataErasureRequest.deleteMany({ where: { userId } }) },
      { name: "AuditLog", fn: () => prisma.auditLog.deleteMany({ where: { userId } }) },
      { name: "Session", fn: () => prisma.session.deleteMany({ where: { userId } }) },
      { name: "Account", fn: () => prisma.account.deleteMany({ where: { userId } }) },
      { name: "ApiKey", fn: () => prisma.apiKey.deleteMany({ where: { userId } }) },
      { name: "Webhook", fn: () => prisma.webhook.deleteMany({ where: { userId } }) },
      { name: "VerifiedNumber", fn: () => prisma.verifiedNumber.deleteMany({ where: { userId } }) },
      { name: "VerifiedEmail", fn: () => prisma.verifiedEmail.deleteMany({ where: { userId } }) },
      { name: "SecondaryEmail", fn: () => prisma.secondaryEmail.deleteMany({ where: { userId } }) },
      { name: "AccessCode", fn: () => prisma.accessCode.deleteMany({ where: { userId } }) },
      { name: "SelectedCalendar", fn: () => prisma.selectedCalendar.deleteMany({ where: { userId } }) },
      { name: "OutOfOfficeEntry", fn: () => prisma.outOfOfficeEntry.deleteMany({ where: { userId } }) },
      { name: "DestinationCalendar", fn: () => prisma.destinationCalendar.deleteMany({ where: { userId } }) },
      { name: "TravelSchedule", fn: () => prisma.travelSchedule.deleteMany({ where: { userId } }) },
      { name: "NotificationsSubscriptions", fn: () => prisma.notificationsSubscriptions.deleteMany({ where: { userId } }) },
      { name: "UserFeatures", fn: () => prisma.userFeatures.deleteMany({ where: { userId } }) },
      { name: "FilterSegment", fn: () => prisma.filterSegment.deleteMany({ where: { userId } }) },
      { name: "BookingInternalNote", fn: () => prisma.bookingInternalNote.deleteMany({ where: { userId } }) },
      { name: "Feedback", fn: () => prisma.feedback.deleteMany({ where: { userId } }) },
      { name: "Credential", fn: () => prisma.credential.deleteMany({ where: { userId } }) },
      { name: "Schedule", fn: () => prisma.schedule.deleteMany({ where: { userId } }) },
      { name: "Availability", fn: () => prisma.availability.deleteMany({ where: { userId } }) },
      { name: "Booking", fn: () => prisma.booking.deleteMany({ where: { userId } }) },
      { name: "EventType", fn: () => prisma.eventType.deleteMany({ where: { userId } }) },
      { name: "Membership", fn: () => prisma.membership.deleteMany({ where: { userId } }) },
      { name: "Host", fn: () => prisma.host.deleteMany({ where: { userId } }) },
    ];

    // Execute safe null ops
    for (const op of safeNullOps) {
      try { await op.action(); result.deletedTables.push(op.table); }
      catch (e: any) { result.errors.push(`${op.table}: ${e.message}`); }
    }

    // Execute cascading deletes
    for (const op of deleteOps) {
      try { await op.fn(); result.deletedTables.push(op.name); }
      catch (e: any) { result.errors.push(`${op.name}: ${e.message}`); }
    }

    // Mark erasure as completed
    await prisma.user.update({
      where: { id: userId },
      data: { dataErasureCompleted: new Date() },
    });

    // Log the erasure
    await logAudit({
      userId,
      action: "data_erasure",
      resource: "User",
      resourceId: String(userId),
      detail: `Complete data erasure for ${result.email}. Tables: ${result.deletedTables.join(", ")}`,
    });

  } catch (e: any) {
    result.errors.push(`Fatal: ${e.message}`);
  }

  return result;
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const email = args.find(a => a.startsWith("--email="))?.split("=")[1];

  if (!email) {
    console.log("Usage: npx ts-node erase-user.ts --email=user@example.com [--confirm]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`User: ${user.name} (${user.email})`);
  console.log(`ID: ${user.id}`);

  if (!args.includes("--confirm")) {
    console.log("\n⚠️  Add --confirm to proceed with erasure.");
    process.exit(0);
  }

  console.log("\nProceeding with erasure...");
  const result = await eraseUserData(user.id);

  console.log(`\n✅ Erasure complete`);
  console.log(`   Email: ${result.email}`);
  console.log(`   Tables processed: ${result.deletedTables.length}`);
  if (result.errors.length) {
    console.log(`   Errors: ${result.errors.join("; ")}`);
  }
}

if (require.main === module) {
  main().catch(console.error).finally(() => prisma.$disconnect());
}
