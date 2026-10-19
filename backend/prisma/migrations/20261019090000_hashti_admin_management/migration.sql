-- Hashti admin permissions and immutable management audit history.
-- This migration is committed as a versioned artifact; it is not executed by this change.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "adminPermissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "targetUserId" TEXT,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_targetType_targetId_createdAt_idx"
  ON "admin_audit_logs"("targetType", "targetId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_actorUserId_createdAt_idx"
  ON "admin_audit_logs"("actorUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_createdAt_idx"
  ON "admin_audit_logs"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "users_single_super_admin_idx"
  ON "users"("isSuperAdmin") WHERE "isSuperAdmin" = true;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_logs_actorUserId_fkey') THEN
    ALTER TABLE "admin_audit_logs"
      ADD CONSTRAINT "admin_audit_logs_actorUserId_fkey"
      FOREIGN KEY ("actorUserId") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_logs_targetUserId_fkey') THEN
    ALTER TABLE "admin_audit_logs"
      ADD CONSTRAINT "admin_audit_logs_targetUserId_fkey"
      FOREIGN KEY ("targetUserId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
