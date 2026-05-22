-- ═══════════════════════════════════════════
-- Planxo Quebec — Law 25 Schema Migration
-- ═══════════════════════════════════════════

-- 1. Add Law 25 fields to User table
ALTER TABLE "public"."User" 
  ADD COLUMN IF NOT EXISTS "dataErasureRequested" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dataErasureCompleted" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentGiven" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentGivenAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentPurposes" JSONB,
  ADD COLUMN IF NOT EXISTS "lastPiiAccessAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastPiiAccessBy" TEXT;

-- 2. Consent Records (granular per-purpose opt-in)
CREATE TABLE IF NOT EXISTS "public"."ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ConsentRecord_userId_purpose_key" ON "public"."ConsentRecord"("userId", "purpose");
CREATE INDEX IF NOT EXISTS "ConsentRecord_userId_idx" ON "public"."ConsentRecord"("userId");

-- 3. Audit Log (PII access tracking)
CREATE TABLE IF NOT EXISTS "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "detail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "public"."AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "public"."AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- 4. Data Erasure Requests
CREATE TABLE IF NOT EXISTS "public"."DataErasureRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "DataErasureRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DataErasureRequest_userId_idx" ON "public"."DataErasureRequest"("userId");
CREATE INDEX IF NOT EXISTS "DataErasureRequest_status_idx" ON "public"."DataErasureRequest"("status");

-- 5. Quebec defaults
UPDATE "public"."User" SET "timeZone" = 'America/Toronto' WHERE "timeZone" = 'Europe/London' OR "timeZone" IS NULL;
UPDATE "public"."User" SET "weekStart" = 'Monday' WHERE "weekStart" = 'Sunday';
